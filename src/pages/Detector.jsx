import React, { useState, useRef } from 'react';
import { Search, Upload, Leaf, AlertTriangle, CheckCircle, Camera, Loader } from 'lucide-react';

const Detector = () => {
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
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
                    <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Disease Detector</h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Upload a photo of your crop and let our AI instantly identify diseases, pests, and deficiencies.
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
                            <h3 style={{ marginBottom: '0.5rem' }}>Upload Crop Image</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Drag & drop or click to browse — JPG, PNG supported</p>
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
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Analyse Disease
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { setPreview(null); setSelectedFile(null); setResult(null); setError(null); }}
                            disabled={loading}
                            style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', padding: '0.9rem 1.5rem', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            Clear
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
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Analysis Results</h3>

                        {result.health_assessment?.is_healthy?.binary ? (
                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
                                <CheckCircle size={28} />
                                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Good news! Your crop appears healthy.</span>
                            </div>
                        ) : (
                            <div>
                                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                    <AlertTriangle size={28} />
                                    <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Potential Issues Detected</span>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {result.health_assessment?.diseases?.slice(0, 3).map((disease, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '1.2rem', color: '#fca5a5', margin: 0 }}>{disease.name}</h4>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                                    {(disease.probability * 100).toFixed(1)}% match
                                                </span>
                                            </div>

                                            {disease.disease_details && (
                                                <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                                                    {disease.disease_details.description && (
                                                        <p style={{ marginBottom: '1rem' }}>{disease.disease_details.description}</p>
                                                    )}

                                                    {disease.disease_details.treatment && Object.keys(disease.disease_details.treatment).length > 0 && (
                                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', borderLeft: '3px solid var(--accent-green)', borderRadius: '0 8px 8px 0' }}>
                                                            <strong style={{ color: 'var(--accent-green)', display: 'block', marginBottom: '0.5rem' }}>Recommended Treatment:</strong>
                                                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                                {Object.entries(disease.disease_details.treatment).map(([key, value]) => (
                                                                    <li key={key} style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                                                                        <strong>{key}: </strong>
                                                                        {Array.isArray(value) ? value.join(', ') : value}
                                                                    </li>
                                                                ))}
                                                            </ul>
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
                        <h3>Snap & Upload</h3>
                        <p>Take a clear photo of the affected leaf or crop area and upload it directly for analysis.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Leaf size={32} className="icon-svg" /></div>
                        <h3>AI Diagnosis</h3>
                        <p>Our deep learning model scans for 50+ plant diseases with high accuracy in under 5 seconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><AlertTriangle size={32} className="icon-svg" /></div>
                        <h3>Treatment Advice</h3>
                        <p>Get disease-specific treatment recommendations, pesticide guidance, and preventive measures.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><CheckCircle size={32} className="icon-svg" /></div>
                        <h3>Track Recovery</h3>
                        <p>Upload follow-up images to monitor crop recovery progress over time and adjust treatments.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detector;
