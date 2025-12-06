import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 flex items-center gap-4 max-w-sm ml-auto relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />

                <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                    <Download size={24} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Install Zaffaron</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Get the best cooking experience</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 z-10">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
