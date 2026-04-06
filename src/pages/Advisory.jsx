import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Wind, Thermometer, Droplets, Sprout, Search, MapPin, AlertTriangle, Loader, Waves, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Advisory = () => {
    const [city, setCity] = useState('');
    const [cropInput, setCropInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const { t } = useLanguage();

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
            const response = await fetch(`http://localhost:5000/api/advisory?city=${encodeURIComponent(targetCity)}&crop=${encodeURIComponent(cropInput)}`);
            if (!response.ok) throw new Error("Failed to fetch advisory data.");
            
            const data = await response.json();
            setWeatherData(data.weather);
            setRecommendations(data.recommendations);
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

        setGeoLoading(true);
        setError(null);
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(`http://localhost:5000/api/advisory?lat=${latitude}&lon=${longitude}&crop=${encodeURIComponent(cropInput)}`);
                if (!response.ok) throw new Error("Failed to fetch advisory data.");
                
                const data = await response.json();
                setWeatherData(data.weather);
                setRecommendations(data.recommendations);
                setCity(data.weather.name); // Auto-fill the city name
            } catch (err) {
                setError("Failed to fetch weather for your location.");
            } finally {
                setGeoLoading(false);
            }
        }, () => {
            setError("Unable to retrieve your location.");
            setGeoLoading(false);
        });
    };

    // Recommendation generation is now handled by the backend
    const generateRecommendations = async (data) => {
        // Handled server-side now
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
                    <h1 className="hero-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto' }}>
                        {t('subtitle')}
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
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <MapPin style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                                <input
                                    type="text"
                                    placeholder={t('placeholderCity')}
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
                            <button
                                onClick={fetchByLocation}
                                disabled={geoLoading}
                                title="Detect Current Location"
                                style={{
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    borderRadius: '12px',
                                    width: '56px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--accent-green)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {geoLoading ? <Loader className="animate-spin" size={20} /> : <MapPin size={20} />}
                            </button>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <Sprout style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
                            <input
                                type="text"
                                list="crop-options"
                                placeholder={t('placeholderCrop')}
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
                            <datalist id="crop-options">
                                <option value="Rice" />
                                <option value="Wheat" />
                                <option value="Maize" />
                                <option value="Cotton" />
                                <option value="Soybean" />
                                <option value="Sugarcane" />
                                <option value="Tomato" />
                                <option value="Potato" />
                                <option value="Onion" />
                                <option value="Mustard" />
                            </datalist>
                        </div>
                        <button
                            onClick={() => fetchWeather()}
                            disabled={loading}
                            className="btn-main"
                            style={{ padding: '0 2rem', minHeight: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                            {t('btnGetAnalysis')}
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
                    <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🌐</div>
                        <h3>{t('connect_real_time')}</h3>
                        <p>{t('search_instruction')}</p>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <Loader className="animate-spin" size={48} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>{t('connecting')}</p>
                    </div>
                )}

                {aiLoading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '20px', marginBottom: '2rem' }}>
                        <Loader className="animate-spin" size={32} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                        <h3>{t('aiAnalyzing')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{t('aiProcessing')} ${cropInput || 'your crops'}.</p>
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
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('liveTemp')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Droplets size={32} style={{ color: '#60a5fa', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{weatherData.humidity}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('relHumidity')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Wind size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{weatherData.windSpeed} km/h</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('windFlow')}</div>
                                </div>
                            </div>

                        </div>

                        {/* AI Personal Advisory */}
                        {recommendations?.naturalAdvice && (
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.05)',
                                padding: '2rem',
                                borderRadius: '20px',
                                borderLeft: '4px solid var(--primary-color)',
                                marginBottom: '2rem',
                                color: '#fff'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                    <Sprout size={24} style={{ color: 'var(--accent-green)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('aiPersonalAdvisory')}</h3>
                                </div>
                                {recommendations.suggestions && (
                                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>Best Crops:</span>
                                        {recommendations.suggestions.map((s, i) => (
                                            <span key={i} style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '2px 10px', borderRadius: '15px', fontSize: '0.9rem' }}>{s}</span>
                                        ))}
                                    </div>
                                )}
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                    {recommendations.naturalAdvice}
                                </p>
                            </div>
                        )}

                        {/* Advisory Cards */}
                        <div className="feature-grid">
                            <div className="feature-card" style={{ borderTop: '4px solid #10b981' }}>
                                <div className="feature-icon"><Sprout size={32} style={{ color: '#10b981' }} /></div>
                                <h3>{t('cropSuitability')}</h3>
                                <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.2rem' }}>{!cropInput ? `${t('suggested')} ${recommendations?.crop}` : recommendations?.crop}</p>
                                <p style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{recommendations?.suitability}</p>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{recommendations?.tips}</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #3b82f6' }}>
                                <div className="feature-icon"><Waves size={32} style={{ color: '#3b82f6' }} /></div>
                                <h3>{t('irrigationAdvice')}</h3>
                                <p style={{ color: '#fff', marginBottom: '0.5rem' }}>{recommendations?.irrigation}</p>
                                <p>Live monitoring at {weatherData.humidity}% humidity.</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #f59e0b' }}>
                                <div className="feature-icon"><Thermometer size={32} style={{ color: '#f59e0b' }} /></div>
                                <h3>{t('tempRisk')}</h3>
                                <p style={{ color: recommendations?.tempAlert.includes('Normal') ? '#fff' : '#fcd34d' }}>
                                    {recommendations?.tempAlert}
                                </p>
                                <p>{t('currentReading')} {Math.round(weatherData.temp)}°C</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #ef4444' }}>
                                <div className="feature-icon"><Droplets size={32} style={{ color: '#ef4444' }} /></div>
                                <h3>{t('soilStatistics')}</h3>
                                <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(weatherData.soilMoisture * 100)}% {t('volume')}</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{t('groundMoisture')}</p>
                                <p style={{ color: '#fff', marginTop: '0.5rem' }}>{t('soilTemp')}: {weatherData.soilTemp}°C</p>
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                                <div className="feature-icon"><MapPin size={32} style={{ color: '#8b5cf6' }} /></div>
                                <h3>{t('advancedSoilHealth')}</h3>
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
                                        <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t('source')}</p>
                                    </>
                                ) : (
                                    <p>Advanced soil analysis loading or unavailable for this region.</p>
                                )}
                            </div>

                            <div className="feature-card" style={{ borderTop: '4px solid #f97316', gridColumn: 'span 2' }}>
                                <div className="feature-icon"><AlertTriangle size={32} style={{ color: '#f97316' }} /></div>
                                <h3>{t('operationalRoadmap')}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                                    <div>
                                        <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('fertilizerNutrition')}</h4>
                                        <p style={{ color: '#fff', fontSize: '1rem' }}>{recommendations?.fertilizer}</p>
                                        <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t('diseaseRisk')}</h4>
                                        <p style={{ color: (recommendations?.diseaseRisk || '').includes('CRITICAL') ? '#f87171' : '#fff' }}>{recommendations?.diseaseRisk}</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--accent-green)', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('actionableChecklist')}</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {(recommendations?.roadmap || []).map((step, i) => (
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

