import React, { useState, useRef } from 'react';
import { Search, Upload, Leaf, AlertTriangle, CheckCircle, Camera } from 'lucide-react';

const Detector = () => {
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileRef = useRef();

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(file));
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
                        <button className="btn-main" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
                            <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Analyse Disease
                        </button>
                        <button onClick={() => setPreview(null)} style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', padding: '0.9rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                            Clear
                        </button>
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
