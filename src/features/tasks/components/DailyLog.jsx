import { useState, forwardRef, useImperativeHandle } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { DaySelector } from './DaySelector';
import { formatDuration, formatDurationLong } from '@shared/utils';
import './DailyLog.css';

export const DailyLog = forwardRef(function DailyLog(props, ref) {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });

    const { tasksWithTime, taskCount, totalDuration, loading, refetch } = useDailyLog(selectedDate);

    // Expose refetch to parent via ref
    useImperativeHandle(ref, () => ({
        refetch
    }), [refetch]);

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <section className="daily-log">
            <h2 className="daily-log-title">Daily Log</h2>

            <DaySelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

            {loading ? (
                <p className="daily-log-loading">Loading...</p>
            ) : (
                <>
                    {/* Summary */}
                    <div className="daily-log-summary">
                        <div className="daily-log-stat">
                            <span className="daily-log-stat-value">{taskCount}</span>
                            <span className="daily-log-stat-label">
                                {taskCount === 1 ? 'task' : 'tasks'} completed
                            </span>
                        </div>
                        <div className="daily-log-stat-divider" />
                        <div className="daily-log-stat">
                            <span className="daily-log-stat-value">
                                {formatDurationLong(totalDuration)}
                            </span>
                            <span className="daily-log-stat-label">total time</span>
                        </div>
                    </div>

                    {/* Task list */}
                    {tasksWithTime.length > 0 ? (
                        <div className="daily-log-list">
                            {tasksWithTime.map(task => (
                                <div key={task.id} className={`daily-log-item ${task.status === 'completed' ? 'completed' : ''}`}>
                                    <span className="daily-log-item-title">
                                        {task.title}
                                        {task.status !== 'completed' && (
                                            <span className="daily-log-item-status">in progress</span>
                                        )}
                                    </span>
                                    <span className="daily-log-item-duration">
                                        {formatDuration(task.total_duration_ms || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="daily-log-empty">
                            {isToday
                                ? 'No activity yet today.'
                                : 'No activity on this day.'}
                        </p>
                    )}
                </>
            )}
        </section>
    );
});
