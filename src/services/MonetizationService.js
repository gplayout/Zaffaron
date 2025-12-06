
/**
 * MonetizationService
 * Handles generation of affiliate and shopping links for recipes.
 */

export const MonetizationService = {
    /**
     * Generates a shopping link for a list of ingredients.
     * Currently triggers a search on Amazon Fresh or Instacart.
     * 
     * @param {string[]} ingredients - List of ingredient strings
     * @param {string} provider - 'amazon' | 'instacart'
     * @returns {string} - URL to shop
     */
    getShoppingLink(ingredients, provider = 'amazon') {
        // Basic extraction of main ingredients (removing quantities for search)
        // E.g. "2 cups rice" -> "rice"
        const query = ingredients
            .slice(0, 8) // Limit to top 8 to avoid URL overflow
            .map(ing => this._cleanIngredient(ing))
            .join('+');

        if (provider === 'instacart') {
            return `https://www.instacart.com/store/s?k=${encodeURIComponent(query)}`;
        }

        // Default Amazon Fresh / Whole Foods
        return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=amazonfresh`;
    },

    /**
     * Helper to clean ingredient strings for better search results
     */
    _cleanIngredient(ingString) {
        return ingString
            .replace(/\d+|cup|tbsp|tsp|gram|kg|oz|pound|chopped|diced|sliced/gi, '')
            .replace(/[()]/g, '')
            .trim();
    }
};
