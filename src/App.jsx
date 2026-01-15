import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTimeStats, ProgressBar, Stats, DaysGrid } from '@features/progress';
import { LiveTimer } from '@features/timer';
import { AuthBanner, AuthModal, UserMenu, UsernameSetup } from '@features/auth';
import { Dashboard } from '@features/tasks';
import { PublicProfile } from '@features/profile';
import { useAuth } from '@shared/context';
import './App.css';

// Home page (landing page)
function HomePage() {
    const { user, profile, loading } = useAuth();
    const { year, totalDays, daysPassed, daysRemaining, percentage } = useTimeStats();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (loading) {
        return (
            <main>
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
            </main>
        );
    }

    return (
        <>
            {user && <UserMenu />}
            <main>
                <header>
                    <h1 className="year">{year}</h1>
                </header>

                <ProgressBar percentage={percentage} />

                <Stats daysPassed={daysPassed} daysRemaining={daysRemaining} />

                <LiveTimer />

                {!user && <AuthBanner onSignUpClick={() => setShowAuthModal(true)} />}

                {user && (
                    <div className="home-actions">
                        <Link to="/start" className="btn btn-primary">Start Today</Link>
                        <Link to={`/${profile?.username}`} className="btn btn-secondary">View Profile</Link>
                    </div>
                )}

                <DaysGrid totalDays={totalDays} daysPassed={daysPassed} />

                <footer>
                    <p className="tagline">A simple reminder that time moves.</p>
                </footer>
            </main>
            {!user && (
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                />
            )}
        </>
    );
}

// Start page (today's tasks) - requires auth
function StartPage() {
    const { user, profile, loading, refreshProfile } = useAuth();

    if (loading) {
        return (
            <main>
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
            </main>
        );
    }

    // Redirect to home if not logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // User needs to set username first
    if (!profile || !profile.username) {
        return <UsernameSetup onComplete={refreshProfile} />;
    }

    return (
        <>
            <UserMenu />
            <Dashboard />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/start" element={<StartPage />} />
                <Route path="/:username" element={<PublicProfile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
