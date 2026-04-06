import React, { useEffect, useState } from 'react';
import { Sun, Search, Sprout, Landmark, Facebook, Twitter, Instagram } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const [scrollY, setScrollY] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const parallaxStyle = {
        transform: `translateY(${scrollY * 0.4}px) scale(1.1)`
    };

    const textParallaxStyle = {
        transform: `translateY(${scrollY * -0.45}px)`
    };

    const farmerParallaxStyle = {
        transform: `translateY(${scrollY * 0.8}px)`
    };

    return (
        <>
            <div className="parallax-container">
                <header className="hero-section" id="home">
                    <div className="hero-bg" style={parallaxStyle}></div>
                    <div className="hero-overlay"></div>

                    <div className="hero-content" style={textParallaxStyle}>
                        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t('heroTitle').replace('?', '?<br/>') }}></h1>
                        <p className="hero-description">
                            {t('heroSubtitle')}
                        </p>
                        <div className="cta-group">
                            <a href="/advisory" className="btn-main">
                                {t('btnExplore')} <span className="arrow">→</span>
                            </a>
                            <a href="#video" className="btn-secondary">{t('btnDemo')}</a>
                        </div>
                    </div>

                    <div className="hero-image-wrapper" style={farmerParallaxStyle}>
                        <div className="hero-image-overlay"></div>
                    </div>

                    <div className="social-nav">
                        <Facebook size={20} className="social-icon" />
                        <Twitter size={20} className="social-icon" />
                        <Instagram size={20} className="social-icon" />
                    </div>
                </header>
            </div>

            <div className="black-transition-gap"></div>

            <section className="features-container" id="advisory">
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Sun size={40} className="icon-svg" />
                        </div>
                        <h3>{t('featAdvisoryTitle')}</h3>
                        <p>{t('featAdvisoryDesc')}</p>
                    </div>
                    <div className="feature-card" id="detector">
                        <div className="feature-icon">
                            <Search size={40} className="icon-svg" />
                        </div>
                        <h3>{t('featDetectorTitle')}</h3>
                        <p>{t('featDetectorDesc')}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Sprout size={40} className="icon-svg" />
                        </div>
                        <h3>{t('featFertilizerTitle')}</h3>
                        <p>{t('featFertilizerDesc')}</p>
                    </div>
                    <div className="feature-card" id="schemes">
                        <div className="feature-icon">
                            <Landmark size={40} className="icon-svg" />
                        </div>
                        <h3>{t('featSchemesTitle')}</h3>
                        <p>{t('featSchemesDesc')}</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
