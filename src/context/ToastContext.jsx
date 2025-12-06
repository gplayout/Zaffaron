import React, { createContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg backdrop-blur-md animate-slide-up
              ${toast.type === 'success' ? 'bg-green-500/90 text-white' :
                                toast.type === 'error' ? 'bg-red-500/90 text-white' :
                                    'bg-gray-800/90 text-white'}
            `}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
