import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@shared/lib/api';
import { useAuth } from '@shared/context';
import './UsernameSetup.css';

export function UsernameSetup({ onComplete }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        if (!user) {
            setError('Not logged in');
            return;
        }

        setLoading(true);
        setError('');

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            setError('Username must be 3-20 characters (letters, numbers, underscore)');
            setLoading(false);
            return;
        }

        try {
            await api.upsert('profiles', {
                id: user.id,
                email: user.email,
                username: username.toLowerCase()
            });

            setLoading(false);
            await onComplete();
            navigate(`/${username.toLowerCase()}`);
        } catch (err) {
            if (err.code === '23505') {
                setError('Username already taken');
            } else {
                setError(err.message || 'Failed to save profile');
            }
            setLoading(false);
        }
    };

    return (
        <div className="username-setup">
            <div className="username-setup-card">
                <h1 className="username-setup-title">Choose your username</h1>
                <p className="username-setup-subtitle">
                    This will be your public profile URL
                </p>

                <form onSubmit={handleSubmit} className="username-setup-form">
                    <div className="username-input-wrapper">
                        <span className="username-prefix">timeleft.life/</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            placeholder="username"
                            maxLength={20}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {error && <p className="username-error">{error}</p>}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!username.trim() || loading}
                    >
                        {loading ? 'Setting up...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
