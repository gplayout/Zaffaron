
import React, { forwardRef } from 'react';
import { ChefHat, QrCode } from 'lucide-react';
import { categoryMapping, defaultCategory } from '../utils/categoryMapping';

const ShareCard = forwardRef(({ recipe }, ref) => {
    if (!recipe) return null;

    const displayImage = recipe.image || categoryMapping[recipe.category]?.image || defaultCategory.image;

    // Fixed Aspect Ratio for Instagram Story (9:16)
    return (
        <div ref={ref} className="fixed top-[-9999px] left-[-9999px] w-[375px] h-[667px] bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white font-sans overflow-hidden flex flex-col items-center">

            {/* Header / Brand */}
            <div className="w-full p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                        <ChefHat size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-wide uppercase">Zaffaron</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                    AI Chef
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full aspect-square px-4 z-5">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative">
                    <img
                        src={displayImage}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Badge */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                        <h2 className="text-xl font-bold bg-primary/90 text-white py-2 px-4 rounded-xl shadow-lg inline-block">
                            {recipe.calories ? `${recipe.calories} kcal` : 'Delicious'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 w-full px-8 py-6 flex flex-col">
                <h1 className="text-3xl font-black text-center mb-2 leading-tight drop-shadow-md">
                    {recipe.name}
                </h1>

                <p className="text-center text-white/70 text-sm mb-6 line-clamp-2">
                    {recipe.intro || recipe.instructions?.[0] || "Discover authentic PERSIAN flavors."}
                </p>

                {/* Tags Grid */}
                <div className="flex flex-wrap gap-2 justify-center mb-auto">
                    {(recipe.ingredients || []).slice(0, 4).map((ing, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-xs border border-white/10 text-white/80">
                            {ing}
                        </span>
                    ))}
                    {recipe.ingredients?.length > 4 && (
                        <span className="px-3 py-1 bg-primary/20 rounded-lg text-xs border border-primary/30 text-primary-300">
                            +{recipe.ingredients.length - 4} More
                        </span>
                    )}
                </div>

                {/* Footer / CTA */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between w-full">
                    <div className="text-left">
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Cook this today</p>
                        <p className="text-sm font-bold">zaffaron.app</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg">
                        <QrCode size={40} className="text-black" />
                    </div>
                </div>
            </div>

            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none opacity-50"></div>
        </div>
    );
});

ShareCard.displayName = "ShareCard";
export default ShareCard;
