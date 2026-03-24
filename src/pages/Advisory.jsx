import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Wind, Thermometer, Droplets, Sprout, Search, MapPin, AlertTriangle, Loader, Waves } from 'lucide-react';

const Advisory = () => {
    const [city, setCity] = useState('');
    const [cropInput, setCropInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);

    const fetchWeather = async (searchCity) => {
        const targetCity = searchCity || city;

        if (!targetCity) {
            setError("Please enter a city or use your location.");
            return;
        }

        setLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            // Step 1: Geocode using Nominatim (OpenStreetMap) for granular village/hamlet support
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetCity)}&format=json&limit=1`, {
                headers: {
                    'User-Agent': 'AgriAssist-App/1.0'
                }
            });
            const geoData = await geoResponse.json();

            if (!geoData || geoData.length === 0) {
                throw new Error("Location not found. Please try adding a district or state name (e.g. 'Village Name, District').");
            }

            const { lat, lon, display_name } = geoData[0];
            const locationName = display_name.split(',').slice(0, 4).join(', '); // Clean up overly long names

            // Step 2: Fetch Live Weather & Soil Statistics using Open-Meteo
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&hourly=temperature_2m,precipitation_probability,rain&timezone=auto`);

            if (!weatherResponse.ok) throw new Error("Weather service is temporarily unavailable.");

            const data = await weatherResponse.json();
            const current = data.current;

            // Step 3: Fetch Advanced Soil Properties from SoilGrids (ISRIC)
            let advancedSoil = null;
            try {
                const soilResponse = await fetch(`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=clay&property=sand&depth=0-5cm&value=mean`);
                if (soilResponse.ok) {
                    const soilData = await soilResponse.json();
                    const props = soilData.properties.layers;
                    advancedSoil = {
                        ph: props.find(l => l.name === 'phh2o')?.depths[0]?.values?.mean / 10 || "N/A",
                        nitrogen: props.find(l => (l.name === 'nitrogen' || l.label?.toLowerCase()?.includes('nitrogen')))?.depths[0]?.values?.mean || "N/A",
                        clay: props.find(l => l.name === 'clay')?.depths[0]?.values?.mean / 10 || "N/A", // convert g/kg to %
                        sand: props.find(l => l.name === 'sand')?.depths[0]?.values?.mean / 10 || "N/A"
                    };
                }
            } catch (e) {
                console.error("SoilGrids fetch failed", e);
            }

            const formattedData = {
                name: locationName,
                lat, lon,
                temp: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                precipitation: current.precipitation,
                weatherCode: current.weather_code,
                soilTemp: current.soil_temperature_0_to_7cm,
                soilMoisture: current.soil_moisture_0_to_7cm,
                advancedSoil,
                isRaining: current.rain > 0 || current.showers > 0
            };

            setWeatherData(formattedData);
            generateRecommendations(formattedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchByLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // Reverse geocode would be nice, but for now we'll just fetch by coordinates directly
                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&timezone=auto`);
                const data = await weatherResponse.json();
                const current = data.current;

                // Step 3: Fetch Advanced Soil Properties from SoilGrids (ISRIC)
                let advancedSoil = null;
                try {
                    const soilResponse = await fetch(`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=phh2o&property=nitrogen&property=clay&property=sand&depth=0-5cm&value=mean`);
                    if (soilResponse.ok) {
                        const soilData = await soilResponse.json();
                        const props = soilData.properties.layers;
                        advancedSoil = {
                            ph: props.find(l => l.name === 'phh2o')?.depths[0]?.values?.mean / 10 || "N/A",
                            nitrogen: props.find(l => (l.name === 'nitrogen' || l.label?.toLowerCase()?.includes('nitrogen')))?.depths[0]?.values?.mean || "N/A",
                            clay: props.find(l => l.name === 'clay')?.depths[0]?.values?.mean / 10 || "N/A",
                            sand: props.find(l => l.name === 'sand')?.depths[0]?.values?.mean / 10 || "N/A"
                        };
                    }
                } catch (e) {
                    console.error("SoilGrids fetch failed", e);
                }

                const formattedData = {
                    name: "Current Location",
                    lat: latitude, lon: longitude,
                    temp: current.temperature_2m,
                    humidity: current.relative_humidity_2m,
                    windSpeed: current.wind_speed_10m,
                    precipitation: current.precipitation,
                    weatherCode: current.weather_code,
                    soilTemp: current.soil_temperature_0_to_7cm,
                    soilMoisture: current.soil_moisture_0_to_7cm,
                    advancedSoil,
                    isRaining: current.rain > 0 || current.showers > 0
                };

                setWeatherData(formattedData);
                generateRecommendations(formattedData);
            } catch (err) {
                setError("Failed to fetch weather for your location.");
            } finally {
                setLoading(false);
            }
        }, () => {
            setError("Unable to retrieve your location.");
            setLoading(false);
        });
    };

    const generateRecommendations = (data) => {
        const { temp, humidity, windSpeed, isRaining, soilTemp, soilMoisture, advancedSoil } = data;
        const currentMonth = new Date().getMonth();
        const targetCrop = cropInput.toLowerCase().trim();

        let recs = {
            crop: targetCrop ? cropInput : "General Crops",
            suitability: "Unknown",
            irrigation: "Standard schedule recommended.",
            tempAlert: "Normal range.",
            windAlert: "Light breeze.",
            rainfall: isRaining ? "Ongoing precipitation." : "Dry conditions.",
            tips: "",
            soilStatus: `Soil at ${soilTemp}°C with ${Math.round(soilMoisture * 100)}% moisture.`,
            fertilizer: "Maintain standard organic manuring.",
            diseaseRisk: "Low Risk",
            roadmap: ["Monitor soil moisture regularly", "Check for site-specific pests"]
        };

        // Basic Crop Database
        const cropData = {
            rice: { minTemp: 20, maxTemp: 35, minHum: 70, minSoilTemp: 18, idealPh: [5.5, 7.0], nLevel: 80, tips: "Requires standing water." },
            wheat: { minTemp: 10, maxTemp: 25, minHum: 30, minSoilTemp: 12, idealPh: [6.0, 7.5], nLevel: 60, tips: "Ideal for cool weather." },
            maize: { minTemp: 18, maxTemp: 32, minHum: 50, minSoilTemp: 15, idealPh: [5.8, 7.2], nLevel: 70, tips: "Maintain consistent moisture." },
            sugarcane: { minTemp: 20, maxTemp: 40, minHum: 60, minSoilTemp: 20, idealPh: [6.0, 8.0], nLevel: 120, tips: "Heavy nitrogen required." },
            cotton: { minTemp: 20, maxTemp: 35, minHum: 40, minSoilTemp: 18, idealPh: [5.5, 8.5], nLevel: 50, tips: "High heat tolerant." }
        };

        if (targetCrop && cropData[targetCrop]) {
            const crop = cropData[targetCrop];
            let score = 0;
            if (temp >= crop.minTemp && temp <= crop.maxTemp) score += 20;
            if (humidity >= crop.minHum) score += 20;
            if (soilTemp >= crop.minSoilTemp) score += 30;

            if (advancedSoil && advancedSoil.ph !== "N/A") {
                if (advancedSoil.ph >= crop.idealPh[0] && advancedSoil.ph <= crop.idealPh[1]) score += 30;
                else score += 10;
            } else score += 20;

            recs.suitability = score >= 90 ? "Highly Suitable" : score >= 60 ? "Moderately Suitable" : "Low Suitability";
            recs.tips = crop.tips;

            // Fertilizer Action
            if (advancedSoil && advancedSoil.nitrogen !== "N/A") {
                if (advancedSoil.nitrogen < crop.nLevel) {
                    recs.fertilizer = `Nitrogen deficiency detected (${advancedSoil.nitrogen} cg/kg). Apply Urea or NPK (20:20:20).`;
                    recs.roadmap.push("Apply Nitrogen-rich fertilizer this week");
                } else {
                    recs.fertilizer = "Nitrogen levels are sufficient for current growth stage.";
                }
            }

            // Disease Risk Action
            if (humidity > 85) {
                recs.diseaseRisk = "CRITICAL: High Fungal Risk (Blight/Mildew)";
                recs.roadmap.push("Spray preventive fungicide (e.g. Copper Oxychloride)");
            }

            // Adjust irrigation based on soil moisture
            if (soilMoisture > 0.4) {
                recs.irrigation = "Soil is saturated. Suspend irrigation.";
            } else if (soilMoisture < 0.15) {
                recs.irrigation = "Critical Soil Dryness! Immediate deep watering required.";
                recs.roadmap.push("Irrigate field immediately for 4-6 hours");
            }

        } else if (targetCrop) {
            recs.suitability = (temp > 15 && temp < 35 && soilTemp > 12) ? "Potentially Suitable" : "Check Local Varieties";
            recs.tips = "Soil temp is currently " + soilTemp + "°C, which affects germination speed.";
        } else {
            if (currentMonth >= 5 && currentMonth <= 9) {
                recs.crop = humidity > 70 ? "Rice or Sugarcane" : "Maize or Cotton";
            } else {
                recs.crop = temp < 15 ? "Wheat or Barley" : "Pulses or Sunflower";
            }
            recs.suitability = "Recommended for Season";
            recs.tips = "Based on current ground moisture of " + Math.round(soilMoisture * 100) + "%.";
            // Generic Roadmap
            if (isRaining) recs.roadmap.push("Ensure proper field drainage to avoid root rot");
            if (temp > 35) recs.roadmap.push("Add organic mulch to retain soil moisture");
        }

        // Real-Time Alerts
        if (temp > 38) recs.tempAlert = "Extreme Heatwave! Immediate hydration needed.";
        if (soilTemp > 35) recs.tempAlert = "Root Heat Stress! Protect field with mulch.";
        if (temp < 5) recs.tempAlert = "Frost Risk! Protect young shoots.";
        if (windSpeed > 35) recs.windAlert = "High Winds! Secure farm infrastructure.";

        setRecommendations(recs);
    };


    const getWeatherDescription = (code) => {
        // WMO Weather interpretation codes (WW)
        if (code === 0) return "Clear sky";
        if (code <= 3) return "Partly cloudy";
        if (code <= 48) return "Foggy conditions";
        if (code <= 67) return "Rainy weather";
        if (code <= 77) return "Snowfall";
        if (code <= 99) return "Thunderstorms";
        return "Overcast";
    };


    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>

            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                height: '400px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(10,31,18,0.85) 0%, rgba(20,83,45,0.70) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌾</div>
                    <h1 className="hero-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>Crop Advisory</h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto' }}>
                        Live climate data and real-time farming suggestions.
                    </p>

                </div>
            </div>

            {/* Search Section */}
            <div style={{ maxWidth: '800px', margin: '-40px auto 4rem', position: 'relative', zIndex: 10, padding: '0 2rem' }}>
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '2rem',
                    borderRadius: '20px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <MapPin style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                            <input
                                type="text"
                                placeholder="Location (Village/City)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem 1rem 3rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <Sprout style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                            <input
                                type="text"
                                placeholder="Crop Name (e.g. Rice, Wheat)"
                                value={cropInput}
                                onChange={(e) => setCropInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem 1rem 3rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => fetchWeather()}
                            disabled={loading}
                            className="btn-main"
                            style={{ padding: '0 2rem', minHeight: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                            Get Analysis
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: '1.5rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                {!weatherData && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🌐</div>
                        <h3>Connect to real-time data</h3>
                        <p>Search your location to see live weather reports and farming advisory.</p>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <Loader className="animate-spin" size={48} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Connecting to global weather network...</p>
                    </div>
                )}


                {weatherData && !loading && (
                    <div className="fade-in">
                        {/* Weather Overview */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 83, 45, 0.05) 100%)',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            marginBottom: '3rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '2rem'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{weatherData.name}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', textTransform: 'capitalize' }}>
                                    {getWeatherDescription(weatherData.weatherCode)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Thermometer size={32} style={{ color: '#fbbf24', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{Math.round(weatherData.temp)}°C</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Live Temp</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Droplets size={32} style={{ color: '#60a5fa', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{weatherData.humidity}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rel. Humidity</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Wind size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{weatherData.windSpeed} km/h</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Wind Flow</div>
                                </div>
                            </div>

                        </div>

                        {/* Advisory Cards */}
                        <div className="feature-grid">
                            <div className="feature-card" style={{ borderTop: '4px solid #10b981' }}>
                                <div className="feature-icon"><Sprout size={32} style={{ color: '#10b981' }} /></div>
                                <h3>Crop Suitability</h3>
                                <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.2rem' }}>{recommendations?.crop}</p>
                                <p style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{recommendations?.suitability}</p>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{recommendations?.tips}</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #3b82f6' }}>
                                <div className="feature-icon"><Waves size={32} style={{ color: '#3b82f6' }} /></div>
                                <h3>Irrigation Advice</h3>
                                <p style={{ color: '#fff', marginBottom: '0.5rem' }}>{recommendations?.irrigation}</p>
                                <p>Live monitoring at {weatherData.humidity}% humidity.</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #f59e0b' }}>
                                <div className="feature-icon"><Thermometer size={32} style={{ color: '#f59e0b' }} /></div>
                                <h3>Temperature Risk</h3>
                                <p style={{ color: recommendations?.tempAlert.includes('Normal') ? '#fff' : '#fcd34d' }}>
                                    {recommendations?.tempAlert}
                                </p>
                                <p>Current station reading: {Math.round(weatherData.temp)}°C</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #ef4444' }}>
                                <div className="feature-icon"><Droplets size={32} style={{ color: '#ef4444' }} /></div>
                                <h3>Soil Statistics</h3>
                                <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(weatherData.soilMoisture * 100)}% Volume</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Current ground moisture</p>
                                <p style={{ color: '#fff', marginTop: '0.5rem' }}>Soil Temp: {weatherData.soilTemp}°C</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                                <div className="feature-icon"><MapPin size={32} style={{ color: '#8b5cf6' }} /></div>
                                <h3>Advanced Soil Health</h3>
                                {weatherData.advancedSoil ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#fff' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Soil pH</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.advancedSoil.ph}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Nitrogen</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.advancedSoil.nitrogen} <small>cg/kg</small></div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Clay Content</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.advancedSoil.clay}%</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sand Content</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{weatherData.advancedSoil.sand}%</div>
                                            </div>
                                        </div>
                                        <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Source: ISRIC SoilGrids v2.0</p>
                                    </>
                                ) : (
                                    <p>Advanced soil analysis loading or unavailable for this region.</p>
                                )}
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #f97316', gridColumn: 'span 2' }}>
                                <div className="feature-icon"><AlertTriangle size={32} style={{ color: '#f97316' }} /></div>
                                <h3>Targeted Operational Roadmap</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                                    <div>
                                        <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fertilizer & Nutrition</h4>
                                        <p style={{ color: '#fff', fontSize: '1rem' }}>{recommendations?.fertilizer}</p>
                                        <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Disease Risk</h4>
                                        <p style={{ color: recommendations?.diseaseRisk.includes('CRITICAL') ? '#f87171' : '#fff' }}>{recommendations?.diseaseRisk}</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--accent-green)', fontSize: '0.9rem', marginBottom: '1rem' }}>Actionable Checklist</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {recommendations?.roadmap.map((step, i) => (
                                                <li key={i} style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.8rem', display: 'flex', gap: '10px' }}>
                                                    <span style={{ color: 'var(--accent-green)' }}>✓</span> {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Advisory;

