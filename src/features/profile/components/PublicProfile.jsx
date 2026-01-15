import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context';
import { api } from '@shared/lib/api';
import { formatDurationLong, formatDuration } from '@shared/utils';
import './PublicProfile.css';

// Generate last N days
function getLastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Generate all days for a given year
function getYearDays(year) {
    const days = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

// Get activity level (0-4) based on time logged
function getActivityLevel(ms) {
    if (!ms || ms === 0) return 0;
    const hours = ms / (1000 * 60 * 60);
    if (hours < 0.5) return 1;
    if (hours < 2) return 2;
    if (hours < 4) return 3;
    return 4;
}

export function PublicProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalTasks: 0, totalTime: 0, activeDays: 0 });
    const [yearStats, setYearStats] = useState({ totalTasks: 0, totalTime: 0, activeDays: 0 });
    const [dailyLogs, setDailyLogs] = useState({});
    const [yearLogs, setYearLogs] = useState({});
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [viewMode, setViewMode] = useState('30days'); // '30days' or 'year'

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        async function fetchProfile() {
            if (!username) {
                setLoading(false);
                setNotFound(true);
                return;
            }

            try {
                // Fetch profile
                const profiles = await api.get('profiles', `username=eq.${username.toLowerCase()}&select=*`);
                const profileData = profiles?.[0];

                if (!profileData) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                setProfile(profileData);

                // Fetch last 30 days of tasks with time logged
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

                const tasks = await api.get('tasks',
                    `user_id=eq.${profileData.id}&date=gte.${dateStr}&total_duration_ms=gt.0&order=date.desc`
                );

                if (tasks) {
                    // Group tasks by date
                    const logs = {};
                    let totalTime = 0;
                    let totalTasks = 0;

                    tasks.forEach(task => {
                        const date = task.date;
                        if (!logs[date]) {
                            logs[date] = { tasks: [], totalTime: 0 };
                        }
                        logs[date].tasks.push(task);
                        logs[date].totalTime += task.total_duration_ms || 0;
                        totalTime += task.total_duration_ms || 0;
                        if (task.status === 'completed') totalTasks++;
                    });

                    setDailyLogs(logs);
                    setStats({
                        totalTasks,
                        totalTime,
                        activeDays: Object.keys(logs).length
                    });
                }

                // Fetch full year data
                const yearStart = `${currentYear}-01-01`;
                const yearEnd = `${currentYear}-12-31`;

                const yearTasks = await api.get('tasks',
                    `user_id=eq.${profileData.id}&date=gte.${yearStart}&date=lte.${yearEnd}&total_duration_ms=gt.0&order=date.desc`
                );

                if (yearTasks) {
                    const logs = {};
                    let totalTime = 0;
                    let totalTasks = 0;

                    yearTasks.forEach(task => {
                        const date = task.date;
                        if (!logs[date]) {
                            logs[date] = { tasks: [], totalTime: 0 };
                        }
                        logs[date].tasks.push(task);
                        logs[date].totalTime += task.total_duration_ms || 0;
                        totalTime += task.total_duration_ms || 0;
                        if (task.status === 'completed') totalTasks++;
                    });

                    setYearLogs(logs);
                    setYearStats({
                        totalTasks,
                        totalTime,
                        activeDays: Object.keys(logs).length
                    });
                }

                setLoading(false);
            } catch {
                setNotFound(true);
                setLoading(false);
            }
        }

        fetchProfile();
    }, [username, currentYear]);

    const last30Days = getLastNDays(30);
    const yearDays = getYearDays(currentYear);

    if (loading) {
        return (
            <div className="profile-loading">
                <p>Loading...</p>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="profile-not-found">
                <h1>404</h1>
                <p>User not found</p>
                <a href="/">← Back to home</a>
            </div>
        );
    }

    const displayName = profile.display_name || profile.username;
    const initial = displayName.charAt(0).toUpperCase();
    const isOwnProfile = user?.id === profile.id;

    return (
        <div className="public-profile">
            <header className="profile-header">
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="profile-avatar" />
                ) : (
                    <div className="profile-avatar-placeholder">{initial}</div>
                )}
                <h1 className="profile-name">{displayName}</h1>
                <p className="profile-username">@{profile.username}</p>
                {isOwnProfile && (
                    <button
                        className="profile-start-btn"
                        onClick={() => navigate('/start')}
                    >
                        Start Tracking
                    </button>
                )}
            </header>

            {/* View mode toggle */}
            <div className="profile-view-toggle">
                <button
                    className={`view-toggle-btn ${viewMode === '30days' ? 'active' : ''}`}
                    onClick={() => setViewMode('30days')}
                >
                    Last 30 Days
                </button>
                <button
                    className={`view-toggle-btn ${viewMode === 'year' ? 'active' : ''}`}
                    onClick={() => setViewMode('year')}
                >
                    Year in Review
                </button>
            </div>

            {/* Stats based on view mode */}
            <div className="profile-stats">
                <div className="profile-stat">
                    <span className="profile-stat-value">
                        {viewMode === 'year' ? yearStats.totalTasks : stats.totalTasks}
                    </span>
                    <span className="profile-stat-label">tasks done</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat">
                    <span className="profile-stat-value">
                        {formatDurationLong(viewMode === 'year' ? yearStats.totalTime : stats.totalTime)}
                    </span>
                    <span className="profile-stat-label">total time</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat">
                    <span className="profile-stat-value">
                        {viewMode === 'year' ? yearStats.activeDays : stats.activeDays}
                    </span>
                    <span className="profile-stat-label">active days</span>
                </div>
            </div>

            {/* 30 Days Activity Grid */}
            {viewMode === '30days' && (
                <section className="profile-activity">
                    <h2 className="profile-section-title">Activity (Last 30 Days)</h2>
                    <div className="activity-grid">
                        {last30Days.map(date => {
                            const log = dailyLogs[date];
                            const level = getActivityLevel(log?.totalTime);
                            const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                            const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                            return (
                                <div
                                    key={date}
                                    className={`activity-cell level-${level}`}
                                    title={log ? `${dateLabel}: ${formatDuration(log.totalTime)} (${log.tasks.length} tasks)` : `${dateLabel}: No activity`}
                                >
                                    <span className="activity-day">{dayLabel}</span>
                                    <span className="activity-date">{new Date(date + 'T00:00:00').getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Year in Review - Simple grid */}
            {viewMode === 'year' && (
                <section className="profile-activity year-view">
                    <h2 className="profile-section-title">{currentYear} Year in Review</h2>
                    <div className="year-grid">
                        {yearDays.map(date => {
                            const log = yearLogs[date];
                            const level = getActivityLevel(log?.totalTime);
                            const dateObj = new Date(date + 'T00:00:00');
                            const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                            return (
                                <div
                                    key={date}
                                    className={`year-cell${level > 0 ? ` level-${level}` : ''}`}
                                    title={log ? `${dateLabel}: ${formatDuration(log.totalTime)}` : dateLabel}
                                />
                            );
                        })}
                    </div>
                    <div className="year-legend">
                        <span className="year-legend-label">Less</span>
                        <div className="year-cell" />
                        <div className="year-cell level-1" />
                        <div className="year-cell level-2" />
                        <div className="year-cell level-3" />
                        <div className="year-cell level-4" />
                        <span className="year-legend-label">More</span>
                    </div>
                </section>
            )}

            {/* Recent Activity - only show in 30 days view */}
            {viewMode === '30days' && Object.keys(dailyLogs).length > 0 && (
                <section className="profile-recent">
                    <h2 className="profile-section-title">Recent Activity</h2>
                    <div className="profile-log-list">
                        {last30Days.slice().reverse().filter(date => dailyLogs[date]).slice(0, 7).map(date => {
                            const log = dailyLogs[date];
                            const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <div key={date} className="profile-log-day">
                                    <div className="profile-log-header">
                                        <span className="profile-log-date">{dateLabel}</span>
                                        <span className="profile-log-time">{formatDuration(log.totalTime)}</span>
                                    </div>
                                    <div className="profile-log-tasks">
                                        {log.tasks.map(task => (
                                            <div key={task.id} className={`profile-log-task ${task.status === 'completed' ? 'completed' : ''}`}>
                                                <span className="profile-log-task-title">{task.title}</span>
                                                <span className="profile-log-task-time">{formatDuration(task.total_duration_ms || 0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <footer className="profile-footer">
                <a href="/">timeleft.life</a>
            </footer>
        </div>
    );
}
