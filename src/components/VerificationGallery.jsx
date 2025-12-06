
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the refined JSON directly
// Note: In Vite, we can import JSON.
import refinedData from '../ashpazi_refined.json';

const VerificationGallery = () => {
    const navigate = useNavigate();
    // refinedData is an array of recipes

    return (
        <div className="min-h-screen bg-gray-50 p-8" style={{ direction: 'rtl' }}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Batch Processing Verification</h1>
                <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 rounded">Back Home</button>
            </div>

            <div className="mb-4">
                <p className="text-lg">Total Processed: <span className="font-bold">{refinedData.length}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {refinedData.map((recipe, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className="relative h-64 w-full bg-gray-100">
                            <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                            />
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                {recipe.categoryId}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-bold mb-2">{recipe.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{recipe.englishName}</p>

                            <div className="mb-2">
                                <span className={`px-2 py-1 rounded text-xs ${recipe.isReal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {recipe.isReal ? 'Real' : 'Fake?'}
                                </span>
                            </div>

                            <details className="mb-2">
                                <summary className="cursor-pointer text-blue-600 text-sm">Visual Desc</summary>
                                <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                    {recipe.visualDescription || 'N/A'}
                                </p>
                            </details>
                            <details>
                                <summary className="cursor-pointer text-blue-600 text-sm">SEO</summary>
                                <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                    {recipe.seo ? JSON.stringify(recipe.seo, null, 2) : 'Pending...'}
                                </p>
                            </details>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VerificationGallery;
