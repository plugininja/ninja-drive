import { useCallback, useEffect, useRef, useState } from "@wordpress/element";
import { useLazySyncAccountStatusQuery } from "~/store/api/authApi";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { selectAuth } from "~/store/features/authSlice";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "~/store/hooks";
import Cron from "~/components/molecules/Cron";
import { CSS_VAR } from "~/types/tokens";

const MainRoute = ({ children }: { children: React.ReactNode }) => {
    const [theme] = useLocalStorage<"light" | "dark" | "system">(
        "pnpnd-theme-status",
        "system",
    );
    const { pathname } = useLocation();
    const { loginAccounts } = useAppSelector(selectAuth);
    const [syncAccountStatus] = useLazySyncAccountStatusQuery();

    const [isSyncing, setIsSyncing] = useState(false);
    const isPollingRef = useRef(false);
    const currentAccountKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const color = pnpnd.settings?.appearance?.primaryColor ?? "#0061fe";
        const root = document.documentElement;

        const applyTheme = () => {
            if (theme === "system") {
                const prefersDark = window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches;
                root.setAttribute(
                    "pnpnd-theme-status",
                    prefersDark ? "dark" : "light",
                );
            } else {
                root.setAttribute("pnpnd-theme-status", theme);
            }
            root.style.setProperty(CSS_VAR.PRIMARY, color);
        };

        applyTheme();

        if (theme === "system") {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => applyTheme();
            mq.addEventListener("change", handler);
            return () => mq.removeEventListener("change", handler);
        }
    }, [theme]);

    useEffect(() => {
        const anchors = document.querySelectorAll(
            'a[href^="admin.php?page=ninja-drive#"]',
        );

        anchors.forEach((a) => {
            (a as HTMLAnchorElement).classList.remove("current");
        });

        const matched: HTMLAnchorElement[] = [];

        anchors.forEach((a) => {
            const href = a.getAttribute("href");
            const hashPath = href?.split("#")[1];
            const anchor = a as HTMLAnchorElement;

            if (pathname.startsWith(hashPath || "")) {
                matched.push(anchor);
            }
        });

        if (matched.length >= 2) {
            matched[1].classList.add("current");
        } else if (matched.length === 1) {
            matched[0].classList.add("current");
        }
    }, [pathname]);

    const stopPolling = useCallback(() => {
        setIsSyncing(false);
        currentAccountKeyRef.current = null;
        isPollingRef.current = false;
    }, []);

    const pollSyncStatus = useCallback(
        async (accountKey: string) => {
            if (isPollingRef.current) return;
            if (
                currentAccountKeyRef.current &&
                currentAccountKeyRef.current !== accountKey
            ) {
                stopPolling();
            }

            isPollingRef.current = true;
            currentAccountKeyRef.current = accountKey;
            setIsSyncing(true);

            try {
                const response = await syncAccountStatus({
                    accountKey,
                }).unwrap();

                const isStillSyncing = response?.data?.syncing === true;

                if (isStillSyncing) {
                    setTimeout(() => {
                        pollSyncStatus(accountKey);
                    }, 5000);
                } else {
                    stopPolling();
                }
            } catch (error) {
                stopPolling();
            } finally {
                isPollingRef.current = false;
            }
        },
        [syncAccountStatus, stopPolling],
    );

    useEffect(() => {
        const handleSyncEvent = (e: CustomEvent<{ accountKey: string }>) => {
            const { accountKey } = e.detail;
            if (accountKey) {
                stopPolling();
                pollSyncStatus(accountKey);
            }
        };

        window.addEventListener(
            "SYNC_ACCOUNT_START",
            handleSyncEvent as EventListener,
        );

        return () => {
            window.removeEventListener(
                "SYNC_ACCOUNT_START",
                handleSyncEvent as EventListener,
            );
            stopPolling();
        };
    }, [pollSyncStatus, stopPolling]);

    useEffect(() => {
        if (!loginAccounts || isSyncing) return;

        const syncingAccount = loginAccounts.find(
            (acc: any) => acc?.syncing === true,
        );

        if (syncingAccount?.accountKey) {
            pollSyncStatus(syncingAccount?.accountKey);
        }
    }, [loginAccounts, pollSyncStatus, isSyncing]);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    useEffect(() => {
        document.getElementById("dolly")?.style.setProperty("display", "none");

        const container = document.getElementById("wpbody-content");

        if (!container) return;

        let rafId: number | null = null;

        const applyStyle = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                container
                    .querySelectorAll(
                        ".notice.is-dismissible.pnpnd-notice.notice-error, .notice.is-dismissible.pnpnd-notice.notice-info",
                    )
                    .forEach((el) => {
                        (el as HTMLElement).style.setProperty(
                            "margin",
                            "0",
                            "important",
                        );
                    });
                rafId = null;
            });
        };

        applyStyle();

        const observer = new MutationObserver(applyStyle);

        observer.observe(container, { childList: true, subtree: true });

        return () => {
            observer.disconnect();

            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
            {isSyncing && <Cron loading={isSyncing} />}
            {children}
        </>
    );
};

export default MainRoute;
