import { Navigate, useLocation } from "react-router-dom";
import useAuthGuard from "~features/auth/hooks/useAuthGuard";
import { userCanViewPage, type ViewPage } from "~kernel/utils/permissions";
import type { Account } from "~kernel/types/Types";
import { BlockStack } from "~/ui/molecules";
import { Loading } from "~/ui/atoms";

const PAGE_KEY_MAP: Record<string, ViewPage | null> = {
    "file-browser": "file_manager",
    "media-library": "media_library",
    "widget-builder": "widget_builder",
    "user-access": "user_access",
    settings: "settings",
};

const PAGE_ROUTES: Record<ViewPage, string> = {
    file_manager: "/file-browser/my-drive",
    media_library: "/media-library",
    widget_builder: "/widget-builder",
    settings: "/settings/accounts",
    user_access: "/user-access",
};

const PAGE_PRIORITY: ViewPage[] = [
    "file_manager",
    "media_library",
    "widget_builder",
    "settings",
    "user_access",
];

function getPageKey(pathname: string): ViewPage | null {
    const match = pathname.match(/^\/([^/]+)/);
    if (!match) return null;
    return PAGE_KEY_MAP[match[1]] ?? null;
}

function findAccessiblePage(): string | null {
    for (const page of PAGE_PRIORITY) {
        if (userCanViewPage(page)) {
            return PAGE_ROUTES[page];
        }
    }
    return null;
}

function getRedirect(
    pathname: string,
    isAuthenticated: boolean,
    loginAccounts: Account[] | null,
): string | null {
    if (isAuthenticated && pathname === "/login") {
        return "/file-browser/my-drive";
    }

    if (isAuthenticated && (pathname === "/" || pathname === "/file-browser")) {
        return "/file-browser/my-drive";
    }

    if (!isAuthenticated) {
        if (loginAccounts && loginAccounts.length > 0) {
            return "/settings/accounts";
        }

        if (pathname !== "/login") {
            return "/login";
        }
    }

    if (pathname !== "/login") {
        const pageKey = getPageKey(pathname);
        if (pageKey && !userCanViewPage(pageKey)) {
            return findAccessiblePage() || "/settings/accounts";
        }
    }

    return null;
}

const AuthRoute = ({
    children,
    skipAuthGuard = false,
    skipPermissionGuard = false,
    loadingSkip = false,
}: {
    children: React.ReactNode;
    skipAuthGuard?: boolean;
    skipPermissionGuard?: boolean;
    loadingSkip?: boolean;
}) => {
    const { pathname } = useLocation();
    const { resolved, isSkipped, isLoading, isAuthenticated, loginAccounts } =
        useAuthGuard(skipPermissionGuard);

    if (isSkipped) {
        return children;
    }

    if (!resolved || (!loadingSkip && isLoading)) {
        return (
            <BlockStack align="center" inlineAlign="center" className="h-full">
                <Loading />
            </BlockStack>
        );
    }

    if (!skipAuthGuard) {
        const redirectTo = getRedirect(
            pathname,
            isAuthenticated,
            loginAccounts,
        );
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

export default AuthRoute;
