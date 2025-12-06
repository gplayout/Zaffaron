import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoryMapping, defaultCategory } from '../utils/categoryMapping';
import { useLanguage } from '../context/LanguageContext';
const CategoryGrid = ({ categories }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-8 animate-fade-in pb-12">


            <div id="categories" className="text-center space-y-3 mb-10 pt-4">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block tracking-tight">
                    {t('categoriesTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                    {t('whatToCook')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                {categories.map((category, idx) => {
                    const mapped = categoryMapping[category.title] || defaultCategory;
                    const Icon = mapped.icon;

                    return (
                        <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="group relative overflow-hidden h-40 rounded-[2rem] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-scale-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0">
                                <img
                                    src={mapped.image}
                                    alt={category.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent dark:from-black/95 dark:via-black/80 transition-opacity duration-500 group-hover:opacity-90"></div>

                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
                            </div>

                            <div className="relative h-full flex items-center justify-between p-8 z-10">
                                <div className="flex items-center gap-6">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mapped.gradient} flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 border border-white/10`}>
                                        <Icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-2xl text-white group-hover:text-primary transition-colors text-shadow-sm tracking-tight">
                                            {t(category.title)}
                                        </h3>
                                        <p className="text-sm text-gray-300 flex items-center gap-2 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
                                            {category.count} {t('recipesCount')}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border border-white/10 shadow-lg">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryGrid;
