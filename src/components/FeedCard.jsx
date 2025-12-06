import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Clock, ChefHat, Leaf, Crown } from 'lucide-react';
import { BusinessAgent } from '../services/BusinessAgent';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { categoryMapping, defaultCategory } from '../utils/categoryMapping';
import { getTranslation } from '../utils/aiTranslation';
import VideoPlayer from './VideoPlayer';
import { generateSlug } from '../utils/slugUtils';
import { formatTime } from '../utils/timeUtils';

const FeedCard = ({ recipe, style, index }) => {
    const { toggleLike, userLikes } = useRecipes();
    const { t, language } = useLanguage();
    const isLiked = userLikes.includes(recipe.name);
    const isPremium = BusinessAgent.isPremium(recipe);

    // Get category data for image fallback
    const safeCategory = recipe.category ? recipe.category.trim() : '';
    const categoryData = categoryMapping[safeCategory] || defaultCategory;

    // State to handle image load failure
    const [imgSrc, setImgSrc] = React.useState(recipe.image || categoryData.image || defaultCategory.image);

    React.useEffect(() => {
        setImgSrc(recipe.image || categoryData.image || defaultCategory.image);
    }, [recipe, categoryData]);

    const handleImageError = () => {
        const categoryImg = categoryData.image;
        const defaultImg = defaultCategory.image;

        if (imgSrc === recipe.image && categoryImg && categoryImg !== recipe.image) {
            // 1. Fallback to Category Image
            setImgSrc(categoryImg);
        } else if (imgSrc !== defaultImg) {
            // 2. Fallback to Default Image
            setImgSrc(defaultImg);
        }
    };

    // Mock Video Data for Demo (Every 5th card gets a video)
    const hasVideo = index % 5 === 0;
    const videoUrl = hasVideo ? "https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-in-a-glass-with-strawberries-42840-large.mp4" : null;

    // Localized Content Logic
    let displayName = recipe.name;
    let descriptionPreview = '';

    if (language === 'en') {
        const translation = getTranslation(recipe);
        if (translation) {
            displayName = translation.name;
            descriptionPreview = translation.description;
        } else {
            // Generic fallback for English users if no specific translation exists
            descriptionPreview = "Discover the authentic taste of Persian cuisine with this delicious recipe. Click to view ingredients and instructions.";
        }
    } else {
        // Farsi: Use original recipe text
        descriptionPreview = recipe.recipe ? recipe.recipe.substring(0, 60 + Math.floor(Math.random() * 50)) + '...' : '';
    }

    const slug = recipe.slug || generateSlug(recipe.name);

    const handleShare = (e) => {
        e.preventDefault();
        if (navigator.share) {
            navigator.share({
                title: recipe.name,
                text: `Check out this recipe for ${recipe.name} on Zaffaron!`,
                url: window.location.origin + `/recipe/${slug}`,
            });
        }
    };

    return (
        <div className="break-inside-avoid mb-8 group relative border-2 border-red-500" style={style}>
            <div className="bg-surface rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 dark:border-white/5 relative z-0">
                {/* Media Container (Video or Image) */}
                <div className="relative w-full overflow-hidden">
                    {hasVideo ? (
                        <VideoPlayer src={videoUrl} poster={imgSrc} />
                    ) : (
                        <Link to={`/recipe/${slug}`} className="block relative h-48 overflow-hidden cursor-pointer">
                            <img
                                src={imgSrc}
                                alt={recipe.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                                loading="lazy"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-50 transition-opacity duration-500" />
                        </Link>
                    )}
                </div>

                {/* Floating Actions */}
                {!hasVideo && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleLike(recipe.name);
                            }}
                            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${isLiked
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                : 'bg-black/20 text-white hover:bg-black/40 border border-white/10'}`}
                        >
                            <Heart size={18} className={isLiked ? "fill-current" : ""} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md transition-colors border border-white/10 active:scale-90"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
                    {/* Premium Badge */}
                    {isPremium && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5 mb-1.5">
                            <Crown size={12} className="fill-current" />
                            {t('premium') || 'Premium'}
                        </span>
                    )}

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-sm">
                        {t(recipe.category)}
                    </span>

                    {/* Smart Badges */}
                    {recipe.matchReason && Array.isArray(recipe.matchReason) && recipe.matchReason.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                            {recipe.matchReason.slice(0, 2).map((reason, idx) => (
                                <span key={idx} className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-fade-in border border-white/10
                                    ${reason === 'vegetarian' ? 'bg-green-500/80' : ''}
                                    ${reason === 'quick' ? 'bg-blue-500/80' : ''}
                                    ${reason === 'healthy' ? 'bg-teal-500/80' : ''}
                                    ${reason === 'popular' ? 'bg-amber-500/80' : ''}
                                    ${reason === 'elaborate' ? 'bg-purple-500/80' : ''}
                                `}>
                                    {reason === 'vegetarian' && <Leaf size={10} />}
                                    {reason === 'quick' && <Clock size={10} />}
                                    {reason === 'healthy' && <Heart size={10} />}
                                    {reason === 'popular' && <Heart size={10} fill="currentColor" />}
                                    {reason === 'elaborate' && <ChefHat size={10} />}

                                    <span>
                                        {reason === 'vegetarian' && t('vegetarianLabel')}
                                        {reason === 'quick' && t('quickFood')}
                                        {reason === 'healthy' && t('goalHealthy')}
                                        {reason === 'popular' && t('popular')}
                                        {reason === 'elaborate' && t('elaborate')}
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <Link to={`/recipe/${slug}`} className="block flex-1">
                            <h3 className="font-bold text-lg text-text line-clamp-1 group-hover:text-primary transition-colors">
                                {displayName}
                            </h3>
                        </Link>
                        <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-lg">
                            <span className="text-xs font-bold text-secondary">{recipe.rating || '4.5'}</span>
                        </div>
                    </div>

                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4 h-10 font-medium leading-relaxed">
                        {descriptionPreview}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)] border-t border-gray-100 dark:border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                <Clock size={14} className="text-primary" />
                                {formatTime(recipe.cookTime || '30m', language)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                <ChefHat size={14} className="text-secondary" />
                                {t((recipe.difficulty || 'easy').toLowerCase())}
                            </span>
                        </div>

                        {recipe.nutrition && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Leaf size={12} />
                                {recipe.nutrition.calories}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;
