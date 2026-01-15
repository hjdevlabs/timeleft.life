import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@shared/lib/supabase';
import { api } from '@shared/lib/api';

const AuthContext = createContext(null);

// Get storage key for Supabase session
const STORAGE_KEY = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;

// Read session directly from localStorage (bypasses hanging SDK)
function getStoredSession() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Check if token is expired
            if (parsed.expires_at && parsed.expires_at * 1000 > Date.now()) {
                return parsed;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async (userId) => {
        if (!userId) {
            setProfile(null);
            return null;
        }
        try {
            const data = await api.getById('profiles', userId);
            setProfile(data);
            return data;
        } catch {
            setProfile(null);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        let mounted = true;

        // Get initial session from localStorage (fast, no SDK call)
        const initAuth = async () => {
            try {
                const storedSession = getStoredSession();

                if (!mounted) return;

                if (storedSession?.user) {
                    setUser(storedSession.user);
                    await fetchProfile(storedSession.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes (this still works)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signInWithEmail = async (email, password) => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        setError(null);
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) setError(result.error.message);
        return result;
    };

    const signUpWithEmail = async (email, password) => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        setError(null);
        const result = await supabase.auth.signUp({ email, password });
        if (result.error) setError(result.error.message);
        return result;
    };

    const signInWithGoogle = async () => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        setError(null);
        const result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (result.error) setError(result.error.message);
        return result;
    };

    const signOut = async () => {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        setError(null);
        const result = await supabase.auth.signOut();
        if (result.error) setError(result.error.message);
        return result;
    };

    const value = {
        user,
        profile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshProfile: () => fetchProfile(user?.id),
        isConfigured: !!supabase
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
