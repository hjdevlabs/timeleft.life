import { formatDuration } from '@shared/utils';
import './TaskTimer.css';

export function TaskTimer({ task, elapsedMs, onStop }) {
    if (!task) return null;

    return (
        <div className="task-timer">
            <div className="task-timer-display">
                {formatDuration(elapsedMs)}
            </div>
            <p className="task-timer-label">{task.title}</p>
            <button className="task-timer-stop" onClick={() => onStop(task.id)}>
                Stop Timer
            </button>
        </div>
    );
}
