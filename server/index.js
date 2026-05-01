const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const { generateAdvisory } = require('./utils/advisoryEngine');
const { calculateRisk } = require('./utils/riskEngine');

dotenv.config({ path: path.join(__dirname, '../.env') });

let Message;
try {
    Message = require('./models/Message');
} catch (e) {
    console.warn('Could not load Message model. Make sure it exists in ./models/Message.js', e.message);
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

async function fetchWeatherData(district) {
    try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&count=1&language=en&format=json`;
        const geocodeRes = await fetch(geocodeUrl, { signal: AbortSignal.timeout(8000) });

        if (!geocodeRes.ok) {
            throw new Error('Geocoding request failed');
        }

        const geocodeData = await geocodeRes.json();
        const location = geocodeData.results?.[0];

        if (!location) {
            return {
                temperature: null,
                rain: null,
                wind: null,
                fallback: true,
                error: 'Location not found.'
            };
        }

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m&hourly=precipitation_probability&timezone=auto`;
        const weatherRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(8000) });

        if (!weatherRes.ok) {
            throw new Error('Weather request failed');
        }

        const weatherData = await weatherRes.json();
        const current = weatherData.current;
        const rainProb = weatherData.hourly?.precipitation_probability?.[0] ?? 0;

        if (!current) {
            throw new Error('Invalid weather data');
        }

        return {
            temperature: current.temperature_2m,
            rain: rainProb,
            wind: current.wind_speed_10m
        };
    } catch (error) {
        console.error('Weather API error:', error.message);
        return {
            temperature: null,
            rain: null,
            wind: null,
            fallback: true
        };
    }
}

async function fetchMandiData(crop) {
    try {
        const apiKey = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        const mandiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=10&filters[commodity]=${encodeURIComponent(crop)}`;
        const mandiRes = await fetch(mandiUrl, { signal: AbortSignal.timeout(10000) });

        if (!mandiRes.ok) {
            throw new Error('Mandi request failed');
        }

        const mandiData = await mandiRes.json();
        const prices = (mandiData.records || [])
            .map((record) => Number(record.modal_price))
            .filter((price) => Number.isFinite(price));

        if (prices.length === 0) {
            return {
                crop,
                averagePrice: null,
                trend: 'stable',
                fallback: true
            };
        }

        const averagePrice = Math.round(
            prices.reduce((sum, price) => sum + price, 0) / prices.length
        );

        const getTimestamp = (record) => {
            const rawDate = record.arrival_date || record.date || record.timestamp || record.mandi_date || '';
            const ts = new Date(rawDate).getTime();
            return Number.isFinite(ts) ? ts : 0;
        };

        const sortedRecords = (mandiData.records || [])
            .filter((record) => Number.isFinite(Number(record.modal_price)))
            .sort((a, b) => getTimestamp(a) - getTimestamp(b));

        const sortedPrices = sortedRecords.map((record) => Number(record.modal_price));

        let trend = 'stable';
        if (sortedPrices.length > 1) {
            const increasing = sortedPrices.every((price, index) => index === 0 || price >= sortedPrices[index - 1]) &&
                sortedPrices.some((price, index) => index > 0 && price > sortedPrices[index - 1]);

            const decreasing = sortedPrices.every((price, index) => index === 0 || price <= sortedPrices[index - 1]) &&
                sortedPrices.some((price, index) => index > 0 && price < sortedPrices[index - 1]);

            if (increasing) {
                trend = 'up';
            } else if (decreasing) {
                trend = 'down';
            }
        }

        return {
            crop,
            averagePrice,
            trend
        };
    } catch (error) {
        console.error('Mandi API error:', error.message);
        return {
            crop,
            averagePrice: null,
            trend: 'stable',
            fallback: true
        };
    }
}

if (process.env.MONGODB_URI) {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.log('No MONGODB_URI found in .env, skipping MongoDB connection.');
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        if (Message) {
            const newMessage = await Message.create({ name, email, subject, message });
            return res.status(201).json({ success: true, data: newMessage });
        }

        console.log('Mock saved msg:', { name, email, subject, message });
        return res.status(201).json({ success: true, data: { name, email, subject, message } });
    } catch (err) {
        console.error('Error saving message:', err);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

app.get('/api/contact', async (req, res) => {
    try {
        if (Message) {
            const messages = await Message.find().sort({ createdAt: -1 });
            return res.json({ success: true, data: messages });
        }

        return res.json({ success: true, data: [] });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

app.get('/api/weather', async (req, res) => {
    const district = req.query.district?.trim();

    if (!district) {
        return res.status(400).json({ error: 'District is required.' });
    }

    const weather = await fetchWeatherData(district);

    if (weather.error === 'Location not found.') {
        return res.status(404).json({ error: 'Location not found.' });
    }

    return res.json(weather);
});

app.get('/api/mandi', async (req, res) => {
    const crop = req.query.crop?.trim();

    if (!crop) {
        return res.status(400).json({ error: 'Crop is required.' });
    }

    const market = await fetchMandiData(crop);
    return res.json(market);
});

app.get('/api/advisory', async (req, res) => {
    const district = req.query.district?.trim();
    const crop = req.query.crop?.trim();
    const soilType = req.query.soilType?.trim();

    if (!district || !crop || !soilType) {
        return res.status(400).json({ error: 'District, crop, and soilType are required.' });
    }

    try {
        const weather = await fetchWeatherData(district);
        const market = await fetchMandiData(crop);
        const advisory = generateAdvisory({
            weather: { rain: weather.rain, wind: weather.wind },
            marketTrend: market.trend,
            soilType,
            crop
        });
        const risk = calculateRisk({
            weather: { rain: weather.rain, wind: weather.wind },
            marketTrend: market.trend,
            soilType,
            crop
        });

        return res.json({
            weather,
            market,
            advisory,
            risk
        });
    } catch (error) {
        console.error('Advisory API error:', error.message);

        const weather = {
            temperature: null,
            rain: null,
            wind: null,
            fallback: true
        };
        const market = {
            crop,
            averagePrice: null,
            trend: 'stable',
            fallback: true
        };
        const advisory = generateAdvisory({
            weather: { rain: weather.rain, wind: weather.wind },
            marketTrend: market.trend,
            soilType,
            crop
        });
        const risk = calculateRisk({
            weather: { rain: weather.rain, wind: weather.wind },
            marketTrend: market.trend,
            soilType,
            crop
        });

        return res.json({
            weather,
            market,
            advisory,
            risk
        });
    }
});

app.listen(PORT, () => {
    console.log(`AgriAssist Server running on port ${PORT}`);
});
