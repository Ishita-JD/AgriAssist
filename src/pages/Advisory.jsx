import React, { useState } from 'react';
import { Leaf, Beaker, Droplets, AlertCircle, Loader, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Advisory = () => {
    const [soilType, setSoilType] = useState('');
    const [cropType, setCropType] = useState('');
    const [irrigationType, setIrrigationType] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
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

    const callGeminiAPI = async (soilPrompt) => {
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
        
        console.log('Checking API Key...', GEMINI_API_KEY ? 'Key exists' : 'Key missing');
        console.log('Using Model:', GEMINI_MODEL);
        
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file and restart the dev server');
        }

        const payload = {
            contents: [{
                parts: [{
                    text: soilPrompt
                }]
            }]
        };

        try {
            console.log('Calling Gemini API...');
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();
            console.log('API Response:', response.status, data);

            if (!response.ok) {
                const errorMsg = data?.error?.message || `API Error: ${response.status} ${response.statusText}`;
                throw new Error(errorMsg);
            }

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response structure from Gemini API');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            console.error('Gemini API Error:', err);
            throw err;
        }
    };

    const generateRecommendations = async () => {
        if (!soilType || !cropType.trim() || !irrigationType) {
            setError('Please select soil type, enter a crop, and select irrigation method');
            return;
        }

        setLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            const soilTypeLabel = SOIL_TYPES.find(s => s.value === soilType)?.label;
            const irrigationLabel = IRRIGATION_TYPES.find(i => i.value === irrigationType)?.label;
            
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

            const response = await callGeminiAPI(prompt);
            
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from AI');
            }

            const parsedData = JSON.parse(jsonMatch[0]);
            setRecommendations({
                soilType: soilTypeLabel,
                cropName: cropType,
                ...parsedData
            });
        } catch (err) {
            setError(err.message || 'Failed to generate recommendations');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>
            {/* Hero Banner */}
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
                    <h1 className="hero-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>Soil Recommendation System</h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto' }}>
                        Get personalized fertilizer and crop recommendations based on your soil type
                    </p>
                </div>
            </div>

            {/* Selection Section */}
            <div style={{ maxWidth: '900px', margin: '-40px auto 4rem', position: 'relative', zIndex: 10, padding: '0 2rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(20, 40, 50, 0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem 0' }}>
                            Personalized Recommendations
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.95rem' }}>
                            Fill in all three fields to get AI-powered guidance tailored to your farm
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '3rem',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            flex: 1,
                            height: '4px',
                            background: soilType ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                        }} />
                        <div style={{
                            flex: 1,
                            height: '4px',
                            background: cropType.trim() ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                        }} />
                        <div style={{
                            flex: 1,
                            height: '4px',
                            background: irrigationType ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                        }} />
                    </div>

                    {/* STEP 1: Soil Type */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '1.2rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: soilType ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                transition: 'all 0.3s ease'
                            }}>
                                1
                            </div>
                            <label style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                                🌍 Soil Type
                            </label>
                            {soilType && (
                                <span style={{
                                    marginLeft: 'auto',
                                    color: 'var(--accent-green)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    ✓ Selected
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {SOIL_TYPES.map((soil) => (
                                <label key={soil.value} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '1.2rem',
                                    background: soilType === soil.value ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: soilType === soil.value ? '2px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <input
                                        type="radio"
                                        name="soil"
                                        value={soil.value}
                                        checked={soilType === soil.value}
                                        onChange={(e) => setSoilType(e.target.value)}
                                        style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                    />
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                                        {soil.label}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                        {soil.description}
                                    </div>
                                    {soilType === soil.value && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            color: 'var(--accent-green)',
                                            fontSize: '1.2rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* STEP 2: Crop Type */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '1.2rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: cropType.trim() ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                transition: 'all 0.3s ease'
                            }}>
                                2
                            </div>
                            <label style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                                🌾 Crop Name
                            </label>
                            {cropType.trim() && (
                                <span style={{
                                    marginLeft: 'auto',
                                    color: 'var(--accent-green)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    ✓ Entered
                                </span>
                            )}
                        </div>
                        
                        {/* Crop Input Field */}
                        <input
                            type="text"
                            placeholder="Enter crop name (e.g., Rice, Tomato, Wheat...)"
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            list="crop-suggestions"
                            style={{
                                width: '100%',
                                padding: '1rem 1.2rem',
                                marginBottom: '1rem',
                                background: 'rgba(255,255,255,0.04)',
                                border: cropType.trim() ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                caretColor: '#fbbf24'
                            }}
                        />
                        <datalist id="crop-suggestions">
                            {CROP_SUGGESTIONS.map((crop) => (
                                <option key={crop} value={crop} />
                            ))}
                        </datalist>

                        {/* Suggested Crops */}
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                                💡 Popular crops:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                {CROP_SUGGESTIONS.slice(0, 8).map((crop) => (
                                    <button
                                        key={crop}
                                        onClick={() => setCropType(crop)}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            background: cropType === crop ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.12)',
                                            border: cropType === crop ? '1px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.2)',
                                            borderRadius: '20px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (cropType !== crop) {
                                                e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (cropType !== crop) {
                                                e.target.style.background = 'rgba(251, 191, 36, 0.12)';
                                            }
                                        }}
                                    >
                                        {crop}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: Irrigation Type */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '1.2rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: irrigationType ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                transition: 'all 0.3s ease'
                            }}>
                                3
                            </div>
                            <label style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                                💧 Irrigation Method
                            </label>
                            {irrigationType && (
                                <span style={{
                                    marginLeft: 'auto',
                                    color: 'var(--accent-green)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    ✓ Selected
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {IRRIGATION_TYPES.map((irrig) => (
                                <label key={irrig.value} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '1.2rem',
                                    background: irrigationType === irrig.value ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: irrigationType === irrig.value ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <input
                                        type="radio"
                                        name="irrigation"
                                        value={irrig.value}
                                        checked={irrigationType === irrig.value}
                                        onChange={(e) => setIrrigationType(e.target.value)}
                                        style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                    />
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                                        {irrig.label}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                        {irrig.description}
                                    </div>
                                    {irrigationType === irrig.value && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            color: '#60a5fa',
                                            fontSize: '1.2rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={generateRecommendations}
                        disabled={loading || !soilType || !cropType.trim() || !irrigationType}
                        className="btn-main"
                        style={{
                            width: '100%',
                            padding: '1.1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            opacity: loading || !soilType || !cropType.trim() || !irrigationType ? 0.5 : 1,
                            cursor: loading || !soilType || !cropType.trim() || !irrigationType ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            marginTop: '1rem'
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={22} /> : <Beaker size={22} />}
                        {loading ? 'Generating Recommendations...' : 'Get My Recommendations'}
                    </button>

                    {error && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            borderRadius: '12px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem'
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div style={{ padding: '0 2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {!recommendations && !loading && (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🌾</div>
                        <h3>Get Personalized Recommendations</h3>
                        <p>Select soil type, crop category, and irrigation method to receive AI-powered guidance</p>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <Loader className="animate-spin" size={48} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Analyzing soil type and generating recommendations...</p>
                    </div>
                )}

                {recommendations && !loading && (
                    <div className="fade-in">
                        {/* Soil Info Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 83, 45, 0.05) 100%)',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            flexWrap: 'wrap'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{recommendations.soilType}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                    {recommendations.soilCharacteristics}
                                </p>
                            </div>
                            <Leaf size={80} style={{ color: 'var(--accent-green)', opacity: 0.2 }} />
                        </div>

                        {/* Suitable Crops */}
                        <div className="feature-card" style={{
                            borderTop: '4px solid var(--accent-green)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <Leaf size={28} style={{ color: 'var(--accent-green)' }} />
                                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Suitable Crops</h3>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                {recommendations.suitableCrops?.map((crop, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        padding: '1.2rem',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: '#fff'
                                    }}>
                                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌾</div>
                                        <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{crop}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fertilizers */}
                        <div className="feature-card" style={{
                            borderTop: '4px solid #fbbf24',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <Beaker size={28} style={{ color: '#fbbf24' }} />
                                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Recommended Fertilizers</h3>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1rem'
                            }}>
                                {recommendations.fertilizers?.map((fert, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(251, 191, 36, 0.08)',
                                        border: '1px solid rgba(251, 191, 36, 0.2)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '0.8rem', color: '#fbbf24' }}>
                                            {fert.name}
                                        </div>
                                        <div style={{ marginBottom: '0.6rem' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>NPK Ratio:</span>
                                            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#fff' }}>{fert.npkRatio}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Quantity:</span>
                                            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--accent-green)' }}>{fert.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {/* Crop Tips */}
                            <div className="feature-card" style={{ borderTop: '4px solid #60a5fa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                    <Info size={24} style={{ color: '#60a5fa' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Growing Tips</h3>
                                </div>
                                <p style={{ color: '#fff', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                                    {recommendations.cropTips}
                                </p>
                            </div>

                            {/* Irrigation Advice */}
                            <div className="feature-card" style={{ borderTop: '4px solid #06b6d4' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                    <Droplets size={24} style={{ color: '#06b6d4' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Irrigation Advice</h3>
                                </div>
                                <p style={{ color: '#fff', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                                    {recommendations.irrigationAdvice}
                                </p>
                            </div>

                            {/* Seasonal Advice */}
                            <div className="feature-card" style={{ borderTop: '4px solid #a78bfa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                    <Leaf size={24} style={{ color: '#a78bfa' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Seasonal Advice</h3>
                                </div>
                                <p style={{ color: '#fff', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                                    {recommendations.seasonalAdvice}
                                </p>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                onClick={() => {
                                    setSoilType('');
                                    setCropType('');
                                    setIrrigationType('');
                                    setRecommendations(null);
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease'
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

