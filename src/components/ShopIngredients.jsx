
import React from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { MonetizationService } from '../services/MonetizationService';

const ShopIngredients = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) return null;

    const handleShopClick = () => {
        const link = MonetizationService.getShoppingLink(ingredients, 'amazon');
        window.open(link, '_blank');
    };

    return (
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-amber-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-amber-600" />
                        Shop This Recipe
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Get all ingredients delivered to your door via Amazon Fresh.
                    </p>
                </div>

                <button
                    onClick={handleShopClick}
                    className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Buy Ingredients</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ShopIngredients;
