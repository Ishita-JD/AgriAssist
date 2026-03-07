import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Chrome, X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, signup, googleLogin } = useAuth();

    if (!isOpen) return null;

    const getFriendlyError = (code) => {
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
            // User simply closed the popup — not a real error, ignore silently
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

                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="auth-subtitle">
                    {isLogin ? 'Enter your details to access your account' : 'Join AgriAssist and grow smarter today'}
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '1rem' }}>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
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
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button className="btn-google" onClick={handleGoogleLogin}>
                    <Chrome size={20} style={{ marginRight: '10px' }} />
                    Continue with Google
                </button>

                <p className="auth-switch">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
