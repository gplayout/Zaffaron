import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useRecipes } from './RecipeContext';

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { allRecipes } = useRecipes();
    const [favoriteNames, setFavoriteNames] = useState(() => {
        try {
            const saved = localStorage.getItem('zaffaron_favorites');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            // Migration: if stored as objects, extract names
            if (parsed.length > 0 && typeof parsed[0] === 'object') {
                return parsed.map(f => f.name);
            }
            return parsed;
        } catch (e) {
            console.error("Failed to load favorites", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('zaffaron_favorites', JSON.stringify(favoriteNames));
        } catch (e) {
            console.error("Failed to save favorites", e);
        }
    }, [favoriteNames]);

    // Derive full recipe objects from names
    const favorites = useMemo(() => {
        return favoriteNames
            .map(name => allRecipes.find(r => r.name === name))
            .filter(Boolean); // Remove nulls if recipe not found
    }, [favoriteNames, allRecipes]);

    const addFavorite = (recipe) => {
        setFavoriteNames(prev => {
            if (prev.includes(recipe.name)) return prev;
            return [...prev, recipe.name];
        });
    };

    const removeFavorite = (recipeName) => {
        setFavoriteNames(prev => prev.filter(name => name !== recipeName));
    };

    const isFavorite = (recipeName) => {
        return favoriteNames.includes(recipeName);
    };

    const toggleFavorite = (recipe) => {
        if (isFavorite(recipe.name)) {
            removeFavorite(recipe.name);
        } else {
            addFavorite(recipe);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
