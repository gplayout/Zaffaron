import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../context/AIContext';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ChefHat, ArrowRight, Loader, Wand2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ChefStudio = () => {
    const navigate = useNavigate();
    const { generateRecipe, loading } = useAI();
    const { t, language } = useLanguage();
    const { addToast } = useToast();

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const newRecipe = await generateRecipe(prompt);
            if (newRecipe) {
                addToast(t('recipeCreated'), "success");
                // Navigate to the new recipe (assuming we add it to context or pass it via state)
                // For now, we'll pass it via state to a special preview route or just handle it here.
                // A better approach might be to add it to the 'allRecipes' context temporarily or permanently.
                // For this demo, let's navigate to a preview view.
                navigate(`/recipe/${encodeURIComponent(newRecipe.name)}`, { state: { recipe: newRecipe } });
            }
        } catch (error) {
            console.error("Creation failed:", error);
            addToast(t('errorCreating'), "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const suggestions = [
        "A spicy vegetarian pasta with Persian spices",
        "Gluten-free chocolate cake with saffron",
        "Quick 15-minute healthy breakfast",
        "Fusion tacos: Mexican x Iranian"
    ];

    return (
        <div className="min-h-screen pb-24 pt-20 px-4 animate-fade-in">
            <div className="container mx-auto max-w-2xl">

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 ring-1 ring-white/20 backdrop-blur-xl">
                        <ChefHat size={48} className="text-primary drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-300% animate-gradient">
                        {t('chefStudio')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                        {t('chefStudioDesc')}
                    </p>
                </div>

                {/* Input Section */}
                <div className="glass-panel p-2 rounded-3xl shadow-2xl shadow-primary/10 border border-white/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <form onSubmit={handleCreate} className="relative z-10">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('chefPromptPlaceholder')}
                            className="w-full h-40 p-6 bg-transparent text-lg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
                            disabled={isGenerating}
                        />

                        <div className="flex justify-between items-center px-4 pb-4">
                            <span className="text-xs text-gray-400 font-medium px-2">
                                {prompt.length}/500
                            </span>
                            <button
                                type="submit"
                                disabled={!prompt.trim() || isGenerating}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white shadow-lg transition-all duration-300
                                    ${!prompt.trim() || isGenerating
                                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed transform-none'
                                        : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/40 hover:scale-105 active:scale-95'
                                    }
                                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        <span>{t('creating')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        <span>{t('createRecipe')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Suggestions */}
                {!isGenerating && (
                    <div className="mt-12 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {t('tryAsking')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(s)}
                                    className="p-4 rounded-xl glass-panel border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-left text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between group"
                                >
                                    <span>{s}</span>
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State Visuals */}
                {isGenerating && (
                    <div className="mt-12 text-center space-y-4 animate-fade-in">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            <ChefHat size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
                        </div>
                        <p className="text-gray-500 animate-pulse font-medium">
                            {t('chefThinking')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefStudio;
