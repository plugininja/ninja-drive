import { useCallback, useEffect, useRef, useState } from "@wordpress/element";
import { useLazySyncAccountStatusQuery } from "~features/auth/api/authApi";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

const useSyncStatusPolling = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncAccountStatus] = useLazySyncAccountStatusQuery();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionIdRef = useRef(0);
    const attemptsRef = useRef(0);
    const currentAccountKeyRef = useRef<string | null>(null);

    const clearPendingTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const stopPolling = useCallback(() => {
        clearPendingTimeout();
        sessionIdRef.current += 1;
        attemptsRef.current = 0;
        currentAccountKeyRef.current = null;
        setIsSyncing(false);
    }, [clearPendingTimeout]);

    const startPolling = useCallback(
        (account_key: string) => {
            if (!account_key) return;

            clearPendingTimeout();
            sessionIdRef.current += 1;
            const mySessionId = sessionIdRef.current;

            attemptsRef.current = 0;
            currentAccountKeyRef.current = account_key;
            setIsSyncing(true);

            const tick = async () => {
                if (sessionIdRef.current !== mySessionId) return;

                attemptsRef.current += 1;

                try {
                    const response = await syncAccountStatus({
                        account_key,
                    }).unwrap();

                    if (sessionIdRef.current !== mySessionId) return;

                    const isStillSyncing = response?.data?.syncing === true;
                    const reachedMax = attemptsRef.current >= MAX_POLL_ATTEMPTS;

                    if (isStillSyncing && !reachedMax) {
                        timeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
                    } else {
                        timeoutRef.current = null;
                        sessionIdRef.current += 1;
                        attemptsRef.current = 0;
                        currentAccountKeyRef.current = null;
                        setIsSyncing(false);
                    }
                } catch (error) {
                    if (sessionIdRef.current !== mySessionId) return;

                    timeoutRef.current = null;
                    sessionIdRef.current += 1;
                    attemptsRef.current = 0;
                    currentAccountKeyRef.current = null;
                    setIsSyncing(false);
                }
            };

            tick();
        },
        [syncAccountStatus, clearPendingTimeout],
    );

    useEffect(() => {
        return () => {
            clearPendingTimeout();
            sessionIdRef.current += 1;
        };
    }, [clearPendingTimeout]);

    return {
        isSyncing,
        startPolling,
        stopPolling,
        currentAccountKey: currentAccountKeyRef,
    };
};

export default useSyncStatusPolling;
