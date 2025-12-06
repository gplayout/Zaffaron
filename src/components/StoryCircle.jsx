import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

import { categoryMapping, defaultCategory } from '../utils/categoryMapping';

const StoryCircle = ({ category, isActive }) => {
    const { t } = useLanguage();
    const categoryData = categoryMapping[category.title] || defaultCategory;
    const [imgSrc, setImgSrc] = React.useState(category.image || categoryData.image);

    const handleImageError = () => {
        setImgSrc(defaultCategory.image);
    };

    return (
        <Link
            to={`/category/${category.id}`}
            className="flex flex-col items-center gap-2 min-w-[72px] group"
        >
            <div className={`w-[72px] h-[72px] rounded-full p-[3px] ${isActive ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600' : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-rose-500 group-hover:to-purple-600'} transition-all duration-300`}>
                <div className="w-full h-full rounded-full border-[3px] border-white dark:border-slate-900 overflow-hidden relative">
                    <img
                        src={imgSrc}
                        alt={category.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 dark:font-bold dark:drop-shadow-md truncate w-full text-center z-10 relative">
                {t(category.title)}
            </span>
        </Link>
    );
};

export default StoryCircle;
