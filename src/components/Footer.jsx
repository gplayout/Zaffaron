import React from 'react';
import { useTranslation } from 'react-i18next';
import { Instagram, Youtube, Send, Video } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    const socialLinks = [
        { name: 'Instagram', icon: <Instagram size={20} />, url: 'https://instagram.com/zaffaron_app', color: 'hover:text-pink-500' },
        { name: 'TikTok', icon: <Video size={20} />, url: 'https://tiktok.com/@zaffaron_app', color: 'hover:text-black dark:hover:text-white' },
        { name: 'YouTube', icon: <Youtube size={20} />, url: 'https://youtube.com/@zaffaron_app', color: 'hover:text-red-600' },
        { name: 'Telegram', icon: <Send size={20} />, url: 'https://t.me/zaffaron_app', color: 'hover:text-blue-500' },
    ];

    return (
        <footer className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-200 dark:border-white/5 mt-12 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            {t('appName')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                            Bringing the authentic taste of Persian cuisine to your kitchen with the power of AI.
                        </p>
                    </div>

                    {/* Social links removed as requested */}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5 text-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Zaffaron. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
