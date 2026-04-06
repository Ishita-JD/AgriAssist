const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

// Main Advisory API Endpoint
app.get('/api/advisory', async (req, res) => {
    const { city, crop, lat, lon } = req.query;

    try {
        let latitude = lat;
        let longitude = lon;
        let locationName = city || 'Your Location';

        // 1. Geocoding if city is provided and no lat/lon
        if (city && (!lat || !lon)) {
            try {
                const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
                const geoRes = await fetch(geoUrl, {
                    headers: { 'User-Agent': 'AgriAssist-Server/1.0' },
                    signal: AbortSignal.timeout(8000)
                });
                const geoData = await geoRes.json();

                if (!geoData || geoData.length === 0) {
                    return res.status(404).json({ error: `Location "${city}" not found. Try a different city name.` });
                }
                latitude = geoData[0].lat;
                longitude = geoData[0].lon;
                locationName = geoData[0].display_name.split(',').slice(0, 3).join(', ');
            } catch (geoErr) {
                console.error('Geocoding failed:', geoErr.message);
                return res.status(503).json({ error: 'Location lookup failed. Please check your internet connection and try again.' });
            }
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Please provide a city name or enable location access.' });
        }

        // 2. Fetch Weather from Open-Meteo (free, no key needed)
        let current;
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&timezone=auto`;
            const weatherRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(10000) });
            const weatherData = await weatherRes.json();
            current = weatherData.current;

            if (!current) {
                return res.status(502).json({ error: 'Weather service returned invalid data. Please try again.' });
            }
        } catch (weatherErr) {
            console.error('Weather fetch failed:', weatherErr.message);
            return res.status(503).json({ error: 'Weather service is unavailable. Please try again in a moment.' });
        }

        // 3. Fetch Advanced Soil Data (optional, fails silently)
        let advancedSoil = null;
        try {
            const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=phh2o&property=nitrogen&property=clay&property=sand&depth=0-5cm&value=mean`;
            const soilRes = await fetch(soilUrl, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'AgriAssist-Server/1.0' },
                signal: AbortSignal.timeout(12000)
            });
            if (soilRes.ok) {
                const soilData = await soilRes.json();
                if (soilData.properties && soilData.properties.layers) {
                    const props = soilData.properties.layers;
                    advancedSoil = {
                        ph: (props.find(l => l.name?.includes('phh2o'))?.depths[0]?.values?.mean / 10) || 'N/A',
                        nitrogen: props.find(l => (l.name?.includes('nitrogen') || l.label?.toLowerCase()?.includes('nitrogen')))?.depths[0]?.values?.mean || 'N/A',
                        clay: (props.find(l => l.name?.includes('clay'))?.depths[0]?.values?.mean / 10) || 'N/A',
                        sand: (props.find(l => l.name?.includes('sand'))?.depths[0]?.values?.mean / 10) || 'N/A'
                    };
                }
            }
        } catch (soilErr) {
            console.warn('SoilGrids API unavailable (non-critical):', soilErr.message);
        }

        // 4. Generate AI Advice (optional, fails silently and uses fallback)
        const targetCrop = crop || 'General Season Crops';
        const apiKey = process.env.VITE_OPENAI_API_KEY;
        let aiAdvice = null;

        if (apiKey && apiKey !== 'your_openai_api_key_here') {
            const prompt = `You are an expert agricultural advisor. Analyze these real-time conditions and provide farming advice.

Location weather data:
- Temperature: ${current.temperature_2m}°C
- Humidity: ${current.relative_humidity_2m}%
- Wind Speed: ${current.wind_speed_10m} km/h
- Currently: ${current.precipitation > 0 ? 'Raining' : 'Dry'}
- Soil Temperature: ${current.soil_temperature_0_to_7cm}°C
- Soil Moisture: ${Math.round(current.soil_moisture_0_to_7cm * 100)}%
${advancedSoil ? `- Soil pH: ${advancedSoil.ph}, Nitrogen: ${advancedSoil.nitrogen} cg/kg, Clay: ${advancedSoil.clay}%, Sand: ${advancedSoil.sand}%` : ''}

Crop focus: ${targetCrop === 'General Season Crops' ? 'Suggest the top 3 best crops for these conditions' : `"${targetCrop}" (user specified)`}

Respond with ONLY a valid JSON object, no markdown, no extra text:
{
  "crop": "crop name",
  "suggestions": ["crop1", "crop2", "crop3"],
  "suitability": "Highly Suitable / Moderately Suitable / Low Suitability",
  "irrigation": "specific irrigation advice",
  "tempAlert": "Normal / Caution: high temp / Alert: frost risk",
  "windAlert": "Normal / Caution: high winds",
  "tips": "one key actionable tip",
  "fertilizer": "specific NPK or organic fertilizer advice",
  "diseaseRisk": "Low / Moderate: risk name / High: risk name",
  "roadmap": ["immediate action 1", "this week action 2", "this month action 3"],
  "naturalAdvice": "2-3 sentence friendly summary for the farmer"
}`;

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini', // faster and cheaper than gpt-4o
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' },
                        temperature: 0.7
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    const content = aiData.choices?.[0]?.message?.content;
                    if (content) {
                        aiAdvice = JSON.parse(content);
                        console.log(`✅ AI advice generated for ${targetCrop} at ${locationName}`);
                    }
                } else {
                    const errData = await aiRes.json().catch(() => ({}));
                    console.warn(`⚠️ OpenAI API error (${aiRes.status}): ${errData?.error?.message || 'unknown'}. Using fallback logic.`);
                }
            } catch (aiErr) {
                if (aiErr.name === 'AbortError') {
                    console.warn('⚠️ OpenAI request timed out. Using fallback logic.');
                } else {
                    console.warn('⚠️ OpenAI call failed:', aiErr.message, '— Using fallback logic.');
                }
            }
        } else {
            console.log('ℹ️ No valid OpenAI key found. Using smart fallback logic.');
        }

        // 5. Build and send response — ALWAYS succeeds
        const responseData = {
            weather: {
                name: locationName,
                lat: latitude,
                lon: longitude,
                temp: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                precipitation: current.precipitation,
                weatherCode: current.weather_code,
                soilTemp: current.soil_temperature_0_to_7cm,
                soilMoisture: current.soil_moisture_0_to_7cm,
                advancedSoil,
                isRaining: current.precipitation > 0
            },
            recommendations: aiAdvice || smartFallback(current, advancedSoil, targetCrop),
            usingAI: !!aiAdvice
        };

        console.log(`✅ Advisory served for "${locationName}" — AI: ${!!aiAdvice}`);
        res.json(responseData);

    } catch (error) {
        console.error('Unexpected server error:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
});

// Smart Fallback Logic (data-driven, no AI needed)
function smartFallback(current, advancedSoil, targetCrop) {
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const soilMoisture = current.soil_moisture_0_to_7cm;
    const windSpeed = current.wind_speed_10m;
    const isRaining = current.precipitation > 0;

    // Crop suggestions based on temperature
    let suggestedCrops = ['Wheat', 'Mustard', 'Chickpea'];
    if (temp >= 25 && temp <= 35) suggestedCrops = ['Rice', 'Maize', 'Cotton'];
    else if (temp >= 20 && temp < 25) suggestedCrops = ['Tomato', 'Potato', 'Onion'];
    else if (temp < 15) suggestedCrops = ['Wheat', 'Barley', 'Peas'];

    const crop = targetCrop === 'General Season Crops' ? suggestedCrops[0] : targetCrop;

    // Suitability
    const suitability = (temp >= 15 && temp <= 35 && humidity >= 40 && humidity <= 80)
        ? 'Moderately Suitable' : temp > 35 ? 'Low Suitability (heat stress)' : 'Moderately Suitable';

    // Irrigation
    let irrigation = 'Monitor soil moisture daily.';
    if (soilMoisture < 0.15) irrigation = '⚠️ Immediate irrigation needed — soil is very dry.';
    else if (soilMoisture < 0.25) irrigation = 'Irrigate within 2 days — soil moisture is low.';
    else if (isRaining) irrigation = 'Skip irrigation today — natural rainfall is sufficient.';
    else if (soilMoisture > 0.4) irrigation = 'Good soil moisture — irrigate only if no rain for 3+ days.';

    // Temperature risk
    let tempAlert = 'Normal';
    if (temp > 38) tempAlert = 'Alert: Severe heat stress — apply shade & extra water.';
    else if (temp > 35) tempAlert = 'Caution: High temperature — consider shade nets & drip irrigation.';
    else if (temp < 10) tempAlert = 'Caution: Cold stress risk — consider frost protection overnight.';

    // Disease risk
    let diseaseRisk = 'Low';
    if (humidity > 80 && temp > 20) diseaseRisk = 'Moderate: Fungal disease risk (blight, mildew) — monitor leaves.';
    else if (humidity > 90) diseaseRisk = 'High: Very high humidity — spray preventive fungicide.';

    // Fertilizer
    let fertilizer = 'Apply balanced NPK (10:26:26) at recommended dosage.';
    if (advancedSoil?.nitrogen && advancedSoil.nitrogen < 50) fertilizer = 'Nitrogen deficient — apply Urea (46-0-0) @ 50 kg/acre.';
    else if (isRaining) fertilizer = 'Delay fertilizer application — rain may cause runoff and waste.';

    // Wind
    const windAlert = windSpeed > 30 ? 'Caution: Strong winds — delay spraying and protect seedlings.'
        : windSpeed > 20 ? 'Moderate winds — avoid overhead irrigation.'
        : 'Normal';

    // Roadmap
    const roadmap = [
        soilMoisture < 0.2 ? 'Irrigate fields immediately (soil moisture critical)' : 'Check irrigation schedule for the week',
        humidity > 80 ? 'Inspect crops for early signs of fungal disease' : 'Apply scheduled fertilizer dose',
        temp > 35 ? 'Install shade nets to reduce heat stress on crops' : 'Prepare for next planting cycle if near harvest'
    ];

    return {
        crop,
        suggestions: suggestedCrops,
        suitability,
        irrigation,
        tempAlert,
        windAlert,
        tips: `At ${Math.round(temp)}°C with ${humidity}% humidity, focus on ${humidity > 70 ? 'disease prevention' : 'moisture management'}.`,
        fertilizer,
        diseaseRisk,
        roadmap,
        naturalAdvice: `Based on live data: temperature is ${Math.round(temp)}°C with ${humidity}% humidity. ${soilMoisture < 0.2 ? 'Your soil needs water urgently.' : isRaining ? 'Rainfall is helping your crops today.' : 'Soil moisture levels look acceptable.'} ${diseaseRisk.startsWith('High') || diseaseRisk.startsWith('Moderate') ? 'Watch for disease signs in the coming days.' : 'Overall conditions are manageable — keep monitoring daily.'}`
    };
}

app.listen(PORT, () => {
    console.log(`✅ AgriAssist Server running on port ${PORT}`);
    console.log(`   OpenAI: ${process.env.VITE_OPENAI_API_KEY && process.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here' ? '🟢 Key found' : '🟡 No key — using smart fallback'}`);
});
