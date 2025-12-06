import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, Heart, ChefHat } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useFavorites } from '../hooks/useFavorites';

import { useLanguage } from '../context/LanguageContext';

import { categoryMapping, defaultCategory } from '../utils/categoryMapping';

import { translationDB } from '../utils/aiTranslation';

const RecipeList = ({ recipes, categoryTitle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    // Get category image
    const categoryData = categoryMapping[categoryTitle] || defaultCategory;

    const handleFavoriteClick = (e, recipe) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        const isFav = isFavorite(recipe.name);
        toggleFavorite(recipe);

        if (!isFav) {
            addToast(t('addedToFavorites'), 'success');
        } else {
            addToast(t('removedFromFavorites'), 'info');
        }
    };

    const filteredRecipes = recipes.filter(recipe => {
        const nameToCheck = language === 'en' && translationDB[recipe.name] ? translationDB[recipe.name].name : recipe.name;
        return nameToCheck.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/10">
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <ChefHat className="text-secondary" />
                        {t(categoryTitle)}
                    </h2>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pr-12 rounded-2xl glass-panel bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((recipe, index) => {
                    const displayName = (language === 'en' && translationDB[recipe.name]) ? translationDB[recipe.name].name : recipe.name;

                    return (
                        <Link
                            key={index}
                            to={`/recipe/${recipe.slug || encodeURIComponent(recipe.name)}`}
                            state={{ recipe, categoryTitle }}
                            className="block glass-panel rounded-2xl hover:bg-white/10 transition-all duration-500 shadow-sm hover:shadow-lg group relative border border-white/5 hover:border-primary/30 overflow-hidden animate-scale-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image Section */}
                            <div className="h-40 relative overflow-hidden">
                                <img
                                    key={recipe.image} // Force re-render if image changes
                                    src={recipe.image || categoryData.image}
                                    alt={recipe.name}
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = categoryData.image;
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                <button
                                    onClick={(e) => handleFavoriteClick(e, recipe)}
                                    className="absolute top-3 left-3 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md transition-colors z-10"
                                >
                                    <Heart
                                        size={20}
                                        className={`transition-all duration-300 ${isFavorite(recipe.name) ? "fill-red-500 text-red-500 scale-110" : "text-white hover:text-red-400"}`}
                                    />
                                </button>

                                {/* Title Overlay for better visibility */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-bold text-lg text-white drop-shadow-md line-clamp-2 leading-snug">
                                        {displayName}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        {t('viewRecipe')}
                                        <ChevronLeft size={14} className={`transition-transform ${language === 'en' ? 'rotate-180' : 'group-hover:-translate-x-1'}`} />
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}

                {filteredRecipes.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-600 dark:text-gray-400 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <p>{t('noRecipesFound')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeList;
