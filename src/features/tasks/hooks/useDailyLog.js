import { useState, useEffect, useCallback } from 'react';
import { api } from '@shared/lib/api';
import { useAuth } from '@shared/context';

export function useDailyLog(date) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalDuration, setTotalDuration] = useState(0);

    const fetchDailyTasks = useCallback(async () => {
        if (!user || !date) {
            setTasks([]);
            setTotalDuration(0);
            setLoading(false);
            return;
        }

        setLoading(true);

        const dateStr = date.toISOString().split('T')[0];

        try {
            const data = await api.get('tasks', `user_id=eq.${user.id}&date=eq.${dateStr}&order=completed_at.asc.nullsfirst`);
            if (data) {
                setTasks(data);
                const total = data.reduce((sum, t) => sum + (t.total_duration_ms || 0), 0);
                setTotalDuration(total);
            } else {
                setTasks([]);
                setTotalDuration(0);
            }
        } catch {
            setTasks([]);
            setTotalDuration(0);
        }

        setLoading(false);
    }, [user, date]);

    useEffect(() => {
        fetchDailyTasks();
    }, [fetchDailyTasks]);

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const tasksWithTime = tasks.filter(t => t.total_duration_ms > 0);
    const taskCount = completedTasks.length;

    return {
        tasks,
        completedTasks,
        tasksWithTime,
        taskCount,
        totalDuration,
        loading,
        refetch: fetchDailyTasks
    };
}
