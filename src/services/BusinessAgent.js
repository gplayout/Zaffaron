/**
 * The Business Agent
 * Responsible for magnetization, content gating, and value exchange.
 */

const STORAGE_KEY = 'zaffaron_premium_status';

export const BusinessAgent = {
    /**
     * Determines if a recipe is "Premium".
     * In a real app, this would check a database flag.
     * Here, we deterministically mock it based on the recipe ID or name hash
     * to ensure ~20% of content is premium.
     */
    isPremium: (recipe) => {
        if (!recipe || !recipe.name) return false;

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < recipe.name.length; i++) {
            hash = ((hash << 5) - hash) + recipe.name.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }

        // Mark ~20% as premium (mod 5 == 0)
        return Math.abs(hash) % 5 === 0;
    },

    /**
     * Checks if the current user has access to premium content.
     */
    hasAccess: () => {
        try {
            const status = localStorage.getItem(STORAGE_KEY);
            return status === 'unlocked';
        } catch (e) {
            return false;
        }
    },

    /**
     * Simulates the unlock process (payment or ad watch).
     * Returns a promise that resolves when access is granted.
     */
    unlockContent: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem(STORAGE_KEY, 'unlocked');
                resolve(true);
            }, 1000); // Simulate network delay
        });
    }
};
