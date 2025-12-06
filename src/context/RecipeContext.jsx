import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import recipesData from '../data/recipes.json';
import { usePreferences } from './PreferencesContext';

import { generateSlug } from '../utils/slugUtils';
import { translationDB } from '../utils/aiTranslation';

const RecipeContext = createContext();

export const useRecipes = () => {
    const context = useContext(RecipeContext);
    if (!context) {
        throw new Error('useRecipes must be used within a RecipeProvider');
    }
    return context;
};

export const RecipeProvider = ({ children }) => {
    // State holds the array of categories, each containing items (recipes)
    const [categories, setCategories] = useState(() => {
        console.log("RecipeContext: Initializing categories...");
        try {
            // console.log("RecipeContext: Initializing categories...");
            // FORCE BYPASS LOCAL STORAGE FOR DEBUGGING
            // const saved = localStorage.getItem('app_recipes');
            // if (saved) { ... }

            console.log("RecipeContext: Loading raw from JSON, length:", recipesData?.length);

            // Initial load from JSON file - also purged AND SLUGS ADDED
            return recipesData.map(cat => ({
                ...cat,
                items: cat.items.map(item => ({
                    ...item,
                    image: null,
                    videoUrl: null,
                    slug: item.slug || generateSlug(item.name)
                }))
            }));
        } catch (e) {
            console.error("RecipeContext: Error loading categories", e);
            return recipesData;
        }
    });

    // Save to localStorage whenever categories change
    React.useEffect(() => {
        try {
            localStorage.setItem('app_recipes', JSON.stringify(categories));
        } catch (e) {
            // Ignore storage errors
        }
    }, [categories]);



    // Helper to get all recipes flattened - Memoized to prevent recalculation on every render
    const allRecipes = useMemo(() => {
        return categories.flatMap(cat =>
            cat.items.map(item => {
                // Generate slug: Use English name if available, otherwise original name
                const englishName = translationDB[item.name]?.name;
                const slugSource = englishName || item.name;

                return {
                    ...item,
                    category: cat.title,
                    categoryId: cat.id,
                    slug: generateSlug(slugSource) // Generate slug on the fly
                };
            })
        );
    }, [categories]);

    console.log("RecipeContext: allRecipes count:", allRecipes.length);

    // Helper to find recipe by slug
    const getRecipeBySlug = useCallback((slug) => {
        if (!slug) return null;

        // Normalize slug
        const decodedSlug = decodeURIComponent(slug).trim();
        const normalizedSlug = decodedSlug.toLowerCase().replace(/-/g, ' ');

        // 1. Try exact slug match
        let found = allRecipes.find(r => r.slug === decodedSlug || r.slug === slug);

        // 2. Try name match (exact)
        if (!found) {
            found = allRecipes.find(r => r.name === decodedSlug || r.name === slug);
        }

        // 3. Try name match (case insensitive)
        if (!found) {
            found = allRecipes.find(r => r.name.toLowerCase() === decodedSlug.toLowerCase());
        }

        // 4. Try normalized name match (replace dashes with spaces)
        if (!found) {
            found = allRecipes.find(r => r.name.toLowerCase() === normalizedSlug);
        }

        // 5. Try finding by English name if available in translationDB
        if (!found) {
            // Reverse lookup: Find the Persian name that maps to this English slug
            // This is expensive but necessary if we only have the English slug
            // We iterate all recipes, check their translation, slugify it, and compare
            found = allRecipes.find(r => {
                const englishName = translationDB[r.name]?.name;
                if (!englishName) return false;
                const generatedSlug = generateSlug(englishName);
                return generatedSlug === slug || generatedSlug === decodedSlug;
            });
        }

        return found;
    }, [allRecipes]);

    // Smart Sort: Filter recipes based on user preferences
    const { preferences } = usePreferences();

    // Smart Sort: Weighted Scoring System
    const smartRecipes = useMemo(() => {
        if (!preferences) return allRecipes.map(r => ({ ...r, score: 0, matchReason: [] }));

        const scoredRecipes = allRecipes.map(recipe => {
            let score = 0;
            let matchReasons = [];

            // 1. Dietary Match (Critical: +50, Penalty: -100)
            if (preferences.dietary?.includes('vegetarian')) {
                const nonVegKeywords = ['گوشت', 'مرغ', 'ماهی', 'میگو', 'کباب', 'جوجه', 'meat', 'chicken', 'fish', 'shrimp', 'kebab'];
                const hasMeat = nonVegKeywords.some(keyword =>
                    recipe.ingredients?.some(ing => ing.toLowerCase().includes(keyword)) ||
                    recipe.name.toLowerCase().includes(keyword)
                );

                if (!hasMeat) {
                    score += 50;
                    matchReasons.push('vegetarian');
                } else {
                    score -= 100;
                }
            }

            if (preferences.dietary?.includes('glutenFree')) {
                const glutenKeywords = [
                    'flour', 'wheat', 'bread', 'pasta', 'noodle', 'barley', 'spaghetti', 'macaroni', 'lasagna', 'toast',
                    'نان', 'آرد', 'ماکارونی', 'پاستا', 'رشته', 'لازانیا', 'نان تست'
                ];
                const hasGluten = glutenKeywords.some(keyword =>
                    recipe.ingredients?.some(ing => ing.toLowerCase().includes(keyword)) ||
                    recipe.name.toLowerCase().includes(keyword)
                );

                if (!hasGluten) {
                    score += 50;
                    matchReasons.push('glutenFree');
                } else {
                    score -= 100;
                }
            }

            // 2. Time Match (+30)
            if (preferences.time === 'quick') {
                // Quick: < 30 mins or "Instant"/"Quick" in name or short instructions
                const isQuick = recipe.name.includes('Instant') ||
                    recipe.name.includes('فوری') ||
                    (recipe.instructions && recipe.instructions.length < 5);

                if (isQuick) {
                    score += 30;
                    matchReasons.push('quick');
                }
            } else if (preferences.time === 'long') {
                // Long: > 1 hour or complex instructions
                const isLong = recipe.instructions && recipe.instructions.length > 8;
                if (isLong) {
                    score += 30;
                    matchReasons.push('elaborate');
                }
            }

            // 3. Goal Match (+20)
            if (preferences.goal?.includes('healthy')) {
                const healthyKeywords = ['salad', 'soup', 'veggie', 'steam', 'grill', 'سالاد', 'سوپ', 'سبزی', 'بخارپز', 'کباب'];
                const isHealthy = healthyKeywords.some(k => recipe.name.toLowerCase().includes(k));

                if (isHealthy) {
                    score += 20;
                    matchReasons.push('healthy');
                }
            }

            // 4. Base Score (Newness/Popularity - Mock)
            if (recipe.rating && parseFloat(recipe.rating) > 4.5) {
                score += 10;
                matchReasons.push('popular');
            }

            return { ...recipe, score, matchReason: matchReasons };
        });

        // Sort by score descending
        return scoredRecipes.sort((a, b) => b.score - a.score);

    }, [allRecipes, preferences]);

    // Helper to format ingredients and instructions back into the text format
    const formatRecipeText = (ingredients, instructions) => {
        return `مواد لازم:\n${ingredients.join('\n')}\n\nطرز تهیه:\n${instructions.join('\n')}`;
    };

    // Function to add a new recipe
    const addRecipe = useCallback((newRecipe) => {
        setCategories((prevCategories) => {
            const categoryIndex = prevCategories.findIndex(c => c.title === newRecipe.category);

            if (categoryIndex === -1) {
                return prevCategories;
            }

            const updatedCategories = [...prevCategories];
            const category = { ...updatedCategories[categoryIndex] };

            // Add new item
            category.items = [...category.items, {
                name: newRecipe.title, // Map title to name
                image: newRecipe.image,
                recipe: formatRecipeText(newRecipe.ingredients, newRecipe.instructions)
            }];

            updatedCategories[categoryIndex] = category;
            return updatedCategories;
        });
    }, []);

    // Function to update an existing recipe
    const updateRecipe = useCallback((oldRecipe, newRecipe) => {
        setCategories(prev => {
            let newData = [...prev];

            // 1. Remove from old category
            const oldCatIndex = newData.findIndex(c => c.title === oldRecipe.category);
            if (oldCatIndex > -1) {
                const oldCat = { ...newData[oldCatIndex] };
                oldCat.items = oldCat.items.filter(i => i.name !== oldRecipe.name);
                newData[oldCatIndex] = oldCat;
            }

            // 2. Add to new category
            const newCatIndex = newData.findIndex(c => c.title === newRecipe.category);
            if (newCatIndex > -1) {
                const newCat = { ...newData[newCatIndex] };
                newCat.items = [...newCat.items, {
                    name: newRecipe.title,
                    image: newRecipe.image,
                    recipe: formatRecipeText(newRecipe.ingredients, newRecipe.instructions)
                }];
                newData[newCatIndex] = newCat;
            }

            return newData;
        });
    }, []);

    // Function to delete a recipe
    const deleteRecipe = useCallback((recipeName, categoryTitle) => {
        setCategories((prevCategories) =>
            prevCategories.map(cat => {
                if (cat.title === categoryTitle) {
                    return {
                        ...cat,
                        items: cat.items.filter(item => item.name !== recipeName)
                    };
                }
                return cat;
            })
        );
    }, []);

    // Function to add a review (comment + rating)
    const addReview = useCallback((recipeName, review) => {
        setCategories(prevCategories => {
            return prevCategories.map(cat => {
                const itemIndex = cat.items.findIndex(item => item.name === recipeName);
                if (itemIndex > -1) {
                    const updatedItems = [...cat.items];
                    const item = { ...updatedItems[itemIndex] };

                    // Initialize reviews array if it doesn't exist
                    const reviews = item.reviews || [];
                    const newReviews = [review, ...reviews]; // Add new review to top

                    item.reviews = newReviews;

                    // Update average rating
                    const totalRating = newReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
                    item.rating = (totalRating / newReviews.length).toFixed(1); // Keep 1 decimal
                    item.reviewCount = newReviews.length;

                    updatedItems[itemIndex] = item;
                    return { ...cat, items: updatedItems };
                }
                return cat;
            });
        });
    }, []);

    // User's liked recipes (separate from favorites, for the public counter)
    const [userLikes, setUserLikes] = useState(() => {
        try {
            const saved = localStorage.getItem('user_likes');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Save user likes
    React.useEffect(() => {
        localStorage.setItem('user_likes', JSON.stringify(userLikes));
    }, [userLikes]);

    // Function to toggle like
    const toggleLike = useCallback((recipeName) => {
        // We need to access the current userLikes state, so we can't just use setCategories callback alone for the likes logic
        // But wait, toggleLike logic uses userLikes state to determine if it's liked or not.
        // So we need userLikes in dependency.

        setUserLikes(prev => {
            const isLiked = prev.includes(recipeName);
            if (isLiked) {
                return prev.filter(name => name !== recipeName);
            } else {
                return [...prev, recipeName];
            }
        });

        // We also need to update the global counter. 
        // Note: This logic assumes the userLikes state update happens. 
        // Ideally we should pass the "isLiked" status to the setCategories updater to be safe, 
        // but since we are inside the callback, we can just check the current userLikes.
        // Actually, to be perfectly safe with concurrent updates, we should use the functional update for setUserLikes 
        // and then trigger the category update. 
        // But for simplicity and matching previous logic, let's use the userLikes from closure (dependency).

        // Wait, if we use userLikes from closure, we must include it in dependency.

        setCategories(prevCategories => {
            // We need to know if it WAS liked or not.
            // We can't access the *pending* userLikes state here.
            // But we can check the *current* userLikes state (from closure).
            // If userLikes.includes(recipeName), then we are unliking.

            // This requires userLikes to be in dependency array.
            // Which means toggleLike changes when userLikes changes.

            // Let's re-implement the logic to be safe.
            return prevCategories.map(cat => {
                const itemIndex = cat.items.findIndex(item => item.name === recipeName);
                if (itemIndex > -1) {
                    const updatedItems = [...cat.items];
                    const item = { ...updatedItems[itemIndex] };

                    const currentLikes = item.likes || 0;
                    // We need to know if we are adding or removing.
                    // We can check userLikes.includes(recipeName)
                    // But we need to make sure userLikes is fresh.

                    // Let's assume userLikes is fresh from dependency.
                    const isLiked = userLikes.includes(recipeName);
                    item.likes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

                    updatedItems[itemIndex] = item;
                    return { ...cat, items: updatedItems };
                }
                return cat;
            });
        });
    }, [userLikes]);

    // Function to restore data from backup
    const restoreData = useCallback((newData) => {
        try {
            if (!Array.isArray(newData)) {
                throw new Error('Invalid data format: Expected an array');
            }
            setCategories(newData);
            return true;
        } catch (e) {
            console.error('Failed to restore data', e);
            return false;
        }
    }, []);

    const contextValue = useMemo(() => ({
        recipes: categories,
        allRecipes,
        smartRecipes,
        getRecipeBySlug, // Export helper
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addReview,
        toggleLike,
        userLikes,
        restoreData,
    }), [categories, allRecipes, smartRecipes, getRecipeBySlug, addRecipe, updateRecipe, deleteRecipe, addReview, toggleLike, userLikes, restoreData]);

    return (
        <RecipeContext.Provider value={contextValue}>
            {children}
        </RecipeContext.Provider>
    );
};
