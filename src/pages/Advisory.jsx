import React from 'react';
import { Sun, CloudRain, Wind, Thermometer, Droplets, Sprout } from 'lucide-react';

const Advisory = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                height: '420px',
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
                    background: 'linear-gradient(135deg, rgba(10,31,18,0.80) 0%, rgba(20,83,45,0.60) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌾</div>
                    <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Crop Advisory</h1>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Weather-based recommendations tailored to your crops, climate, and region — so you always make the right move.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '4rem 4rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Sun size={36} className="icon-svg" /></div>
                        <h3>Smart Climate Insights</h3>
                        <p>Get hyper-local weather forecasts and crop-specific climate data to plan sowing, irrigation, and harvesting at the right time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><CloudRain size={36} className="icon-svg" /></div>
                        <h3>Rainfall Predictions</h3>
                        <p>Access region-specific rainfall forecasts and plan your water management strategy to avoid crop damage during unexpected showers.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Sprout size={36} className="icon-svg" /></div>
                        <h3>Crop Recommendations</h3>
                        <p>Based on your soil type, season, and location — get the best crop options to maximise yield and profitability this season.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Droplets size={36} className="icon-svg" /></div>
                        <h3>Irrigation Guidance</h3>
                        <p>Smart irrigation schedules based on evapotranspiration data and real-time soil moisture levels to conserve water and boost growth.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Thermometer size={36} className="icon-svg" /></div>
                        <h3>Temperature Alerts</h3>
                        <p>Receive early warnings on frost, heat waves, and extreme temperature swings that can adversely affect your standing crops.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Wind size={36} className="icon-svg" /></div>
                        <h3>Wind & Storm Alerts</h3>
                        <p>Stay informed about incoming storms and high-wind warnings so you can take preventive measures to protect your farm in time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advisory;
