import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        e.target.reset();
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
                        <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', padding: '1.5rem' }}>
                            <div className="feature-icon" style={{ minWidth: '48px', height: '48px', marginBottom: 0 }}>
                                <MapPin size={22} className="icon-svg" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.3rem', fontSize: '1rem' }}>Our Office</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>AgriAssist HQ, Pune, Maharashtra, India - 411001</p>
                            </div>
                        </div>
                        <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', padding: '1.5rem' }}>
                            <div className="feature-icon" style={{ minWidth: '48px', height: '48px', marginBottom: 0 }}>
                                <MessageCircle size={22} className="icon-svg" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.3rem', fontSize: '1rem' }}>Working Hours</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Mon – Sat: 9:00 AM to 6:00 PM IST</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="feature-card" style={{ padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Send a Message</h2>
                        {sent && (
                            <div style={{
                                background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
                                color: 'var(--accent-green)', borderRadius: '10px',
                                padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.95rem'
                            }}>
                                ✅ Message sent! We'll get back to you within 24 hours.
                            </div>
                        )}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <input
                                type="text" placeholder="Your Name" required
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <input
                                type="email" placeholder="Email Address" required
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <input
                                type="text" placeholder="Subject"
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            <textarea
                                placeholder="Your message..." required rows={5}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', padding: '0.9rem 1.2rem',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    resize: 'vertical', fontFamily: 'inherit',
                                }}
                            />
                            <button type="submit" className="btn-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.9rem' }}>
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
