import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import BlockStack from "~/components/molecules/BlockStack";
import { useGetAccountsQuery } from "~/store/api/authApi";
import Loading from "~/components/atoms/Loading";
import { useEffect } from "@wordpress/element";
import {
    logOut,
    selectAuth,
    setActiveAccount,
    setLoginAccounts,
} from "~/store/features/authSlice";

const PAGE_ROUTE_MAP: Record<
    "file_browser" | "settings" | "widget_builder",
    (path: string) => boolean
> = {
    file_browser: (path) => path.startsWith("/file-browser/my-drive"),
    settings: (path) => path.startsWith("/settings"),
    widget_builder: (path) => path.startsWith("/widget-builder"),
};
const AuthRoute = ({
    children,
    skipAuthGuard = false,
    skipPermissionGuard = false,
}: {
    children: React.ReactNode;
    skipAuthGuard?: boolean;
    skipPermissionGuard?: boolean;
}) => {
    const isAdmin = pnpnd?.current_user?.roles?.includes("administrator");

    const shouldSkipFetch =
        !skipPermissionGuard &&
        !isAdmin &&
        !pnpnd?.current_user?.can?.has_full_access &&
        !pnpnd?.current_user?.can?.accounts_connect &&
        !pnpnd?.current_user?.can?.accounts_manage;

    const {
        data: accountsData,
        isLoading,
        isError,
    } = useGetAccountsQuery(
        {},
        {
            skip: shouldSkipFetch,
        },
    );
    const { login_accounts, active_account: reduxActiveAccount } =
        useAppSelector(selectAuth);

    const accounts = accountsData?.data;
    const activeAccountFromQuery = accounts?.find((a) => !!a.active);

    const activeAccount = reduxActiveAccount || activeAccountFromQuery;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    if (shouldSkipFetch) {
        return children;
    }

    useEffect(() => {
        if (isLoading) return;

        if (accounts) {
            dispatch(setLoginAccounts(accounts));

            if (activeAccountFromQuery && !reduxActiveAccount) {
                dispatch(setActiveAccount(activeAccountFromQuery));
            }
        } else {
            dispatch(logOut());
        }

        if (isError) {
            dispatch(logOut());
        }
    }, [
        accounts,
        isError,
        activeAccountFromQuery,
        reduxActiveAccount,
        dispatch,
    ]);

    useEffect(() => {
        if (isLoading || skipAuthGuard) return;

        const isProtectedRoute =
            currentPath.startsWith("/file-browser") ||
            currentPath.startsWith("/widget-builder");

        if (!activeAccount && isProtectedRoute) {
            navigate("/login", { replace: true });
            return;
        }

        if (activeAccount && currentPath === "/login") {
            navigate("/file-browser/my-drive", { replace: true });
            return;
        }

        if (
            activeAccount &&
            (currentPath === "/" || currentPath === "/file-browser")
        ) {
            navigate("/file-browser/my-drive", { replace: true });
            return;
        }

        if (pnpnd.user_access !== "1") {
            const { pages = [] } = pnpnd?.user_access || {};

            const hasAccess = pages.some(
                (page) => PAGE_ROUTE_MAP[page]?.(currentPath),
            );

            // if (!hasAccess) {
            //     navigate("/404", { replace: true });
            // }
        }
    }, [activeAccount, currentPath, isLoading, skipAuthGuard, navigate]);

    if (isLoading) {
        return (
            <BlockStack align="center" inlineAlign="center" className="h-full">
                <Loading />
            </BlockStack>
        );
    }

    if (
        !skipAuthGuard &&
        !reduxActiveAccount &&
        login_accounts?.length &&
        login_accounts?.length > 0
    ) {
        return <Navigate to="/settings/accounts" replace />;
    }

    if (!skipAuthGuard && currentPath !== "/login" && !activeAccount) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthRoute;
