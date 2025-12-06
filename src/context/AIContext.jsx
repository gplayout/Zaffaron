import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { RecipeAgent } from '../agents/RecipeAgent';
import { useLanguage } from './LanguageContext';

const AIContext = createContext();

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};

export const AIProvider = ({ children }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const agentRef = useRef(null);

    // Initialize Agent
    useEffect(() => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (apiKey) {
            agentRef.current = new RecipeAgent(apiKey);
        } else {
            console.warn("Missing OpenAI API Key. Chef features will be disabled.");
        }
    }, []);

    // Cache for enhanced recipes
    const [enhancedCache, setEnhancedCache] = useState(() => {
        try {
            const saved = localStorage.getItem('ai_enhanced_cache');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to load AI cache", e);
            return {};
        }
    });

    const getEnhancedRecipe = useCallback(async (recipe) => {
        if (!agentRef.current || !recipe) return recipe;
        // For now, we return original as 'enhance' isn't fully ported to Agent yet
        // TODO: Port 'enhanceRecipe' logic to RecipeAgent if needed
        return recipe;
    }, []);

    const generateRecipe = useCallback(async (prompt) => {
        if (!agentRef.current) {
            setError("Chef is offline (Missing API Key).");
            return null;
        }

        setLoading(true);
        setError(null);
        try {
            // Use the Agent!
            const newRecipe = await agentRef.current.suggestRecipe(prompt);
            return newRecipe;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (recipe, history, message) => {
        // Placeholder for chat logic if we move it to Agent later
        return "Chat feature is migrating to the new Agent system...";
    }, []);

    const recoverRecipeImage = useCallback(async (recipe) => {
        // Keep existing logic or move to ImageAgent later
        return null;
    }, []);

    const generateVideo = useCallback(async (recipe) => {
        // Keep existing logic
        return null;
    }, []);

    const value = {
        loading,
        error,
        getEnhancedRecipe,
        generateRecipe, // This now uses RecipeAgent
        sendMessage,
        recoverRecipeImage,
        generateVideo
    };

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};
