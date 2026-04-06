import React, { useState, useRef } from 'react';
import { Search, Upload, Leaf, AlertTriangle, CheckCircle, Camera, Loader, ShieldCheck, Bug, Droplets } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const getTreatmentIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'chemical': return <Droplets size={20} style={{ color: '#60a5fa' }} />;
        case 'biological': return <Bug size={20} style={{ color: '#34d399' }} />;
        case 'prevention': return <ShieldCheck size={20} style={{ color: '#a78bfa' }} />;
        default: return <Leaf size={20} style={{ color: 'var(--accent-green)' }} />;
    }
};

const getTreatmentColor = (type) => {
    switch (type.toLowerCase()) {
        case 'chemical': return '#60a5fa';
        case 'biological': return '#34d399';
        case 'prevention': return '#a78bfa';
        default: return 'var(--accent-green)';
    }
};

const Detector = () => {
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { t } = useLanguage();
    const fileRef = useRef();

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (err) => reject(err);
        });
    };

    const analyzeImage = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBase64(selectedFile);
            const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;

            if (!apiKey || apiKey === 'your_api_key_here') {
                throw new Error("API Key is missing. Please add VITE_PLANT_ID_API_KEY to your .env file.");
            }

            const response = await fetch('https://api.plant.id/v2/health_assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': apiKey
                },
                body: JSON.stringify({
                    images: [base64Image],
                    modifiers: ["crops_fast", "similar_images"],
                    disease_details: ["cause", "common_names", "classification", "description", "treatment", "url"]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to analyze image with Plant.id API');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                height: '420px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1600&q=80)',
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
                    background: 'linear-gradient(135deg, rgba(5,15,30,0.85) 0%, rgba(10,40,20,0.65) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔬</div>
                    <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('detHeroTitle')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        {t('detHeroSubtitle')}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '4rem 4rem 6rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* Upload Area */}
                <div
                    className="feature-card"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current.click()}
                    style={{
                        cursor: 'pointer',
                        border: dragOver ? '2px dashed var(--accent-green)' : '2px dashed rgba(255,255,255,0.15)',
                        background: dragOver ? 'rgba(74,222,128,0.08)' : undefined,
                        textAlign: 'center',
                        padding: '3rem',
                        marginBottom: '2.5rem',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                    {preview ? (
                        <img src={preview} alt="Crop preview" style={{ maxHeight: '280px', borderRadius: '12px', objectFit: 'cover', width: '100%' }} />
                    ) : (
                        <>
                            <Upload size={52} style={{ color: 'var(--accent-green)', marginBottom: '1rem', opacity: 0.8 }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>{t('detUploadTitle')}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{t('detUploadDesc')}</p>
                        </>
                    )}
                </div>

                {preview && (
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <button
                            className="btn-main"
                            onClick={analyzeImage}
                            disabled={loading}
                            style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    {t('btnAnalyzing')}
                                </>
                            ) : (
                                <>
                                    <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    {t('btnAnalyze')}
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { setPreview(null); setSelectedFile(null); setResult(null); setError(null); }}
                            disabled={loading}
                            style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', padding: '0.9rem 1.5rem', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {t('btnClear')}
                        </button>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', textAlign: 'center', marginBottom: '2.5rem' }}>
                        <AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>{t('detResultsTitle')}</h3>

                        {result.health_assessment?.is_healthy?.binary ? (
                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
                                <CheckCircle size={28} />
                                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t('detHealthy')}</span>
                            </div>
                        ) : (
                            <div>
                                <div style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2.5rem', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '50%', display: 'flex' }}>
                                        <AlertTriangle size={32} color="#ef4444" />
                                    </div>
                                    <div>
                                        <div style={{ color: '#ef4444', fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>{t('detAttention')}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{t('detAttentionDesc')}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '2.5rem' }}>
                                    {result.health_assessment?.diseases?.slice(0, 3).map((disease, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <h4 style={{ fontSize: '1.6rem', color: '#f87171', margin: 0, fontWeight: '700' }}>{disease.name}</h4>
                                                <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '8px 16px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                    {(disease.probability * 100).toFixed(1)}% {t('detMatch')}
                                                </div>
                                            </div>

                                            {disease.disease_details && (
                                                <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.7' }}>
                                                    {disease.disease_details.description && (
                                                        <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>{disease.disease_details.description}</p>
                                                    )}

                                                    {disease.disease_details.treatment && Object.keys(disease.disease_details.treatment).length > 0 && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <strong style={{ display: 'block', marginBottom: '1.5rem', fontSize: '1.2rem', color: '#fff' }}>{t('detActionPlan')}</strong>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                                                                {Object.entries(disease.disease_details.treatment).map(([key, value]) => {
                                                                    const items = Array.isArray(value) ? value : [value];
                                                                    if (items.length === 0) return null;

                                                                    const labelKey = key.toLowerCase() === 'chemical' ? 'detChemical' : 
                                                                                   key.toLowerCase() === 'biological' ? 'detBiological' : 
                                                                                   key.toLowerCase() === 'prevention' ? 'detPrevention' : null;

                                                                    return (
                                                                        <div key={key} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', transition: 'transform 0.2s ease, background 0.3s' }} className="treatment-card">
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                                                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                                                                                    {getTreatmentIcon(key)}
                                                                                </div>
                                                                                <strong style={{ color: getTreatmentColor(key), textTransform: 'capitalize', fontSize: '1.15rem' }}>
                                                                                    {labelKey ? t(labelKey) : key} {t('detTreatment')}
                                                                                </strong>
                                                                            </div>
                                                                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                                                {items.map((item, id) => (
                                                                                    <li key={id} style={{ lineHeight: '1.6' }}>{item}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Cards */}
                <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div className="feature-card">
                        <div className="feature-icon"><Camera size={32} className="icon-svg" /></div>
                        <h3>{t('detStepSnap')}</h3>
                        <p>{t('detStepSnapDesc')}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Leaf size={32} className="icon-svg" /></div>
                        <h3>{t('detStepAI')}</h3>
                        <p>{t('detStepAIDesc')}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><AlertTriangle size={32} className="icon-svg" /></div>
                        <h3>{t('detStepAdvice')}</h3>
                        <p>{t('detStepAdviceDesc')}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><CheckCircle size={32} className="icon-svg" /></div>
                        <h3>{t('detStepTrack')}</h3>
                        <p>{t('detStepTrackDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detector;
