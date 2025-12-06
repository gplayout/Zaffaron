import React, { useState } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { X, Activity, ChevronUp, ChevronDown } from 'lucide-react';

const DebugPanel = () => {
    const { smartRecipes } = useRecipes();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all"
                title="Open Debug Panel"
            >
                <Activity size={20} />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-64 h-12' : 'w-80 h-96'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">Smart Sort Debug</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="p-0 h-[calc(100%-48px)] overflow-y-auto custom-scrollbar">
                    <div className="p-2 space-y-2">
                        {smartRecipes.slice(0, 10).map((recipe, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-700/50 text-xs">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium truncate w-2/3" title={recipe.name}>{recipe.name}</span>
                                    <span className={`font-bold px-1.5 py-0.5 rounded ${recipe.score > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {recipe.score}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {recipe.matchReason && recipe.matchReason.map((reason, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] border border-blue-100 dark:border-blue-800/30">
                                            {reason}
                                        </span>
                                    ))}
                                    {(!recipe.matchReason || recipe.matchReason.length === 0) && (
                                        <span className="text-gray-400 italic">No specific match</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
