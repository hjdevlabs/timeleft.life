import { useState, useEffect, useRef } from 'react';

function pad(num, size) {
    return String(num).padStart(size, '0');
}

function getTimeValues() {
    const now = new Date();
    return {
        hours: pad(now.getHours(), 2),
        minutes: pad(now.getMinutes(), 2),
        seconds: pad(now.getSeconds(), 2),
        ms: pad(now.getMilliseconds(), 3)
    };
}

export function useLiveTimer() {
    const [time, setTime] = useState(getTimeValues);
    const animationRef = useRef(null);

    useEffect(() => {
        const updateTimer = () => {
            setTime(getTimeValues());
            animationRef.current = requestAnimationFrame(updateTimer);
        };

        animationRef.current = requestAnimationFrame(updateTimer);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (!animationRef.current) {
                    animationRef.current = requestAnimationFrame(updateTimer);
                }
            } else {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return time;
}
