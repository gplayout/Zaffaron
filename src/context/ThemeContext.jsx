import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isLight, setIsLight] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'light';
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isLight) {
            root.classList.add('light');
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.remove('light');
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLight]);

    const toggleTheme = () => setIsLight(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isLight, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
