import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import RecipeList from '../components/RecipeList';
import { Heart, BookOpen } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites } = useFavorites();
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-2 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 mb-4 shadow-lg shadow-red-500/20">
                    <Heart size={32} className="fill-current animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                    {t('favoritesTitle')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    {t('favoritesSubtitle')}
                </p>
            </div>

            {favorites.length > 0 ? (
                <RecipeList recipes={favorites} categoryTitle="" />
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 glass-panel rounded-3xl mx-4 border-dashed border-2 border-gray-200 dark:border-white/10">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <BookOpen size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">{t('favoritesEmptyTitle')}</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            {t('favoritesEmptySubtitle')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
