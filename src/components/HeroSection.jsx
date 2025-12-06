import React, { useState, useEffect, useRef } from 'react';
import { Search, ChefHat, ArrowDown, X, Settings, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { translationDB } from '../utils/aiTranslation';
import heroBg from '../assets/hero_bg.png';

const HeroSection = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { allRecipes } = useRecipes();
    const { resetPreferences } = usePreferences();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    const scrollToCategories = () => {
        const element = document.getElementById('categories');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (query.trim().length > 1) {
            const filtered = allRecipes.filter(recipe =>
                recipe.name.includes(query) ||
                (recipe.ingredients && recipe.ingredients.some(i => i.includes(query)))
            );
            setResults(filtered.slice(0, 5)); // Limit to 5 results
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, allRecipes]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectRecipe = (recipeName) => {
        const recipe = allRecipes.find(r => r.name === recipeName);
        const slug = recipe?.slug || encodeURIComponent(recipeName);
        navigate(`/recipe/${slug}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden mb-12 group">
            {/* Background Image with Parallax-like effect */}
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
                src={heroBg}
                alt="Cooking Background"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Top Actions */}
            <div className="absolute top-6 left-6 z-30 flex gap-3">
                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 px-3"
                    title={t('changeLanguage')}
                >
                    <Globe size={20} />
                    <span className="text-xs font-bold uppercase">{language === 'fa' ? 'EN' : 'FA'}</span>
                </button>

                {/* Settings Button */}
                <button
                    onClick={resetPreferences}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10"
                    title={t('settingsTitle')}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 space-y-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-glow animate-fade-in">
                    <ChefHat size={40} className="text-white" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg animate-slide-up">
                    {t('heroTitle')} <span className="text-primary">{t('heroTitleHighlight')}</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light leading-relaxed animate-slide-up whitespace-pre-line" style={{ animationDelay: '0.1s' }}>
                    {t('heroSubtitle')}
                </p>

                {/* Search Bar Visual */}
                <div className="w-full max-w-md mt-8 relative group animate-slide-up z-50" style={{ animationDelay: '0.2s' }} ref={searchRef}>
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
                    <div className="relative bg-white dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-2 flex items-center shadow-2xl border border-white/20">
                        <Search className={`text-gray-400 ${language === 'fa' ? 'ml-2 mr-3' : 'mr-2 ml-3'}`} size={24} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-white placeholder-gray-400 h-10"
                            dir={language === 'fa' ? 'rtl' : 'ltr'}
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {isOpen && results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                            <ul>
                                {results.map((recipe, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleSelectRecipe(recipe.name)}
                                            className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${language === 'fa' ? 'text-right' : 'text-left'}`}
                                        >
                                            <img src={recipe.image} alt={recipe.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                    {(language === 'en' && translationDB[recipe.name]) ? translationDB[recipe.name].name : recipe.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t(recipe.category)}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll Indicator */}
            <button
                onClick={scrollToCategories}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors animate-bounce"
            >
                <ArrowDown size={32} />
            </button>
        </div>
    );
};

export default HeroSection;
