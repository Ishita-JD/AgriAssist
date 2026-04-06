import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="contact-section" id="about">
            <div className="footer-content">
                <h3>{t('footAbout')}</h3>
                <p>{t('footDesc')}</p>
                <div className="contact-links">
                    <a href="mailto:support@agriassist.com" className="btn-main">{t('footGetInTouch')}</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
