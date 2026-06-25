import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { useGetAccountsQuery } from "~features/auth/api/authApi";
import { init, logOut, selectAuth } from "~features/auth/state/authSlice";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { userCan } from "~kernel/utils/permissions";
import type { Account } from "~kernel/types/Types";

export type AuthGuardResult = {
    resolved: boolean;
    isSkipped: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    activeAccount: Account | null;
    loginAccounts: Account[] | null;
};

export default function useAuthGuard(
    skipPermissionGuard = false,
): AuthGuardResult {
    const isAdmin = pnpnd?.current_user?.roles?.includes("administrator");

    const shouldSkipFetch = useMemo(
        () =>
            !skipPermissionGuard &&
            !isAdmin &&
            !userCan("has_full_access") &&
            !userCan("accounts_connect") &&
            !userCan("accounts_manage"),
        [skipPermissionGuard, isAdmin],
    );

    const { data: accountsData, isLoading, isError } = useGetAccountsQuery(
        {},
        { skip: shouldSkipFetch },
    );

    const { login_accounts, active_account } = useAppSelector(selectAuth);
    const dispatch = useAppDispatch();

    const syncedRef = useRef<object | null>(null);
    const resolvedRef = useRef(false);
    const [resolved, setResolved] = useState(false);

    useEffect(() => {
        if (shouldSkipFetch) {
            if (!resolvedRef.current) {
                resolvedRef.current = true;
                setResolved(true);
            }
            return;
        }

        if (isLoading) return;

        const accounts = accountsData?.data;

        if (accounts) {
            if (syncedRef.current === accounts) return;
            syncedRef.current = accounts;

            const activeFromQuery = accounts.find((a) => !!a.active);
            dispatch(
                init({
                    login_accounts: accounts,
                    active_account: activeFromQuery || null,
                }),
            );
        } else if (isError) {
            syncedRef.current = null;
            dispatch(logOut());
        }

        if (!resolvedRef.current) {
            resolvedRef.current = true;
            setResolved(true);
        }
    }, [accountsData, isError, isLoading, shouldSkipFetch, dispatch]);

    return {
        resolved: shouldSkipFetch ? true : resolved,
        isSkipped: shouldSkipFetch,
        isLoading: !shouldSkipFetch && isLoading,
        isAuthenticated: !!active_account,
        activeAccount: active_account,
        loginAccounts: login_accounts,
    };
}
