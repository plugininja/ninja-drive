import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { openAuthWindow, toBoolean } from "~kernel/utils/functions";
import { settingsApi } from "~features/settings/api/settingsApi";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { Account } from "~kernel/types/Types";
import { __ } from "@wordpress/i18n";
import {
    setActiveAccount,
    setLoginAccounts,
} from "~features/auth/state/authSlice";
import {
    useDeleteAccountMutation,
    useLazyGetAuthUrlQuery,
    useSwitchAccountMutation,
    useSyncAccountMutation,
} from "~features/auth/api/authApi";

export default function useAuth() {
    const { active_account, login_accounts } = useAppSelector(
        (state) => state.auth,
    );

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const [getAuthUrl, { isLoading: isGettingAuthUrl }] =
        useLazyGetAuthUrlQuery();
    const [switchAccount, { isLoading: isSwitchingAccount }] =
        useSwitchAccountMutation();
    const [syncAccount, { isLoading: isSyncingAccount }] =
        useSyncAccountMutation();
    const [removeAccount, { isLoading: isRemovingAccount }] =
        useDeleteAccountMutation();

    const handleAddNewAccount = async (
        account_key: string = "",
        app_key?: string,
        app_secret?: string,
        isLost: boolean = false,
        connection_type?: "automatic" | "manual",
    ) => {
        const getOAuthUrl = async () => {
            const res = await getAuthUrl({
                account_key,
                connection_type,
                app_key,
                app_secret,
            }).unwrap();
            return res;
        };

        const showError = (msg?: string) => {
            showAlert({
                toast: true,
                type: "error",
                text:
                    msg ||
                    __(
                        isLost
                            ? "Failed to re authenticate account."
                            : "Failed to get authentication URL.",
                        "ninja-drive",
                    ),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        };

        if (isLost) {
            showAlert({
                type: "question",
                title: __("Re authenticate", "ninja-drive"),
                text: __(
                    "Are you sure you want to re authenticate this account?",
                    "ninja-drive",
                ),
                showConfirmButton: true,
                confirmButtonText: __("Re authenticate", "ninja-drive"),
                showCancelButton: true,
                icon: "question",
                width: "450px",
                onConfirm: async () => {
                    try {
                        const res = await getOAuthUrl();
                        dispatch(
                            settingsApi.util.invalidateTags(["Auth", "Folder"]),
                        );
                        showAlert({
                            toast: true,
                            type: "success",
                            text:
                                res?.message ||
                                __(
                                    "Account re authenticated successfully.",
                                    "ninja-drive",
                                ),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    } catch (error: any) {
                        showError(error?.data?.message);
                    }
                },
            });
            return;
        }

        try {
            const res = await getOAuthUrl();
            openAuthWindow(res.data);
        } catch (error: any) {
            showError(error?.data?.message);
        }
    };

    const handleAccountSwitch = async (account: Account) => {
        showAlert({
            type: "question",
            title: __("Switch", "ninja-drive"),
            text: __(
                "Are you sure you want to switch to this account?",
                "ninja-drive",
            ),
            showConfirmButton: true,
            confirmButtonText: __("Switch", "ninja-drive"),
            showCancelButton: true,
            icon: "question",
            width: "450px",
            onConfirm: async () => {
                if (!account?.account_key) {
                    console.error("Account not found");
                    return;
                }
                if (account.lost) {
                    handleAddNewAccount(account.account_key);
                    return;
                }
                try {
                    const result = await switchAccount(
                        account.account_key,
                    ).unwrap();

                    dispatch(setActiveAccount(result?.data!));

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __("Account switched successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Failed to switch account.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleSyncAccount = async (account_key: string) => {
        showAlert({
            type: "info",
            title: __("Sync", "ninja-drive"),
            text: __(
                "Do you want to sync this account along with all its cached files?",
                "ninja-drive",
            ),
            showConfirmButton: true,
            confirmButtonText: __("Sync", "ninja-drive"),
            showCancelButton: true,
            icon: "info",
            width: "450px",
            onConfirm: async () => {
                try {
                    const result = await syncAccount({
                        account_key,
                    }).unwrap();

                    const event = new CustomEvent("SYNC_ACCOUNT_START", {
                        detail: { account_key },
                    });

                    window.dispatchEvent(event);

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __("Account synced successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Failed to sync account.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleAccountRemove = async (account: Account) => {
        showAlert({
            type: "error",
            title: __("Account remove", "ninja-drive"),
            text: __(
                `Are you sure you want to remove "${account?.name}" account?`,
                "ninja-drive",
            ),
            showConfirmButton: true,
            confirmButtonText: __("Remove", "ninja-drive"),
            showCancelButton: true,
            icon: "error",
            width: "450px",
            onConfirm: async () => {
                try {
                    const result = await removeAccount(
                        account?.account_key!,
                    ).unwrap();

                    const remainingAccounts = login_accounts?.filter(
                        (acc) => acc.account_key !== account?.account_key,
                    );

                    dispatch(setLoginAccounts(remainingAccounts || []));

                    if (active_account?.account_key === account?.account_key) {
                        dispatch(setActiveAccount(null));
                    }

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __("Account removed successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Failed to remove account.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return {
        active_account,
        login_accounts,
        handleAddNewAccount,
        handleAccountSwitch,
        handleSyncAccount,
        handleAccountRemove,
        isGettingAuthUrl,
        isSwitchingAccount,
        isSyncingAccount,
        isRemovingAccount,
    };
}
