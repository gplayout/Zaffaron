import React, { useState } from 'react';
import { X, Check, Leaf, Clock, Target, Flame, DollarSign, BookOpen, WheatOff } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';

const OptionCard = ({ icon: Icon, label, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 w-full aspect-square relative group ${selected
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 scale-105 shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/20'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-500 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:scale-105'
            }`}
    >
        <Icon size={36} className={`mb-3 transition-transform duration-300 ${selected ? 'animate-bounce-short scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-sm font-bold text-center leading-tight">{label}</span>
        {selected && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-scale-in shadow-sm">
                <Check size={12} className="text-white" />
            </div>
        )}
    </button>
);

const PreferencesModal = ({ isOpen, onClose }) => {
    const { preferences, updatePreferences, completeOnboarding } = usePreferences();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [localPrefs, setLocalPrefs] = useState(preferences);

    if (!isOpen) return null;

    const toggleDiet = (diet) => {
        const current = localPrefs.dietary || [];
        const updated = current.includes(diet)
            ? current.filter(d => d !== diet)
            : [...current, diet];
        setLocalPrefs({ ...localPrefs, dietary: updated });
    };

    const toggleGoal = (goal) => {
        const current = localPrefs.goal || [];
        const updated = current.includes(goal)
            ? current.filter(g => g !== goal)
            : [...current, goal];
        setLocalPrefs({ ...localPrefs, goal: updated });
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            updatePreferences({
                ...localPrefs,
                onboardingCompleted: true
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up border border-white/20">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                        {step === 1 && t('prefDietTitle')}
                        {step === 2 && t('prefTimeTitle')}
                        {step === 3 && t('prefGoalTitle')}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">{t('prefStep')} {step} {t('of')} 3</p>
                </div>

                {/* Content */}
                <div className="px-8 pb-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            <OptionCard
                                icon={Leaf}
                                label={t('vegetarian')}
                                selected={localPrefs.dietary?.includes('vegetarian')}
                                onClick={() => toggleDiet('vegetarian')}
                            />
                            <OptionCard
                                icon={WheatOff}
                                label={t('glutenFree')}
                                selected={localPrefs.dietary?.includes('glutenFree')}
                                onClick={() => toggleDiet('glutenFree')}
                            />
                            <OptionCard
                                icon={Flame}
                                label={t('keto')}
                                selected={localPrefs.dietary?.includes('keto')}
                                onClick={() => toggleDiet('keto')}
                            />
                            <OptionCard
                                icon={Check}
                                label={t('dietEverything')}
                                selected={localPrefs.dietary?.length === 0}
                                onClick={() => setLocalPrefs({ ...localPrefs, dietary: [] })}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {['quick', 'medium', 'long'].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setLocalPrefs({ ...localPrefs, time })}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all group ${localPrefs.time === time
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-md shadow-orange-500/10 scale-[1.02] ring-1 ring-orange-500/30'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-orange-300 text-gray-700 dark:text-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${localPrefs.time === time ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                                            <Clock size={20} />
                                        </div>
                                        <span className="font-bold text-lg">
                                            {time === 'quick' && t('timeShort')}
                                            {time === 'medium' && t('timeMedium')}
                                            {time === 'long' && t('timeLong')}
                                        </span>
                                    </div>
                                    {localPrefs.time === time && <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-scale-in shadow-sm"><Check size={14} className="text-white" /></div>}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-2 gap-4">
                            <OptionCard
                                icon={Target}
                                label={t('goalHealthy')}
                                selected={localPrefs.goal?.includes('healthy')}
                                onClick={() => toggleGoal('healthy')}
                            />
                            <OptionCard
                                icon={DollarSign}
                                label={t('goalBudget')}
                                selected={localPrefs.goal?.includes('budget')}
                                onClick={() => toggleGoal('budget')}
                            />
                            <OptionCard
                                icon={BookOpen}
                                label={t('goalLearn')}
                                selected={localPrefs.goal?.includes('learn')}
                                onClick={() => toggleGoal('learn')}
                            />
                            <OptionCard
                                icon={Flame}
                                label={t('goalParty')}
                                selected={localPrefs.goal?.includes('party')}
                                onClick={() => toggleGoal('party')}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 flex justify-between items-center mt-2">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : null}
                        className={`text-gray-400 font-bold px-4 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        {t('back')}
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95 active:bg-orange-700 transition-all duration-200"
                    >
                        {step === 3 ? t('finish') : t('continue')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferencesModal;
