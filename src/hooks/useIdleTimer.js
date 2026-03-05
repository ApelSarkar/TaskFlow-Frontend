import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../context/authSlice';
import environment from '../config/environment';

const IDLE_TIMEOUT_MS       = 15 * 60 * 1000;  // 15 minutes
const WARNING_BEFORE_MS     = 60 * 1000;        // warn 1 min before
const TOKEN_CHECK_INTERVAL = 30 * 1000;        // check token every 30s
// const IDLE_TIMEOUT_MS = 2 * 60 * 1000;  // 2 minutes (was 15)
// const WARNING_BEFORE_MS = 30 * 1000;       // warn 30s before (was 60s)


export function useIdleTimer() {
    const dispatch = useDispatch();
    const idleTimer = useRef(null);
    const warningTimer = useRef(null);
    const tokenChecker = useRef(null);
    const countdownTimer = useRef(null);

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const showWarningRef = useRef(false);

    useEffect(() => {
        showWarningRef.current = showWarning;
    }, [showWarning]);


    // ── Proactive token refresh ────────────────────────────────────
    const checkAndRefreshToken = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const expiresAt = payload.exp * 1000;
            const timeLeft = expiresAt - Date.now();

            // If less than 1 minute left → refresh now
            if (timeLeft > 0 && timeLeft <= 60000) {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) return;

                const res = await fetch(`${environment.API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('accessToken', data.data.accessToken);
                    console.log('[Token] Proactively refreshed');
                }
            }
        } catch (e) {
            console.warn('[Token] Refresh check failed', e);
        }
    }, []);

    // ── Reset idle timer on any user activity ──────────────────────
    const resetIdleTimer = useCallback(() => {
        clearTimeout(idleTimer.current);
        clearTimeout(warningTimer.current);
        clearInterval(countdownTimer.current);
        setShowWarning(false);
        setCountdown(60);

        // Show warning at 14 minutes
        warningTimer.current = setTimeout(() => {
            setShowWarning(true);
            setCountdown(60);
            countdownTimer.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) { clearInterval(countdownTimer.current); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

        // Force logout at 15 minutes
        idleTimer.current = setTimeout(() => {
            dispatch(logoutUser());
            window.location.href = '/login?reason=idle';
        }, IDLE_TIMEOUT_MS);

    }, [dispatch]);

    // ── Stay logged in button handler ──────────────────────────────
    const stayLoggedIn = useCallback(() => {
        setShowWarning(false);
        showWarningRef.current = false;
        clearInterval(countdownTimer.current);
        resetIdleTimer();
        checkAndRefreshToken();
    }, [resetIdleTimer, checkAndRefreshToken]);

    // ── Attach activity event listeners ───────────────────────────
    useEffect(() => {
        const isLoggedIn = !!localStorage.getItem('accessToken');
        if (!isLoggedIn) return;

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        // const onActivity = () => resetIdleTimer();
        const onActivity = () => {
            if (showWarningRef.current) return;
            resetIdleTimer();
        };

        events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
        resetIdleTimer();

        tokenChecker.current = setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL);

        return () => {
            events.forEach((e) => window.removeEventListener(e, onActivity));
            clearTimeout(idleTimer.current);
            clearTimeout(warningTimer.current);
            clearInterval(countdownTimer.current);
            clearInterval(tokenChecker.current);
        };
    }, [resetIdleTimer, checkAndRefreshToken]);

    return { showWarning, countdown, stayLoggedIn };
}