import { useState } from 'react';
import './TaskInput.css';

export function TaskInput({ onCreateTask, disabled }) {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || loading || disabled) return;

        setLoading(true);
        await onCreateTask(title);
        setTitle('');
        setLoading(false);
    };

    return (
        <form className="task-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you working on?"
                disabled={loading || disabled}
                maxLength={100}
            />
            <button type="submit" disabled={!title.trim() || loading || disabled}>
                {loading ? '...' : '+'}
            </button>
        </form>
    );
}
