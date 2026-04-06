import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

const Navbar = ({ scrolled, onLoginClick }) => {
    const { user, logout } = useAuth();
    const { t, toggleLanguage } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        // Prevent multiple scripts or multiple initializations
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            addScript.async = true;
            document.body.appendChild(addScript);
        }

        window.googleTranslateElementInit = () => {
            // Check if widget already exists to avoid duplication
            const container = document.getElementById('google_translate_element');
            if (container && !container.hasChildNodes() && window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'hi,en,pa,bn,te,mr,ta,gu,kn,ml',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src="/src/assets/logo.jpg" alt="AgriAssist Logo" className="logo-img" />
                <div className="nav-logo">AgriAssist.</div>
            </Link>

            {user && (
                <ul className="nav-links">
                    <li><Link to="/">{t('navHome')}</Link></li>
                    <li><Link to="/advisory">{t('navAdvisory')}</Link></li>
                    <li><Link to="/detector">{t('navDetector')}</Link></li>
                    <li><Link to="/schemes">{t('navSchemes')}</Link></li>
                    <li><Link to="/contact">{t('navContact')}</Link></li>
                </ul>
            )}

            <div className="nav-auth">
                {/* Google Translate Integration */}
                <div id="google_translate_element" style={{ marginRight: '1rem' }} />

                {user ? (
                    <div className="user-profile">
                        <img src={user.photoURL || 'https://via.placeholder.com/35'} alt="Profile" className="user-avatar" />
                        <button className="btn-logout" onClick={handleLogout}>{t('navLogout')}</button>
                    </div>
                ) : (
                    <>
                        <button onClick={onLoginClick} className="btn-login">{t('navLogin')}</button>
                        <button onClick={onLoginClick} className="btn-signup">{t('navSignup')}</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
