import { useTasks } from '../hooks/useTasks';
import { useTaskTimer } from '../hooks/useTaskTimer';
import { TaskInput } from './TaskInput';
import { TaskItem } from './TaskItem';
import { TaskTimer } from './TaskTimer';
import './TaskList.css';

export function TaskList({ onTaskChange }) {
    const {
        activeTask,
        pendingTasks,
        completedTasks,
        loading,
        error,
        createTask,
        startTask,
        stopTask,
        completeTask,
        deleteTask,
        updateTask
    } = useTasks();

    const handleDurationUpdate = async (taskId, newDuration) => {
        await updateTask(taskId, { total_duration_ms: newDuration });
        onTaskChange?.();
    };

    const { elapsedMs } = useTaskTimer(activeTask, handleDurationUpdate);

    // Wrap task actions to notify parent
    const handleCreate = async (title) => {
        const result = await createTask(title);
        if (result) onTaskChange?.();
        return result;
    };

    const handleStart = async (id) => {
        const result = await startTask(id);
        onTaskChange?.();
        return result;
    };

    const handleStop = async (id) => {
        const result = await stopTask(id);
        onTaskChange?.();
        return result;
    };

    const handleComplete = async (id) => {
        const result = await completeTask(id);
        onTaskChange?.();
        return result;
    };

    const handleDelete = async (id) => {
        const result = await deleteTask(id);
        onTaskChange?.();
        return result;
    };

    if (loading) {
        return (
            <section className="task-section">
                <p className="task-loading">Loading tasks...</p>
            </section>
        );
    }

    return (
        <section className="task-section">
            <h2 className="task-section-title">Today's Tasks</h2>

            <TaskInput onCreateTask={handleCreate} />

            {error && <p className="task-error">{error}</p>}

            {/* Active timer */}
            {activeTask && (
                <TaskTimer
                    task={activeTask}
                    elapsedMs={elapsedMs}
                    onStop={handleStop}
                />
            )}

            {/* Pending tasks */}
            {pendingTasks.length > 0 && (
                <div className="task-list">
                    {pendingTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onStart={handleStart}
                            onStop={handleStop}
                            onComplete={handleComplete}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
                <>
                    <h3 className="task-section-subtitle">Completed</h3>
                    <div className="task-list">
                        {completedTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onStart={handleStart}
                                onStop={handleStop}
                                onComplete={handleComplete}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Empty state */}
            {pendingTasks.length === 0 && completedTasks.length === 0 && !activeTask && (
                <p className="task-empty">No tasks yet. Add one above to get started.</p>
            )}
        </section>
    );
}
