import { useState, useEffect, useCallback } from 'react';
import type { GoogleUser } from '../types';

export const useGoogleAuth = () => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDemo, setIsDemo] = useState(false);
    
    // Check session with our backend on component mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        setUser(data.user);
                        setIsAuthenticated(true);
                        setIsDemo(false);
                    }
                }
                // If response is not ok (e.g., 401), we just remain logged out.
            } catch (err) {
                console.error('Session check failed:', err);
                setError("Could not connect to the server to check your session.");
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const signIn = () => {
        // Redirect to our backend which will handle the Google OAuth flow
        window.location.href = '/api/auth/google';
    };

    const signOut = useCallback(async () => {
        if(isDemo) {
            // For demo mode, just clear local state
            setUser(null);
            setIsAuthenticated(false);
            setIsDemo(false);
            return;
        }

        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            // Always clear frontend state regardless of backend call success
            setUser(null);
            setIsAuthenticated(false);
            setIsDemo(false);
        }
    }, [isDemo]);
    
    const signInAsDemoUser = () => {
        const demoUser: GoogleUser = {
            name: 'Demo User',
            email: 'demo.user@example.com',
            picture: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48px" height="48px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')}`,
            isDemo: true,
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        setIsDemo(true);
        setError(null);
        setIsLoading(false);
    };

    return { user, isAuthenticated, isDemo, isLoading, error, signIn, signOut, signInAsDemoUser };
};
