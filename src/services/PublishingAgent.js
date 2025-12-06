
/**
 * Publishing Agent
 * Responsible for maximizing content visibility through SEO, Schema, and Metadata optimization.
 * This agent acts as the "Editor in Chief" for the application.
 */

class PublishingAgent {
    constructor() {
        this.appName = "Zaffaron";
        this.defaultImage = "/images/og-default.jpg"; // Placeholder
    }

    /**
     * Generates optimized metadata for a recipe.
     * @param {Object} recipe - The recipe object
     * @param {string} language - Current language ('en' | 'fa')
     * @returns {Object} Metadata object { title, description, keywords, image }
     */
    generateMetadata(recipe, language = 'fa') {
        if (!recipe) return this.getDefaultMetadata();

        const isEnglish = language === 'en';
        const title = isEnglish
            ? `${recipe.name} Recipe - Authentic Persian Cuisine | ${this.appName}`
            : `طرز تهیه ${recipe.name} - دستور پخت اصلی | ${this.appName}`;

        // Create a compelling description
        let description = recipe.intro || recipe.history || "";
        if (!description) {
            description = isEnglish
                ? `Learn how to cook authentic ${recipe.name}. A delicious Persian dish with ${recipe.ingredients?.length || 0} ingredients.`
                : `آموزش کامل طرز تهیه ${recipe.name}. یک غذای خوشمزه ایرانی.`;
        }

        // Truncate description for SEO (optimal length ~160 chars)
        if (description.length > 160) {
            description = description.substring(0, 157) + "...";
        }

        // Generate keywords
        const baseKeywords = isEnglish
            ? ["Persian Food", "Iranian Cuisine", "Generic Recipe", "Cooking"]
            : ["آشپزی ایرانی", "غذای سنتی", "دستور پخت", "خوشمزه"];

        const recipeKeywords = recipe.ingredients ? recipe.ingredients.slice(0, 5) : [];
        const keywords = [...baseKeywords, recipe.category, recipe.name, ...recipeKeywords].join(", ");

        return {
            title,
            description,
            keywords,
            image: recipe.image || this.defaultImage,
            url: window.location.href,
            type: 'article'
        };
    }

    /**
     * Generates optimized metadata for a category page.
     * @param {Object} category - Category object { id, title, image }
     * @param {string} language - 'en' | 'fa'
     */
    generateCategoryMetadata(category, language = 'fa') {
        if (!category) return this.getDefaultMetadata();

        const isEnglish = language === 'en';
        const title = isEnglish
            ? `${category.title} Recipes - Best Persian ${category.title} Dishes | ${this.appName}`
            : `طرز تهیه انواع ${category.title} - بهترین دستورهای پخت | ${this.appName}`;

        const description = isEnglish
            ? `Explore our collection of authentic ${category.title} recipes. Easy to follow instructions for the best Persian dishes.`
            : `مجموعه بهترین دستورهای پخت ${category.title}. آموزش گام به گام و ساده برای پخت انواع غذاهای ایرانی.`;

        return {
            title,
            description,
            keywords: `${category.title}, Persian Food, Recipes, ${isEnglish ? 'Cooking' : 'آشپزی'}`,
            image: category.image || this.defaultImage,
            url: window.location.href,
            type: 'website'
        };
    }

    /**
     * Generates Google Structured Data (JSON-LD) for a recipe.
     * @param {Object} recipe 
     * @returns {Object} JSON-LD Object
     */
    generateSchema(recipe) {
        if (!recipe) return null;

        return {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": recipe.name,
            "image": [recipe.image],
            "author": {
                "@type": "Person",
                "name": "Chef Zaffaron" // The AI Chef persona
            },
            "datePublished": new Date().toISOString().split('T')[0], // Treat as fresh content
            "description": recipe.intro || `How to make ${recipe.name}`,
            "prepTime": recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
            "cookTime": recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
            "totalTime": (recipe.prepTime && recipe.cookTime) ? `PT${parseInt(recipe.prepTime) + parseInt(recipe.cookTime)}M` : undefined,
            "keywords": recipe.category,
            "recipeYield": "4 servings", // Default
            "recipeCategory": recipe.category || "Main Course",
            "recipeCuisine": "Persian",
            "nutrition": recipe.nutrition ? {
                "@type": "NutritionInformation",
                "calories": `${recipe.nutrition.calories} calories`
            } : undefined,
            "recipeIngredient": recipe.ingredients || [],
            "recipeInstructions": recipe.instructions ? recipe.instructions.map((step, index) => ({
                "@type": "HowToStep",
                "name": `Step ${index + 1}`,
                "text": step
            })) : []
        };
    }

    getDefaultMetadata() {
        return {
            title: `${this.appName} - The Modern Persian Kitchen`,
            description: "Discover authentic Persian recipes, cooking tips, and culinary history.",
            keywords: "Persian Food, Cooking, Recipes, Chef",
            image: this.defaultImage,
            url: window.location.origin,
            type: 'website'
        };
    }
}

export const publishingAgent = new PublishingAgent();
