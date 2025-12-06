import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('zaffaron_language') || 'en'; // Default to English initially
    });

    useEffect(() => {
        // Check if language is already set in localStorage
        const storedLang = localStorage.getItem('zaffaron_language');
        if (storedLang) {
            setLanguage(storedLang);
            return;
        }

        // Fetch user's location to determine language
        const detectLanguage = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const countryCode = data.country_code; // e.g., "IR", "US"

                const farsiCountries = ['IR', 'AF', 'TJ'];
                const detectedLang = farsiCountries.includes(countryCode) ? 'fa' : 'en';

                setLanguage(detectedLang);
                localStorage.setItem('zaffaron_language', detectedLang);
            } catch (error) {
                console.error("Failed to detect location:", error);
                // Fallback to English if detection fails
                setLanguage('en');
            }
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        localStorage.setItem('zaffaron_language', language);

        // Update document direction and language
        const dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;

        // Update body class for font switching if needed
        if (language === 'en') {
            document.body.classList.add('font-sans-en');
            document.body.classList.remove('font-vazir');
        } else {
            document.body.classList.add('font-vazir');
            document.body.classList.remove('font-sans-en');
        }
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'fa' ? 'en' : 'fa');
    };

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
