import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, ArrowRight, Moon, Sun, Heart, Home, Settings, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isFavorites = location.pathname === '/favorites';
    const isChefStudio = location.pathname === '/chef-studio';
    const isAdmin = location.pathname === '/admin';

    const { isLight, toggleTheme } = useTheme();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background text-text transition-colors duration-300 flex flex-col font-vazir">
            {/* Top Header */}
            <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 py-3 mb-6 backdrop-blur-xl">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative w-10 h-10 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform animate-float border border-white/10">
                                <ChefHat size={24} className="drop-shadow-sm" />
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
                                {t('appName')}
                            </h1>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 mr-8">
                            <Link to="/" className={`text-sm font-medium transition-colors ${isHome ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary'}`}>
                                {t('navHome')}
                            </Link>
                            <Link to="/chef-studio" className={`text-sm font-medium transition-colors ${isChefStudio ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary'}`}>
                                {t('chefStudio') || "Chef Studio"}
                            </Link>
                            <Link to="/favorites" className={`text-sm font-medium transition-colors ${isFavorites ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary'}`}>
                                {t('navFavorites')}
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isHome && (
                            <Link to="/" className="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                                <ArrowRight size={20} />
                            </Link>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        >
                            {isLight ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto w-full px-4 pb-24 fade-in">
                <Outlet />
            </main>

            {/* Bottom Navigation Bar - Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-6 pt-3 px-6 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="max-w-md mx-auto flex items-center justify-between relative px-2">
                    <Link
                        to="/"
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${isHome ? 'text-green-600 dark:text-green-400 -translate-y-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <div className={`p-2 rounded-full transition-all ${isHome ? 'bg-green-500/10 shadow-lg shadow-green-500/20' : ''}`}>
                            <Home size={24} className={isHome ? 'fill-current' : ''} strokeWidth={isHome ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold transition-opacity ${isHome ? 'opacity-100' : 'opacity-0 h-0'}`}>{t('navHome')}</span>
                    </Link>

                    <Link
                        to="/chef-studio"
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${isChefStudio ? 'text-green-600 dark:text-green-400 -translate-y-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <div className={`p-2 rounded-full transition-all ${isChefStudio ? 'bg-green-500/10 shadow-lg shadow-green-500/20' : ''}`}>
                            <Sparkles size={24} className={isChefStudio ? 'fill-current' : ''} strokeWidth={isChefStudio ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold transition-opacity ${isChefStudio ? 'opacity-100' : 'opacity-0 h-0'}`}>{t('chefStudio') || "Chef"}</span>
                    </Link>

                    <Link
                        to="/favorites"
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${isFavorites ? 'text-green-600 dark:text-green-400 -translate-y-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <div className={`p-2 rounded-full transition-all ${isFavorites ? 'bg-green-500/10 shadow-lg shadow-green-500/20' : ''}`}>
                            <Heart size={24} className={isFavorites ? 'fill-current' : ''} strokeWidth={isFavorites ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold transition-opacity ${isFavorites ? 'opacity-100' : 'opacity-0 h-0'}`}>{t('navFavorites')}</span>
                    </Link>

                    <Link
                        to="/admin"
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${isAdmin ? 'text-green-600 dark:text-green-400 -translate-y-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <div className={`p-2 rounded-full transition-all ${isAdmin ? 'bg-green-500/10 shadow-lg shadow-green-500/20' : ''}`}>
                            <Settings size={24} className={isAdmin ? 'fill-current' : ''} strokeWidth={isAdmin ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold transition-opacity ${isAdmin ? 'opacity-100' : 'opacity-0 h-0'}`}>{t('navAdmin')}</span>
                    </Link>
                </div>
            </nav>
            <InstallPrompt />
            <Footer />
        </div>
    );
};

export default Layout;
