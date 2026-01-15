import { formatDuration } from '@shared/utils';
import './TaskItem.css';

export function TaskItem({ task, elapsedMs, onStart, onStop, onComplete, onDelete }) {
    const isRunning = task.status === 'in_progress';
    const isCompleted = task.status === 'completed';
    const displayTime = isRunning ? elapsedMs : task.total_duration_ms;

    return (
        <div className={`task-item ${isRunning ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="task-item-content">
                <span className="task-item-title">{task.title}</span>
                <span className="task-item-duration">
                    {formatDuration(displayTime || 0)}
                </span>
            </div>

            <div className="task-item-actions">
                {!isCompleted && (
                    <>
                        {isRunning ? (
                            <button
                                className="task-btn task-btn-stop"
                                onClick={() => onStop(task.id)}
                            >
                                Stop
                            </button>
                        ) : (
                            <button
                                className="task-btn task-btn-play"
                                onClick={() => onStart(task.id)}
                            >
                                Start
                            </button>
                        )}
                        <button
                            className="task-btn task-btn-complete"
                            onClick={() => onComplete(task.id)}
                        >
                            Done
                        </button>
                    </>
                )}
                <button
                    className="task-btn task-btn-delete"
                    onClick={() => onDelete(task.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
