import { useRef } from 'react';
import { useAuth } from '@shared/context';
import { TaskList } from './TaskList';
import { DailyLog } from './DailyLog';
import './Dashboard.css';

export function Dashboard() {
    const { user } = useAuth();
    const dailyLogRef = useRef(null);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

    const handleTaskChange = () => {
        dailyLogRef.current?.refetch();
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1 className="dashboard-greeting">
                    Hello, {displayName}
                </h1>
                <p className="dashboard-subtitle">What will you accomplish today?</p>
            </header>

            <TaskList onTaskChange={handleTaskChange} />
            <DailyLog ref={dailyLogRef} />
        </div>
    );
}
