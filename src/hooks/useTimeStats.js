import { useState, useEffect } from 'react';

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

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

function msUntilMidnight() {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
    );
    return midnight - now;
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
