import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'te', label: 'Telugu' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' }
];

const GOOGLE_TRANSLATE_COOKIE = 'googtrans';
const LANGUAGE_STORAGE_KEY = 'agriassist-language';

const setTranslateCookie = (langCode) => {
    const value = `/en/${langCode}`;
    document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=${value};path=/;max-age=31536000`;
    document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=${value};path=/;domain=${window.location.hostname};max-age=31536000`;
};

const applyGoogleTranslate = (langCode) => {
    const select = document.querySelector('.goog-te-combo');

    if (!select) {
        return false;
    }

    if (select.value !== langCode) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
    }

    return true;
};

const Navbar = ({ scrolled, onLoginClick }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en');

    useEffect(() => {
        const initializeTranslateWidget = () => {
            const container = document.getElementById('google_translate_element');

            if (!container || !window.google?.translate) {
                return;
            }

            if (!container.childNodes.length) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: LANGUAGE_OPTIONS.map((item) => item.code).join(','),
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
            }

            window.setTimeout(() => {
                applyGoogleTranslate(localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en');
            }, 400);
        };

        window.googleTranslateElementInit = initializeTranslateWidget;

        if (window.google?.translate) {
            initializeTranslateWidget();
            return;
        }

        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        setTranslateCookie(selectedLanguage);
    }, [selectedLanguage]);

    useEffect(() => {
        if (selectedLanguage === 'en') {
            return;
        }

        const timer = window.setTimeout(() => {
            applyGoogleTranslate(selectedLanguage);
        }, 500);

        return () => window.clearTimeout(timer);
    }, [location.pathname, selectedLanguage]);

    const handleLanguageChange = (event) => {
        const langCode = event.target.value;
        setSelectedLanguage(langCode);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
        setTranslateCookie(langCode);

        if (!applyGoogleTranslate(langCode)) {
            window.location.reload();
        }
    };

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
                <div className="translate-control">
                    <label htmlFor="navbar-language" className="translate-label" aria-label="Translate website">
                        <Languages size={16} />
                    </label>
                    <select
                        id="navbar-language"
                        className="translate-select"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        {LANGUAGE_OPTIONS.map((language) => (
                            <option key={language.code} value={language.code}>
                                {language.label}
                            </option>
                        ))}
                    </select>
                    <div id="google_translate_element" className="translate-widget-hidden" />
                </div>

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
