import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, Smartphone, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import StepTimer from './StepTimer';

const CookingMode = ({ recipe, onClose }) => {
    const { t, language } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Parse instructions into array if string
    const steps = Array.isArray(recipe.instructions)
        ? recipe.instructions
        : recipe.instructions.split('\n').filter(s => s.trim().length > 0);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps.length]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleRepeat = useCallback(() => {
        const text = steps[currentStep];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
        window.speechSynthesis.speak(utterance);
    }, [currentStep, steps, language]);

    // Voice Control
    const commands = {
        'next': handleNext,
        'back': handlePrev,
        'previous': handlePrev,
        'repeat': handleRepeat,
        'stop': () => window.speechSynthesis.cancel()
    };

    const { isListening, isSupported, startListening, stopListening } = useVoiceControl(commands);

    // Auto-Timer Detection
    const timeRegex = /(\d+)\s*(minute|min|minutes|mins)/i;
    const match = steps[currentStep].match(timeRegex);
    const detectedTime = match ? parseInt(match[1]) : null;

    // Shake Gesture
    useEffect(() => {
        let lastX, lastY, lastZ;
        let lastUpdate = 0;
        const threshold = 15;

        const handleMotion = (e) => {
            const current = e.timeStamp;
            if (current - lastUpdate > 100) {
                const diffTime = current - lastUpdate;
                lastUpdate = current;

                const x = e.accelerationIncludingGravity.x;
                const y = e.accelerationIncludingGravity.y;
                const z = e.accelerationIncludingGravity.z;

                const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

                if (speed > threshold) {
                    handleNext();
                }

                lastX = x;
                lastY = y;
                lastZ = z;
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [handleNext]);

    // Long Press Gesture
    const [pressTimer, setPressTimer] = useState(null);

    const handleTouchStart = () => {
        setPressTimer(setTimeout(() => {
            handleNext();
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);
        }, 800));
    };

    const handleTouchEnd = () => {
        if (pressTimer) clearTimeout(pressTimer);
    };

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        const resetControls = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', resetControls);
        window.addEventListener('touchstart', resetControls);
        resetControls();

        return () => {
            window.removeEventListener('mousemove', resetControls);
            window.removeEventListener('touchstart', resetControls);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-800 w-full">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-primary">Step {currentStep + 1}</span>
                    <span className="text-xs text-gray-400">of {steps.length}</span>
                </div>

                <div className="flex gap-2">
                    {isSupported && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-3 rounded-full backdrop-blur-md transition-colors ${isListening ? 'bg-red-500/80' : 'bg-black/40 hover:bg-black/60'}`}
                        >
                            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in">
                <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                        {steps[currentStep]}
                    </h2>

                    {/* Auto-Timer */}
                    {detectedTime && (
                        <div className="flex justify-center mt-8">
                            <StepTimer duration={detectedTime} />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <ChevronLeft size={32} />
                </button>

                <button
                    onClick={handleRepeat}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCcw size={24} />
                    <span className="text-xs">Repeat</span>
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="p-4 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary/30"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Gesture Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs flex items-center gap-1 pointer-events-none">
                <Smartphone size={12} />
                <span>Shake or Long Press for Next</span>
            </div>
        </div>
    );
};

export default CookingMode;
