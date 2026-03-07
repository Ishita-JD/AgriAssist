import React, { useEffect, useState } from 'react';
import { Sun, Search, Sprout, Landmark, Facebook, Twitter, Instagram } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const parallaxStyle = {
        backgroundPositionY: scrollY * 0.4 + 'px'
    };

    const textParallaxStyle = {
        transform: `translateY(${scrollY * -0.2}px)`
    };

    const farmerParallaxStyle = {
        transform: `translateY(${scrollY * 0.15}px)`
    };

    return (
        <>
            <div className="parallax-container">
                <header className="hero-section" id="home">
                    <div className="hero-bg" style={parallaxStyle}></div>
                    <div className="hero-overlay"></div>

                    <div className="hero-content" style={textParallaxStyle}>
                        <h1 className="hero-title">
                            Can crops <br />
                            grow <br />
                            smarter?
                        </h1>
                        <p className="hero-description">
                            AgriAssist provides precision-driven insights for modern framing.
                            Get weather-based suggestions, fertilizer recommendations, and
                            instant disease detection to maximize your yield.
                        </p>
                        <div className="cta-group">
                            <a href="#advisory" className="btn-main">
                                Explore More <span className="arrow">→</span>
                            </a>
                            <a href="#video" className="btn-secondary">Explore Demo</a>
                        </div>
                    </div>

                    <div className="hero-image-overlay" style={farmerParallaxStyle}></div>

                    <div className="social-nav">
                        <Facebook size={20} className="social-icon" />
                        <Twitter size={20} className="social-icon" />
                        <Instagram size={20} className="social-icon" />
                    </div>
                </header>
            </div>

            <section className="features-container" id="advisory">
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Sun size={40} className="icon-svg" />
                        </div>
                        <h3>Smart Advisory</h3>
                        <p>Get data-driven weather suggestions and local climate insights for optimal crop timing.</p>
                    </div>
                    <div className="feature-card" id="detector">
                        <div className="feature-icon">
                            <Search size={40} className="icon-svg" />
                        </div>
                        <h3>Disease Identifier</h3>
                        <p>Upload a photo of your plant and get instant diagnosis and preventive measures.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Sprout size={40} className="icon-svg" />
                        </div>
                        <h3>Fertilizer Guide</h3>
                        <p>Precise recommendations for your crop type and location to ensure healthy growth.</p>
                    </div>
                    <div className="feature-card" id="schemes">
                        <div className="feature-icon">
                            <Landmark size={40} className="icon-svg" />
                        </div>
                        <h3>Govt. Schemes</h3>
                        <p>Stay updated with the latest government schemes, subsidies, and support for farmers.</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
