import React, { useState } from 'react';
import { Lock, Crown, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PremiumLock = ({ onUnlock }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        setLoading(true);
        // Simulate processing delay for effect
        await new Promise(r => setTimeout(r, 800));
        await onUnlock();
        setLoading(false);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl p-8 text-center border border-amber-200/30 bg-gradient-to-br from-amber-500/10 via-black/5 to-amber-500/5 backdrop-blur-md">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-500/40 animate-pulse-slow">
                    <Lock size={32} className="text-white" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                        {t('chefsSpecial') || "Chef's Special"}
                    </h3>
                    <p className="text-[var(--color-text-muted)] max-w-xs mx-auto text-sm">
                        {t('premiumContentDesc') || "This premium recipe is part of our extensive culinary collection. Unlock it now to view the secret ingredients."}
                    </p>
                </div>

                <button
                    onClick={handleUnlock}
                    disabled={loading}
                    className="mt-4 group relative px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                    <div className="relative flex items-center gap-2">
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Unlocking...</span>
                            </>
                        ) : (
                            <>
                                <Crown size={20} className="fill-current" />
                                <span>Unlock Recipe</span>
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>

                <p className="text-xs text-[var(--color-text-muted)] opacity-60">
                    Free for a limited time
                </p>
            </div>
        </div>
    );
};

export default PremiumLock;
