import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ scrolled, onLoginClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/advisory">Advisory</Link></li>
                    <li><Link to="/detector">Detector</Link></li>
                    <li><Link to="/schemes">Schemes</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>
            )}

            <div className="nav-auth">
                {user ? (
                    <div className="user-profile">
                        <img src={user.photoURL || 'https://via.placeholder.com/35'} alt="Profile" className="user-avatar" />
                        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
                    </div>
                ) : (
                    <>
                        <button onClick={onLoginClick} className="btn-login">Log In</button>
                        <button onClick={onLoginClick} className="btn-signup">Sign Up</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
