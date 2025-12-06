import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import RecipeList from '../components/RecipeList';
import { Helmet } from 'react-helmet-async';
import { publishingAgent } from '../services/PublishingAgent';

const CategoryPage = () => {
    const { id } = useParams();
    const { recipes: categories, allRecipes } = useRecipes();
    const { t, language } = useLanguage();

    const recipes = allRecipes.filter(r => r.categoryId === parseInt(id));
    const category = categories.find(c => c.id === parseInt(id));

    // SEO
    const metadata = useMemo(() => {
        return publishingAgent.generateCategoryMetadata(category, language);
    }, [category, language]);

    if (!category) return <div>{t('categoryNotFound')}</div>;

    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="keywords" content={metadata.keywords} />
                <meta property="og:title" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:image" content={metadata.image} />
                <meta property="og:url" content={metadata.url} />
                <meta property="og:type" content={metadata.type} />
            </Helmet>
            <RecipeList recipes={recipes} categoryTitle={category.title} />
        </>
    );
};

export default CategoryPage;
