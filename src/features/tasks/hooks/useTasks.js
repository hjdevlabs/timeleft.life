import { useState, useEffect, useCallback } from 'react';
import { api } from '@shared/lib/api';
import { useAuth } from '@shared/context';

export function useTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch today's tasks
    const fetchTasks = useCallback(async () => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0];

        try {
            const data = await api.get('tasks', `user_id=eq.${user.id}&date=eq.${today}&order=created_at.desc`);
            setTasks(data || []);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = async (title) => {
        if (!user || !title.trim()) return null;

        try {
            const data = await api.insert('tasks', {
                user_id: user.id,
                title: title.trim(),
                status: 'pending',
                total_duration_ms: 0,
                date: new Date().toISOString().split('T')[0]
            });
            const newTask = data[0];
            setTasks(prev => [newTask, ...prev]);
            return newTask;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const updateTask = async (id, updates) => {
        try {
            const data = await api.update('tasks', `id=eq.${id}`, updates);
            const updatedTask = data[0];
            setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
            return updatedTask;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete('tasks', `id=eq.${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const startTask = async (id) => {
        // Stop any currently running task first
        const runningTask = tasks.find(t => t.status === 'in_progress');
        if (runningTask && runningTask.id !== id) {
            await updateTask(runningTask.id, { status: 'pending' });
        }

        return updateTask(id, { status: 'in_progress' });
    };

    const stopTask = async (id) => {
        return updateTask(id, { status: 'pending' });
    };

    const completeTask = async (id) => {
        return updateTask(id, {
            status: 'completed',
            completed_at: new Date().toISOString()
        });
    };

    const activeTask = tasks.find(t => t.status === 'in_progress');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return {
        tasks,
        activeTask,
        pendingTasks,
        completedTasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        startTask,
        stopTask,
        completeTask,
        refetch: fetchTasks
    };
}
