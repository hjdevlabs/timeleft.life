import { useAuth } from '@shared/context';
import './AuthBanner.css';

export function AuthBanner({ onSignUpClick }) {
    const { user, loading } = useAuth();

    if (loading || user) return null;

    return (
        <>
            {/* Left side - floating avatars + tagline */}
            <div className="auth-side auth-side-left">
                <div className="auth-avatars">
                    <div className="auth-avatar auth-avatar-1">🎯</div>
                    <div className="auth-avatar auth-avatar-2">⏱️</div>
                    <div className="auth-avatar auth-avatar-3">✨</div>
                    <div className="auth-avatar auth-avatar-4">📊</div>
                </div>
                <p className="auth-side-text">
                    Track your<br />daily wins
                </p>
                <p className="auth-side-subtext">
                    Join others making<br />every moment count
                </p>
            </div>

            {/* Right side - CTA */}
            <div className="auth-side auth-side-right">
                <div className="auth-pulse-ring"></div>
                <p className="auth-side-label">Start tracking</p>
                <button className="auth-side-cta" onClick={onSignUpClick}>
                    Sign up free
                </button>
                <p className="auth-side-note">No credit card required</p>
            </div>
        </>
    );
}
