import React, { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong.');

            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 4000);
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                height: '420px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&q=80)',
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
                    background: 'linear-gradient(135deg, rgba(10,25,15,0.85) 0%, rgba(20,60,30,0.65) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>📬</div>
                    <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact Us</h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Have questions? Our agricultural experts are here to help you grow smarter.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '4rem 4rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2.5rem', alignItems: 'start' }}>

                    {/* Info Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', padding: '1.5rem' }}>
                            <div className="feature-icon" style={{ minWidth: '48px', height: '48px', marginBottom: 0 }}>
                                <Mail size={22} className="icon-svg" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.3rem', fontSize: '1rem' }}>Email Us</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>support@agriassist.com</p>
                            </div>
                        </div>
                        <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', padding: '1.5rem' }}>
                            <div className="feature-icon" style={{ minWidth: '48px', height: '48px', marginBottom: 0 }}>
                                <Phone size={22} className="icon-svg" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.3rem', fontSize: '1rem' }}>Call Us</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>+91 1800-456-789 (Toll Free)</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="feature-card" style={{ padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Send a Message</h2>

                        {/* Success */}
                        {status === 'success' && (
                            <div style={{
                                background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
                                color: 'var(--accent-green)', borderRadius: '10px',
                                padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.95rem'
                            }}>
                                ✅ Message sent! We'll get back to you within 24 hours.
                            </div>
                        )}

                        {/* Error */}
                        {status === 'error' && (
                            <div style={{
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                                color: '#f87171', borderRadius: '10px',
                                padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.95rem'
                            }}>
                                ❌ {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <input
                                type="text" name="name" placeholder="Your Name" required
                                value={form.name} onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <input
                                type="email" name="email" placeholder="Email Address" required
                                value={form.email} onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <input
                                type="text" name="subject" placeholder="Subject"
                                value={form.subject} onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <textarea
                                name="message" placeholder="Your message..." required rows={5}
                                value={form.message} onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    resize: 'vertical', fontFamily: 'inherit',
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-main"
                                disabled={status === 'loading'}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.9rem', opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
                            >
                                <Send size={18} />
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
