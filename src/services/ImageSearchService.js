
/**
 * Service to search for real recipe images using Google Custom Search API.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

/**
 * Searches for a high-quality image of the recipe.
 * @param {string} query - The name of the dish (e.g., "Ghormeh Sabzi")
 * @returns {Promise<string|null>} - URL of the image or null
 */
export const searchRecipeImage = async (query) => {
    if (!API_KEY || !CX) {
        console.warn("Google Search API Key or CX is missing. Real image search disabled.");
        return null;
    }

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', API_KEY);
        url.searchParams.append('cx', CX);
        url.searchParams.append('q', `${query} persian food professional photography`);
        url.searchParams.append('searchType', 'image');
        url.searchParams.append('imgSize', 'large'); // or 'xlarge'
        url.searchParams.append('num', '1');
        url.searchParams.append('safe', 'active');
        url.searchParams.append('fileType', 'jpg'); // Prefer jpg/png

        const response = await fetch(url.toString());

        if (!response.ok) {
            const err = await response.json();
            console.error("Google Image Search API Error:", err);
            return null;
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }

        return null; // No results found
    } catch (error) {
        console.error("Failed to search for image:", error);
        return null;
    }
};
