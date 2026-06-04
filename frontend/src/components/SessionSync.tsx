'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';

/**
 * SessionSync — Detects when another browser tab logs into a different account
 * (by watching localStorage changes) and reloads the current tab so both tabs
 * stay in sync. Without this, tab A silently shows stale data from the old session.
 */
export default function SessionSync() {
    const currentTokenRef = useRef<string | null>(null);

    useEffect(() => {
        // Capture the token we started with
        currentTokenRef.current = localStorage.getItem('token');

        const handleStorageChange = (e: StorageEvent) => {
            // Only react to auth-related keys changing from ANOTHER tab
            if (e.key === 'token') {
                const newToken = e.newValue;
                const oldToken = currentTokenRef.current;

                if (newToken !== oldToken) {
                    if (!newToken) {
                        // Another tab logged out — force logout here too
                        useAuthStore.getState().logout();
                        window.location.href = '/login';
                    } else {
                        // Another tab logged into a different account — reload to pick it up
                        currentTokenRef.current = newToken;
                        window.location.reload();
                    }
                }
            }

            if (e.key === 'user' && e.newValue) {
                // User object changed in another tab — refresh auth store
                try {
                    const newUser = JSON.parse(e.newValue);
                    const token = localStorage.getItem('token');
                    if (newUser && token) {
                        useAuthStore.getState().setAuth(newUser, token);
                    }
                } catch {
                    // Ignore parse errors
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return null; // This component renders nothing — it's pure logic
}
