import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/context';
import './UserMenu.css';

export function UserMenu() {
    const { user, profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;
    const initial = displayName.charAt(0).toUpperCase();

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="user-avatar" />
                ) : (
                    <div className="user-avatar-placeholder">{initial}</div>
                )}
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                        <span className="user-menu-name">{displayName}</span>
                        <span className="user-menu-email">{user.email}</span>
                    </div>
                    <div className="user-menu-divider" />
                    {profile?.username && (
                        <Link
                            to={`/${profile.username}`}
                            className="user-menu-item"
                            onClick={() => setIsOpen(false)}
                        >
                            View Profile
                        </Link>
                    )}
                    <button className="user-menu-item" onClick={handleSignOut}>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
