import React from 'react';
import { useRecipes } from '../context/RecipeContext';
import { getAllCategories } from '../utils/dataParser';
import HeroSection from './HeroSection';
import FeedCard from './FeedCard';
import StoryCircle from './StoryCircle';
import CategoryGrid from './CategoryGrid';

import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { Filter } from 'lucide-react';

const HomeFeed = () => {
    const { recipes, smartRecipes } = useRecipes();
    const { preferences } = usePreferences();
    const { t } = useLanguage();

    if (!recipes || !smartRecipes) {
        return <div className="p-10 text-center">{t('loading')}</div>;
    }

    // Use smartRecipes directly
    // Split into Top Picks (High Score) and Regular Feed
    const showTopPicks = preferences.dietary?.length > 0 || preferences.time !== 'any' || preferences.goal?.length > 0;

    let topPicks = [];
    let regularFeed = smartRecipes;

    if (showTopPicks) {
        // Get top scoring recipes (score > 0)
        topPicks = smartRecipes.filter(r => r.score > 0).slice(0, 5);

        // Remove top picks from regular feed to avoid duplication
        const topPickNames = new Set(topPicks.map(r => r.name));
        regularFeed = smartRecipes.filter(r => !topPickNames.has(r.name));
    }

    const filteredRecipes = regularFeed;

    const categories = getAllCategories(recipes);

    console.log("HomeFeed: recipes count:", recipes?.length);
    console.log("HomeFeed: smartRecipes count:", smartRecipes?.length);
    console.log("HomeFeed: filteredRecipes count:", filteredRecipes?.length);

    return (
        <div className="animate-fade-in pb-20">

            {/* Hero Section (Search & Welcome) */}
            <HeroSection />

            {/* Stories Bar */}
            <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 w-max">
                    {/* "All" Story */}
                    <StoryCircle
                        category={{ id: 'all', title: t('storiesAll'), image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }}
                        isActive={true}
                    />
                    {categories.map(cat => (
                        <StoryCircle
                            key={cat.id}
                            category={{ ...cat, image: cat.items?.[0]?.image }}
                            isActive={false}
                        />
                    ))}
                </div>
            </div>

            {/* Top Picks Section */}
            {showTopPicks && topPicks.length > 0 && (
                <div className="mb-8 px-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Filter size={18} className="text-primary" />
                        </div>
                        <h2 className="font-black text-xl text-gray-800 dark:text-white">
                            {t('suggestedForYou')}
                        </h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
                        {topPicks.map((recipe, idx) => (
                            <div key={idx} className="min-w-[280px] w-[280px] snap-center">
                                <FeedCard
                                    recipe={recipe}
                                    index={idx}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}





            {/* Categories Grid */}
            <CategoryGrid categories={categories} />

            {/* Masonry Feed */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredRecipes.map((recipe, idx) => (
                    <FeedCard
                        key={idx}
                        recipe={recipe}
                        index={idx} // Pass index for video demo logic
                        style={{ animationDelay: `${idx * 50}ms` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomeFeed;
