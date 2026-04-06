import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Chrome, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, signup, googleLogin } = useAuth();
    const { t, lang } = useLanguage();

    if (!isOpen) return null;

    const getFriendlyError = (code) => {
        if (lang === 'hi') {
            switch (code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    return 'गलत ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।';
                case 'auth/email-already-in-use':
                    return 'इस ईमेल वाला खाता पहले से मौजूद है। लॉग इन करने का प्रयास करें।';
                case 'auth/weak-password':
                    return 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।';
                case 'auth/invalid-email':
                    return 'कृपया एक वैध ईमेल पता दर्ज करें।';
                case 'auth/too-many-requests':
                    return 'बहुत अधिक विफल प्रयास। कृपया थोड़ा इंतज़ार करें और पुनः प्रयास करें।';
                case 'auth/network-request-failed':
                    return 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।';
                default:
                    return 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।';
            }
        }
        switch (code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists. Try logging in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please wait a moment and try again.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return 'Something went wrong. Please try again.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            onClose();
        } catch (err) {
            setError(getFriendlyError(err.code));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await googleLogin();
            onClose();
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                return;
            }
            setError(err.message);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <h2>{isLogin ? t('authWelcome') : t('authCreate')}</h2>
                <p className="auth-subtitle">
                    {isLogin ? t('authSubtitleLogin') : t('authSubtitleSignup')}
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '1rem' }}>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder={t('placeholderEmail')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth-submit">
                        {isLogin ? t('navLogin') : t('navSignup')}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>{t('authOr')}</span>
                </div>

                <button className="btn-google" onClick={handleGoogleLogin}>
                    <Chrome size={20} style={{ marginRight: '10px' }} />
                    {t('authGoogle')}
                </button>

                <p className="auth-switch">
                    {isLogin ? t('authSwitchLogin') : t('authSwitchSignup')}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? t('navSignup') : t('navLogin')}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
