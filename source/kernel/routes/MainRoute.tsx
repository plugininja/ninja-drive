import { useUpgradePopUp } from "~/shared/upgrade/UpgradeModal";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { selectAuth } from "~features/auth/state/authSlice";
import { useSyncStatusPolling } from "~/features/auth";
import { useAppSelector } from "~kernel/store/hooks";
import { useEffect } from "@wordpress/element";
import { useLocation } from "react-router-dom";
import { CSS_VAR } from "~kernel/types/tokens";
import Cron from "~/shared/molecules/Cron";
import { __ } from "@wordpress/i18n";

const MainRoute = ({ children }: { children: React.ReactNode }) => {
    const [theme] = useLocalStorage<"light" | "dark" | "system">(
        "pnpnd-theme-status",
        "light",
    );
    const { pathname } = useLocation();

    const { showUpgradePopUp } = useUpgradePopUp();
    const { login_accounts } = useAppSelector(selectAuth);
    const { isSyncing, startPolling, stopPolling } = useSyncStatusPolling();

    useEffect(() => {
        window.PNPNDHelper.openUpgradePopUp = showUpgradePopUp;
    }, [showUpgradePopUp]);

    useEffect(() => {
        const color = pnpnd.settings?.appearance?.primary_color ?? "#0061fe";
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

    useEffect(() => {
        const handleSyncEvent = (e: CustomEvent<{ account_key: string }>) => {
            const { account_key } = e.detail;
            if (account_key) {
                startPolling(account_key);
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
    }, [startPolling, stopPolling]);

    useEffect(() => {
        if (isSyncing) return;

        const syncingAccount = login_accounts?.find(
            (acc: any) => acc?.syncing === true,
        );

        if (syncingAccount?.account_key) {
            startPolling(syncingAccount.account_key);
        }
    }, [login_accounts]);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    useEffect(() => {
        const element = document.querySelector(".ninja-drive.upgrade-mode");

        if (element) {
            element.parentElement?.classList.add(
                "ninja-drive-upgrade-mode-button",
            );
        }
    }, []);

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
            {isSyncing && (
                <Cron
                    loading={isSyncing}
                    title={__("Syncing in progress", "ninja-drive")}
                    description={__(
                        "All cache files are currently syncing in the background and may take some time. You can continue with other tasks or browse freely in the meantime.",
                        "ninja-drive",
                    )}
                />
            )}

            {children}
        </>
    );
};

export default MainRoute;
