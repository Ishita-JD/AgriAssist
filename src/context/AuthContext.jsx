import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Email/Password Signup
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Email/Password Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Google Login
    function googleLogin() {
        return signInWithPopup(auth, googleProvider);
    }

    // Phone Login Helper
    function setupRecaptcha(number) {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
        });
        return signInWithPhoneNumber(auth, number, window.recaptchaVerifier);
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        // Timeout to prevent infinite loading if Firebase doesn't respond (e.g. missing config)
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            clearTimeout(timeout);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const value = {
        user,
        signup,
        login,
        googleLogin,
        setupRecaptcha,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
