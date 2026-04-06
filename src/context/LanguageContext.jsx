import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Force 'en' as source language for Google Translate to work from
    const [lang] = useState('en');

    const toggleLanguage = () => {
        // Now handled by Google Translate widget
        console.warn('Manual language toggle is now handled by the Google Translate widget.');
    };

    const t = (key) => {
        return translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
