import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [wakeLock, setWakeLock] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('wakeLock' in navigator) {
            setIsSupported(true);
        }
    }, []);

    const requestWakeLock = useCallback(async () => {
        if (!isSupported) return;

        try {
            const lock = await navigator.wakeLock.request('screen');
            setWakeLock(lock);
            setIsLocked(true);

            lock.addEventListener('release', () => {
                setIsLocked(false);
                setWakeLock(null);
            });
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }, [isSupported]);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock) {
            try {
                await wakeLock.release();
                setWakeLock(null);
                setIsLocked(false);
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, [wakeLock]);

    const toggleWakeLock = useCallback(() => {
        if (isLocked) {
            releaseWakeLock();
        } else {
            requestWakeLock();
        }
    }, [isLocked, requestWakeLock, releaseWakeLock]);

    // Re-request lock if visibility changes (e.g. user switches tabs and comes back)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [wakeLock, requestWakeLock]);

    return { isSupported, isLocked, requestWakeLock, releaseWakeLock, toggleWakeLock };
};
