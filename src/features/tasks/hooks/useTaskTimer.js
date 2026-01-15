import { useState, useEffect, useRef } from 'react';
import { api } from '@shared/lib/api';
import { useAuth } from '@shared/context';

export function useTaskTimer(task, onDurationUpdate) {
    const { user } = useAuth();
    const [elapsedMs, setElapsedMs] = useState(0);
    const animationRef = useRef(null);
    const sessionIdRef = useRef(null);
    const sessionStartRef = useRef(null);
    const baseElapsedRef = useRef(0);
    const taskIdRef = useRef(null);

    const isRunning = task?.status === 'in_progress';

    // Start timer when task starts running
    useEffect(() => {
        if (!isRunning || !user || !task) {
            return;
        }

        // Prevent duplicate initialization for same task
        if (taskIdRef.current === task.id && animationRef.current) {
            return;
        }
        taskIdRef.current = task.id;

        baseElapsedRef.current = task.total_duration_ms || 0;
        setElapsedMs(baseElapsedRef.current);

        // Start timer immediately with local time, then sync with DB
        sessionStartRef.current = Date.now();

        // Start the animation loop
        const updateTimer = () => {
            if (sessionStartRef.current !== null) {
                const now = Date.now();
                const sessionElapsed = now - sessionStartRef.current;
                setElapsedMs(baseElapsedRef.current + sessionElapsed);
            }
            animationRef.current = requestAnimationFrame(updateTimer);
        };
        animationRef.current = requestAnimationFrame(updateTimer);

        // Sync session with database (async, doesn't block timer)
        (async () => {
            try {
                const sessions = await api.get('task_sessions',
                    `task_id=eq.${task.id}&ended_at=is.null&order=started_at.desc&limit=1`
                );

                if (sessions?.[0]) {
                    // Resume existing session - adjust start time
                    sessionIdRef.current = sessions[0].id;
                    sessionStartRef.current = new Date(sessions[0].started_at).getTime();
                } else {
                    // Create new session
                    const now = new Date();
                    const data = await api.insert('task_sessions', {
                        task_id: task.id,
                        user_id: user.id,
                        started_at: now.toISOString()
                    });
                    if (data?.[0]) {
                        sessionIdRef.current = data[0].id;
                    }
                }
            } catch {
                // Timer already running with local time, just continue
            }
        })();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [isRunning, user, task?.id]);

    // Stop timer and save when task stops running
    useEffect(() => {
        if (isRunning) {
            return;
        }

        // Only save if we have a session running
        const sessionStart = sessionStartRef.current;
        const sessionId = sessionIdRef.current;
        const savedTaskId = taskIdRef.current;

        if (sessionStart !== null && savedTaskId) {
            const endTime = new Date();
            const sessionDuration = endTime.getTime() - sessionStart;
            const newTotal = baseElapsedRef.current + sessionDuration;

            // Update task duration via callback
            if (onDurationUpdate) {
                onDurationUpdate(savedTaskId, newTotal);
            }

            // Close session in DB
            if (sessionId) {
                api.update('task_sessions', `id=eq.${sessionId}`, {
                    ended_at: endTime.toISOString(),
                    duration_ms: sessionDuration
                }).catch(() => {});
            }

            // Reset refs
            sessionIdRef.current = null;
            sessionStartRef.current = null;
            taskIdRef.current = null;
        }
    }, [isRunning, onDurationUpdate]);

    // Update display when task's stored duration changes
    useEffect(() => {
        if (task && !isRunning) {
            setElapsedMs(task.total_duration_ms || 0);
            baseElapsedRef.current = task.total_duration_ms || 0;
        }
    }, [task?.id, task?.total_duration_ms, isRunning]);

    // Reset when task is cleared
    useEffect(() => {
        if (!task) {
            setElapsedMs(0);
            sessionIdRef.current = null;
            sessionStartRef.current = null;
            baseElapsedRef.current = 0;
            taskIdRef.current = null;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    }, [task]);

    return {
        elapsedMs,
        isRunning
    };
}
