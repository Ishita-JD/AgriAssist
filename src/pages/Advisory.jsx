import React, { useState } from 'react';
import { Leaf, Beaker, Droplets, AlertCircle, Loader, Info, Cloud, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Advisory = () => {
    const [soilType, setSoilType] = useState('');
    const [cropType, setCropType] = useState('');
    const [irrigationType, setIrrigationType] = useState('');
    const [district, setDistrict] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [advisoryData, setAdvisoryData] = useState(null);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    const SOIL_TYPES = [
        { value: 'black_soil', label: 'Black Soil', description: 'Rich in iron and magnesium' },
        { value: 'red_soil', label: 'Red Soil', description: 'Iron oxide rich, laterite formation' },
        { value: 'sandy_soil', label: 'Sandy Soil', description: 'Good drainage, low fertility' }
    ];

    const CROP_SUGGESTIONS = [
        'Rice', 'Wheat', 'Maize', 'Soybean', 'Mustard',
        'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato',
        'Lentil', 'Chickpea', 'Sunflower', 'Mango', 'Apple'
    ];

    const IRRIGATION_TYPES = [
        { value: 'drip', label: 'Drip Irrigation', description: 'Precise, water-efficient' },
        { value: 'sprinkler', label: 'Sprinkler Irrigation', description: 'Uniform coverage' },
        { value: 'flood', label: 'Flood Irrigation', description: 'Traditional basin method' },
        { value: 'canal', label: 'Canal Irrigation', description: 'From canals/river' },
        { value: 'rainwater', label: 'Rainwater Harvesting', description: 'Seasonal/supplement' }
    ];

    const DISTRICTS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Indore', 'Nagpur'];

    const fetchAdvisory = async () => {
        try {
            const response = await fetch(
                `/api/advisory?district=${encodeURIComponent(district)}&crop=${encodeURIComponent(cropType)}&soilType=${encodeURIComponent(soilType)}`
            );
            if (!response.ok) throw new Error('Failed to fetch advisory');
            return await response.json();
        } catch (err) {
            console.error('Advisory fetch error:', err);
            return null;
        }
    };

    const generateRecommendations = async () => {
        if (!district.trim() || !soilType || !cropType.trim() || !irrigationType) {
            setError('Please fill in all fields including district');
            return;
        }

        setLoading(true);
        setError(null);
        setRecommendations(null);
        setAdvisoryData(null);

        try {
            const apiData = await fetchAdvisory();
            if (apiData) {
                setAdvisoryData(apiData);
            }

            const soilTypeLabel = SOIL_TYPES.find(s => s.value === soilType)?.label;
            const irrigationLabel = IRRIGATION_TYPES.find(i => i.value === irrigationType)?.label;

            const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
            const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';

            if (GEMINI_API_KEY) {
                const prompt = `You are an agricultural expert. Provide recommendations for growing ${cropType} with the following conditions:
- Soil Type: ${soilTypeLabel}
- Irrigation Method: ${irrigationLabel}

Provide detailed recommendations in JSON format ONLY with these exact fields:
{
    "suitableCrops": ["${cropType}", "alternative crop 2", "alternative crop 3", "alternative crop 4", "alternative crop 5"],
    "fertilizers": [
        { "name": "fertilizer name", "npkRatio": "N-P-K ratio", "quantity": "kg/hectare" },
        { "name": "fertilizer name", "npkRatio": "N-P-K ratio", "quantity": "kg/hectare" },
        { "name": "fertilizer name", "npkRatio": "N-P-K ratio", "quantity": "kg/hectare" }
    ],
    "soilCharacteristics": "Brief description of ${soilTypeLabel} and its suitability for ${cropType}",
    "cropTips": "2-3 line tips for growing ${cropType} in ${soilTypeLabel}",
    "irrigationAdvice": "Specific irrigation practices and water requirements for ${cropType} using ${irrigationLabel}",
    "seasonalAdvice": "Seasonal recommendations and best practices for ${cropType}"
}`;

                const payload = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                };

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error(data?.error?.message || 'API Error');

                const jsonMatch = data.candidates[0]?.content?.parts?.[0]?.text?.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    setRecommendations({
                        soilType: soilTypeLabel,
                        cropName: cropType,
                        ...parsedData
                    });
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to generate recommendations');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (level === 'High') return '#f87171';
        if (level === 'Medium') return '#fbbf24';
        return 'var(--accent-green)';
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>
            <div style={{
                position: 'relative',
                height: '380px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=80)',
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
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌱</div>
                    <h1 className="hero-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>Smart Agricultural Advisory</h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto' }}>
                        Weather • Market • Risk Analysis • Personalized Recommendations
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '-40px auto 4rem', position: 'relative', zIndex: 10, padding: '0 2rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(20, 40, 50, 0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                }}>
                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem 0' }}>
                            Get Your Advisory
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.95rem' }}>
                            Fill in your details to get weather, market, and risk analysis
                        </p>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block' }}>
                            📍 Your District
                        </label>
                        <input
                            type="text"
                            placeholder="Enter or select your district"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            list="district-suggestions"
                            style={{
                                width: '100%',
                                padding: '1rem 1.2rem',
                                background: 'rgba(255,255,255,0.04)',
                                border: district.trim() ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                marginBottom: '0.8rem',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                        />
                        <datalist id="district-suggestions">
                            {DISTRICTS.map((d) => <option key={d} value={d} />)}
                        </datalist>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block' }}>
                            🌍 Soil Type
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            {SOIL_TYPES.map((soil) => (
                                <label key={soil.value} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                    padding: '1rem', background: soilType === soil.value ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: soilType === soil.value ? '2px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative'
                                }}>
                                    <input type="radio" name="soil" value={soil.value} checked={soilType === soil.value}
                                        onChange={(e) => setSoilType(e.target.value)} style={{ position: 'absolute', opacity: 0 }} />
                                    <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.3rem' }}>{soil.label}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{soil.description}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block' }}>
                            🌾 Crop Name
                        </label>
                        <input type="text" placeholder="Enter crop name" value={cropType} onChange={(e) => setCropType(e.target.value)}
                            list="crop-suggestions" style={{
                                width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)',
                                border: cropType.trim() ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', marginBottom: '0.8rem',
                                transition: 'all 0.3s ease', boxSizing: 'border-box'
                            }} />
                        <datalist id="crop-suggestions">
                            {CROP_SUGGESTIONS.map((crop) => <option key={crop} value={crop} />)}
                        </datalist>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.8rem', display: 'block' }}>
                            💧 Irrigation Method
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            {IRRIGATION_TYPES.map((irrig) => (
                                <label key={irrig.value} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                    padding: '1rem', background: irrigationType === irrig.value ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: irrigationType === irrig.value ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative'
                                }}>
                                    <input type="radio" name="irrigation" value={irrig.value} checked={irrigationType === irrig.value}
                                        onChange={(e) => setIrrigationType(e.target.value)} style={{ position: 'absolute', opacity: 0 }} />
                                    <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.3rem' }}>{irrig.label}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{irrig.description}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button onClick={generateRecommendations} disabled={loading || !district.trim() || !soilType || !cropType.trim() || !irrigationType}
                        className="btn-main" style={{
                            width: '100%', padding: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '700',
                            opacity: loading || !district.trim() || !soilType || !cropType.trim() || !irrigationType ? 0.5 : 1,
                            cursor: loading || !district.trim() || !soilType || !cropType.trim() || !irrigationType ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                        }}>
                        {loading ? <Loader className="animate-spin" size={22} /> : <Beaker size={22} />}
                        {loading ? 'Analyzing...' : 'Get Advisory'}
                    </button>

                    {error && (
                        <div style={{
                            marginTop: '1.5rem', padding: '1rem', background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '12px', color: '#f87171',
                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem'
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '0 2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {!advisoryData && !recommendations && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🌾</div>
                        <h3>Get Smart Advisory</h3>
                        <p>Fill all fields to get weather analysis, market trends, and risk assessment</p>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <Loader className="animate-spin" size={48} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Fetching weather, market, and risk data...</p>
                    </div>
                )}

                {advisoryData && !loading && (
                    <div className="fade-in">
                        {advisoryData.weather && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                padding: '2rem', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.2)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <Cloud size={28} style={{ color: '#60a5fa' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Weather Conditions</h3>
                                    {advisoryData.weather.fallback && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#fbbf24' }}>📡 Fallback Data</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {advisoryData.weather.temperature !== null && (
                                        <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>🌡️ Temperature</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>{advisoryData.weather.temperature}°C</div>
                                        </div>
                                    )}
                                    {advisoryData.weather.rain !== null && (
                                        <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>🌧️ Rain Probability</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>{advisoryData.weather.rain}%</div>
                                        </div>
                                    )}
                                    {advisoryData.weather.wind !== null && (
                                        <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>🌬️ Wind Speed</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>{advisoryData.weather.wind} km/h</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {advisoryData.market && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                padding: '2rem', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.2)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <TrendingUp size={28} style={{ color: '#34d399' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Market Trends - {advisoryData.market.crop}</h3>
                                    {advisoryData.market.fallback && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#fbbf24' }}>📡 Fallback Data</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {advisoryData.market.averagePrice !== null && (
                                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>💰 Avg Price</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>₹{advisoryData.market.averagePrice}</div>
                                        </div>
                                    )}
                                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>📈 Trend</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: advisoryData.market.trend === 'up' ? '#34d399' : '#f87171' }}>
                                            {advisoryData.market.trend === 'up' ? '↗ Rising' : advisoryData.market.trend === 'down' ? '↘ Falling' : '→ Stable'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {advisoryData.risk && (
                            <div style={{
                                background: `linear-gradient(135deg, rgba(${getRiskColor(advisoryData.risk.level).includes('rgb') ? '248, 113, 113' : '251, 191, 36'}, 0.1) 0%, rgba(${getRiskColor(advisoryData.risk.level).includes('rgb') ? '248, 113, 113' : '251, 191, 36'}, 0.05) 100%)`,
                                padding: '2rem', borderRadius: '16px', border: `2px solid ${getRiskColor(advisoryData.risk.level)}`,
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Risk Assessment</h3>
                                    <div style={{
                                        background: getRiskColor(advisoryData.risk.level), color: '#000', padding: '0.6rem 1.2rem',
                                        borderRadius: '20px', fontWeight: '700', fontSize: '1.1rem'
                                    }}>
                                        {advisoryData.risk.level} Risk
                                    </div>
                                </div>
                                <p style={{ color: '#fff', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1rem' }}>
                                    {advisoryData.risk.explanation}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Weather</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{advisoryData.risk.weatherRisk}%</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Market</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{advisoryData.risk.marketRisk}%</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Soil</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{advisoryData.risk.soilRisk}%</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Total</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{advisoryData.risk.totalRiskScore}%</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {advisoryData.advisory && advisoryData.advisory.length > 0 && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 83, 45, 0.05) 100%)',
                                padding: '2rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <Info size={28} style={{ color: 'var(--accent-green)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Daily Advisory</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {advisoryData.advisory.map((msg, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px',
                                            borderLeft: '4px solid var(--accent-green)', color: '#fff'
                                        }}>
                                            <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>✓ {msg}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {recommendations && !loading && (
                    <div className="fade-in">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 83, 45, 0.05) 100%)',
                            padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)',
                            marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{recommendations.soilType}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                    {recommendations.soilCharacteristics}
                                </p>
                            </div>
                            <Leaf size={80} style={{ color: 'var(--accent-green)', opacity: 0.2 }} />
                        </div>

                        {recommendations.suitableCrops && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(20, 83, 45, 0.02) 100%)',
                                padding: '2rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '2rem',
                                borderTop: '4px solid var(--accent-green)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <Leaf size={28} style={{ color: 'var(--accent-green)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Suitable Crops</h3>
                                </div>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem'
                                }}>
                                    {recommendations.suitableCrops.map((crop, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                                            padding: '1.2rem', borderRadius: '12px', textAlign: 'center', color: '#fff'
                                        }}>
                                            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌾</div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{crop}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recommendations.fertilizers && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(217, 119, 6, 0.02) 100%)',
                                padding: '2rem', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.2)', marginBottom: '2rem',
                                borderTop: '4px solid #fbbf24'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <Beaker size={28} style={{ color: '#fbbf24' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Recommended Fertilizers</h3>
                                </div>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem'
                                }}>
                                    {recommendations.fertilizers.map((fert, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)',
                                            padding: '1.5rem', borderRadius: '12px', color: '#fff'
                                        }}>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.8rem', color: '#fbbf24' }}>
                                                {fert.name}
                                            </div>
                                            <div style={{ marginBottom: '0.6rem' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>NPK:</span>
                                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>{fert.npkRatio}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Qty:</span>
                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-green)' }}>{fert.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem'
                        }}>
                            {recommendations.cropTips && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
                                    padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.2)',
                                    borderTop: '4px solid #60a5fa'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                        <Info size={24} style={{ color: '#60a5fa' }} />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Growing Tips</h3>
                                    </div>
                                    <p style={{ color: '#fff', lineHeight: '1.6', margin: 0 }}>
                                        {recommendations.cropTips}
                                    </p>
                                </div>
                            )}

                            {recommendations.irrigationAdvice && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 145, 178, 0.02) 100%)',
                                    padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.2)',
                                    borderTop: '4px solid #06b6d4'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                        <Droplets size={24} style={{ color: '#06b6d4' }} />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Irrigation</h3>
                                    </div>
                                    <p style={{ color: '#fff', lineHeight: '1.6', margin: 0 }}>
                                        {recommendations.irrigationAdvice}
                                    </p>
                                </div>
                            )}

                            {recommendations.seasonalAdvice && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)',
                                    padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.2)',
                                    borderTop: '4px solid #a78bfa'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                        <Leaf size={24} style={{ color: '#a78bfa' }} />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Seasonal</h3>
                                    </div>
                                    <p style={{ color: '#fff', lineHeight: '1.6', margin: 0 }}>
                                        {recommendations.seasonalAdvice}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button onClick={() => {
                                setDistrict(''); setSoilType(''); setCropType(''); setIrrigationType('');
                                setRecommendations(null); setAdvisoryData(null);
                            }} style={{
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '0.95rem', transition: 'all 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                Try New Combination
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Advisory;
