import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { parseRecipe } from '../utils/dataParser';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../hooks/useToast';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/AIContext';
import { Share2, Heart, Copy, Check, ArrowRight, ChefHat, Utensils, Moon, Sun, Sparkles, Monitor, Smartphone, Play, Instagram, Crown } from 'lucide-react';
import StarRating from './StarRating';
import SocialShare from './SocialShare';
import FeedCard from './FeedCard';
import CookingMode from './CookingMode';
import VideoPlayer from './VideoPlayer';
import ShareCard from './ShareCard';
import { useWakeLock } from '../hooks/useWakeLock';
import { getTranslation } from '../utils/aiTranslation';
import { formatTime } from '../utils/timeUtils';
import { categoryMapping, defaultCategory } from '../utils/categoryMapping';
import { Helmet } from 'react-helmet-async';
import { publishingAgent as printingAgent } from '../services/PublishingAgent';
import { marketingAgent } from '../services/MarketingAgent';
import { BusinessAgent } from '../services/BusinessAgent';
import PremiumLock from './PremiumLock';
import ShopIngredients from './ShopIngredients';

const RecipeDetail = () => {
    const { state } = useLocation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const favoritesHook = useFavorites();
    const isFavorite = favoritesHook?.isFavorite || (() => false);
    const toggleFavorite = favoritesHook?.toggleFavorite || (() => { });

    const { addToast } = useToast();
    const { allRecipes, getRecipeBySlug, addReview, toggleLike, userLikes } = useRecipes();
    const { isLight, toggleTheme } = useTheme();
    const { t, language } = useLanguage();
    const { isSupported, isLocked, toggleWakeLock } = useWakeLock();
    const { getEnhancedRecipe, loading: aiLoading, recoverRecipeImage, generateVideo } = useAI();

    const [copied, setCopied] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const progressBarRef = React.useRef(null);
    const shareCardRef = React.useRef(null);

    const [checkedIngredients, setCheckedIngredients] = useState({});

    // Image Error State for Safety (Prevent Infinite Loops)
    const [imageError, setImageError] = useState(false);

    // Translation & AI State
    const [enhancedRecipe, setEnhancedRecipe] = useState(null);
    const [showCookingMode, setShowCookingMode] = useState(false);

    // Premium Logic
    const [isPremium, setIsPremium] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const originalRecipe = useMemo(() => {
        console.log("RecipeDetail: slug param:", slug);
        if (state?.recipe) return state.recipe;
        if (!slug) return null;
        if (!allRecipes || !Array.isArray(allRecipes)) {
            console.log("RecipeDetail: allRecipes not ready", allRecipes);
            return null;
        }
        const found = getRecipeBySlug(slug);
        console.log("RecipeDetail: Found recipe?", found?.name);
        if (found) return found;
        const decodedName = decodeURIComponent(slug);
        return allRecipes.find(r => r.name === decodedName || r.name === slug);
    }, [slug, allRecipes, getRecipeBySlug, state]);

    const recipe = useMemo(() => {
        let base = originalRecipe;
        if (enhancedRecipe) base = { ...base, ...enhancedRecipe };
        return base;
    }, [originalRecipe, enhancedRecipe]);

    // Parse Data
    const { ingredients, instructions } = useMemo(() => {
        if (!recipe) return { ingredients: [], instructions: [] };
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            return { ingredients: recipe.ingredients, instructions: recipe.instructions || [] };
        }
        return parseRecipe(recipe.recipe);
    }, [recipe]);

    // Effects
    useEffect(() => {
        if (originalRecipe) getEnhancedRecipe(originalRecipe).then(setEnhancedRecipe);
    }, [originalRecipe]);

    // Premium Check
    useEffect(() => {
        if (recipe) {
            const premium = BusinessAgent.isPremium(recipe);
            const access = BusinessAgent.hasAccess();
            setIsPremium(premium);
            setIsUnlocked(access);
        }
    }, [recipe]);

    const handleUnlock = async () => {
        await BusinessAgent.unlockContent();
        setIsUnlocked(true);
        addToast(t('contentUnlocked'), 'success');
    };

    // Initialize image source and video
    const [imageSrc, setImageSrc] = useState(null);
    useEffect(() => {
        if (recipe) {
            const primary = recipe.image;
            const categoryImg = categoryMapping[recipe.category]?.image;
            const defaultImg = defaultCategory.image;
            // Reset error state when recipe changes
            setImageError(false);
            setImageSrc(primary || categoryImg || defaultImg);

            if (!primary && !isRecoveringImage) {
                setIsRecoveringImage(true);
                recoverRecipeImage(recipe).then(newUrl => {
                    if (newUrl) {
                        setImageSrc(newUrl);
                        setImageError(false); // Reset error if we have a new AI image
                    }
                    setIsRecoveringImage(false);
                });
            }
        }
    }, [recipe]);

    const [isRecoveringImage, setIsRecoveringImage] = useState(false);
    const [aiVideo, setAiVideo] = useState(null);

    useEffect(() => {
        if (recipe && !originalRecipe.videoUrl && !aiVideo) {
            generateVideo(recipe).then(vid => {
                if (vid) setAiVideo(vid);
            });
        }
    }, [recipe, originalRecipe]);

    // Safe Image Error Handler
    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
        }
    };

    // Determine effective image source
    const effectiveImageSrc = imageError
        ? (categoryMapping[recipe?.category]?.image || defaultCategory.image)
        : imageSrc;

    const isFav = originalRecipe ? isFavorite(originalRecipe.name) : false;
    const isLiked = originalRecipe ? userLikes?.includes(originalRecipe.name) : false;
    const hasVideo = useMemo(() => (originalRecipe?.videoUrl && originalRecipe.videoUrl !== "") || aiVideo?.url || false, [originalRecipe, aiVideo]);
    // Allow video player if we have a video source OR if we want to show the specific mixkit fallback
    const videoSource = (originalRecipe?.videoUrl && originalRecipe?.videoUrl !== "") ? originalRecipe.videoUrl : aiVideo?.url;

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 100) setScrolled(true);
            else setScrolled(false);

            if (progressBarRef.current) {
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (offset / height) * 100;
                progressBarRef.current.style.width = `${scrolled}%`;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const copyIngredients = () => {
        const text = ingredients.join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast(t('ingredientsCopied'), 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleIngredient = (idx) => {
        setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleToggleFavorite = (e) => {
        if (e) e.preventDefault();
        if (originalRecipe) {
            toggleFavorite(originalRecipe);
            if (!isFav) addToast(t('addedToFavorites'), 'success');
            else addToast(t('removedFromFavorites'), 'info');
        }
    };

    const handleToggleLike = () => {
        if (originalRecipe) {
            toggleLike(originalRecipe.name);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.name,
                    text: `Check out this recipe for ${recipe.name} on Zaffaron!`,
                    url: window.location.href,
                });
            } catch (err) { console.error("Share failed", err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            addToast(t('linkCopied'), 'success');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Metadata Safe
    const metadata = useMemo(() => {
        try {
            return recipe ? printingAgent.generateMetadata(recipe, language) : { title: 'Zaffaron' };
        } catch (e) { return { title: 'Zaffaron' }; }
    }, [recipe, language]);

    if (!recipe) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    const displayName = useMemo(() => recipe.name || 'Recipe', [recipe]);

    // Filter related recipes (Simple random or same category logic)
    const relatedRecipes = useMemo(() => {
        if (!allRecipes) return [];
        return allRecipes
            .filter(r => r.category === recipe.category && r.name !== recipe.name)
            .slice(0, 3);
    }, [allRecipes, recipe]);

    return (
        <div className="min-h-screen bg-surface pb-24">
            <Helmet>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(printingAgent.generateSchema(recipe))}
                </script>
            </Helmet>

            {/* Scroll Progress Bar */}
            <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-600 z-50 transition-all duration-300" ref={progressBarRef}></div>

            {/* Floating Header */}
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className={`p-2 rounded-full ${scrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white' : 'bg-black/30 text-white backdrop-blur-sm'}`}>
                        <ArrowRight className="rotate-180" size={24} />
                    </button>
                    {scrolled && <h1 className="text-lg font-bold truncate max-w-[200px] text-gray-900 dark:text-white">{displayName}</h1>}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className={`p-2 rounded-full ${scrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white' : 'bg-black/30 text-white backdrop-blur-sm'}`}>
                            {isLight ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION - REBUILT WITH SAFETY */}
            <div className={`relative ${hasVideo && videoSource ? 'h-auto min-h-[500px]' : 'h-[60vh] min-h-[500px]'} -mt-20 mb-8 overflow-hidden group`}>
                {hasVideo && videoSource ? (
                    <div className="pt-20">
                        <VideoPlayer
                            src={videoSource}
                            poster={effectiveImageSrc}
                            aspectRatio="aspect-video"
                        />
                        {/* Overlay Content for Video */}
                        <div className="p-6 md:p-8 bg-gradient-to-b from-transparent to-surface">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-primary rounded-full">{recipe.category || 'General'}</span>
                                {aiLoading && <span className="flex items-center gap-1 text-xs text-primary animate-pulse"><Sparkles size={12} /> AI Enhanced</span>}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight drop-shadow-sm">{displayName}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-6">
                                <div className="flex items-center gap-2"><Utensils size={18} className="text-primary" /> <span>{recipe.difficulty || 'Easy'}</span></div>
                                <div className="flex items-center gap-2"><ChefHat size={18} className="text-primary" /> <span>{formatTime(recipe.prepTime)}</span></div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`p-3 rounded-full border transition-all transform hover:scale-105 ${isFav ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-red-500'}`}
                                >
                                    <Heart className={isFav ? "fill-white" : ""} size={24} />
                                </button>
                                <button onClick={handleShare} className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <Share2 size={24} />
                                </button>
                                <button onClick={() => setShowCookingMode(true)} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 py-3 px-6">
                                    <Monitor size={20} />
                                    {t('cookingMode')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0">
                            {effectiveImageSrc && (
                                <img
                                    src={effectiveImageSrc}
                                    alt={recipe.name}
                                    onError={handleImageError}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 text-white pb-12">
                            <div className="container mx-auto px-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-primary rounded-full">{recipe.category || 'General'}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">{displayName}</h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-gray-200 mb-8 backdrop-blur-sm bg-white/10 p-4 rounded-xl inline-flex">
                                    <div className="flex items-center gap-2"><Utensils size={18} className="text-primary" /> <span>{recipe.difficulty || 'Easy'}</span></div>
                                    <div className="flex items-center gap-2"><ChefHat size={18} className="text-primary" /> <span>{formatTime(recipe.prepTime)}</span></div>
                                    {/* Rating */}
                                    {recipe.rating && !isNaN(parseFloat(recipe.rating)) && (
                                        <div className="flex items-center gap-2 border-l border-white/20 pl-6">
                                            <StarRating rating={parseFloat(recipe.rating)} />
                                            <span className="font-bold">{recipe.rating}</span>
                                            <span className="text-xs opacity-70">({recipe.reviews || 0} reviews)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`p-3 rounded-full border transition-all transform hover:scale-105 ${isFav ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30' : 'bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-md'}`}
                                    >
                                        <Heart className={isFav ? "fill-white" : ""} size={24} />
                                    </button>
                                    <button onClick={handleShare} className="p-3 rounded-full bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                    <button onClick={() => setShowCookingMode(true)} className="bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 py-3 px-8 hover:-translate-y-1 transform">
                                        <Monitor size={20} />
                                        {t('startCooking')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Everything Else */}
            <div className="container mx-auto px-4 space-y-12">
                {isPremium && !isUnlocked ? (
                    <div className="py-12 border border-red-500 p-6 rounded-2xl bg-red-50 text-center dark:bg-red-900/20">
                        <h3 className="text-2xl font-bold text-red-600 mb-2">Premium Content Locked</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">Unlock to view ingredients and instructions.</p>
                        <PremiumLock onUnlock={handleUnlock} />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Ingredients Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Utensils className="text-primary" size={24} />
                                        Ingredients
                                    </h2>
                                    <button onClick={copyIngredients} className="text-gray-400 hover:text-primary transition-colors relative">
                                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <ul className="space-y-3">
                                    {ingredients.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group cursor-pointer" onClick={() => handleToggleIngredient(idx)}>
                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checkedIngredients[idx] ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                                                {checkedIngredients[idx] && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`text-gray-700 dark:text-gray-300 transition-all ${checkedIngredients[idx] ? 'line-through opacity-50' : ''}`}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                {/* AI Translation Note */}
                                {enhancedRecipe?.translated && (
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-600 dark:text-blue-300">
                                        <p className="flex items-center gap-2 font-bold mb-1"><Sparkles size={14} /> Translated by AI</p>
                                        <p>Ingredients have been automatically translated to {language === 'fa' ? 'Persian' : 'English'}.</p>
                                    </div>
                                )}
                            </div>
                            {/* Shop Ingredients Button */}
                            <ShopIngredients ingredients={ingredients} />
                        </div>


                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Instructions */}
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                                    <ChefHat className="text-primary" size={24} />
                                    Instructions
                                </h2>
                                <div className="space-y-6">
                                    {instructions.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
                                                {idx + 1}
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section Restored */}
                            <div className="pt-10 border-t border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                                {/* Placeholder for reviews list if we had one, for now just share card */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
                                    <p className="text-gray-500 mb-4">Have you cooked this? Share your result!</p>
                                    <button className="text-primary font-bold hover:underline">Write a Review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Card and Related */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold mb-8">Share Recipe</h2>
                    <div className="flex justify-center">
                        <ShareCard ref={shareCardRef} recipe={recipe} />
                    </div>
                </div>

                {/* Related Recipes Restored */}
                {relatedRecipes.length > 0 && (
                    <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-800">
                        <h2 className="text-3xl font-bold mb-8 text-center">You Might Also Like</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedRecipes.map(r => (
                                <FeedCard key={r.name} recipe={r} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {
                showCookingMode && (
                    <CookingMode
                        recipe={recipe}
                        onClose={() => setShowCookingMode(false)}
                    />
                )
            }
        </div >
    );
};

export default RecipeDetail;
