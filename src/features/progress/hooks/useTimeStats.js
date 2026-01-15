import { useState, useEffect } from 'react';
import { getDaysInYear, getDayOfYear, msUntilMidnight } from '@/shared/utils';

function calculateStats() {
    const now = new Date();
    const year = now.getFullYear();
    const totalDays = getDaysInYear(year);
    const daysPassed = getDayOfYear(now);
    const daysRemaining = totalDays - daysPassed;
    const percentage = ((daysPassed / totalDays) * 100).toFixed(1);

    return {
        year,
        totalDays,
        daysPassed,
        daysRemaining,
        percentage: parseFloat(percentage)
    };
}

export function useTimeStats() {
    const [stats, setStats] = useState(calculateStats);

    useEffect(() => {
        // Update at midnight
        const scheduleUpdate = () => {
            const ms = msUntilMidnight();
            const timeoutId = setTimeout(() => {
                setStats(calculateStats());
                scheduleUpdate();
            }, ms);
            return timeoutId;
        };

        const timeoutId = scheduleUpdate();

        // Update when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setStats(calculateStats());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return stats;
}
