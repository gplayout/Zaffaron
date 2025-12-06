import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('zaffaron_preferences');
        return saved ? JSON.parse(saved) : {
            dietary: [], // e.g., ['vegetarian', 'keto']
            time: 'any', // 'quick', 'medium', 'long'
            goal: [], // 'healthy', 'budget', 'learn'
            onboardingCompleted: false
        };
    });

    useEffect(() => {
        localStorage.setItem('zaffaron_preferences', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreferences = (newPrefs) => {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
    };

    const completeOnboarding = () => {
        setPreferences(prev => ({ ...prev, onboardingCompleted: true }));
    };

    const resetPreferences = () => {
        setPreferences({
            dietary: [],
            time: 'any',
            goal: [],
            onboardingCompleted: false
        });
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreferences, completeOnboarding, resetPreferences }}>
            {children}
        </PreferencesContext.Provider>
    );
};
