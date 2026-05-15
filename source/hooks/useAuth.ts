import { __, sprintf } from "@wordpress/i18n";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { openAuthWindow, toBoolean } from "~/utils/functions";
import { useCustomAlert } from "~/components/molecules/Alert";
import { settingsApi } from "~/store/api/settingsApi";
import { Account } from "~/types/Types";
import {
    useDeleteAccountMutation,
    useLazyGetAuthUrlQuery,
    useSwitchAccountMutation,
    useSyncAccountMutation,
} from "~/store/api/authApi";
import { setActiveAccount, setLoginAccounts } from "~/store/features/authSlice";

export default function useAuth() {
    const { activeAccount, loginAccounts } = useAppSelector(
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
        accountKey: string = "",
        appKey?: string,
        appSecret?: string,
        isLost: boolean = false,
        connectionType?: "automatic" | "manual",
    ) => {
        if (isLost) {
            showAlert({
                type: "question",
                title: __("Re authenticate", "ninja-drive"),
                text: __("Are you sure you want to re authenticate this account?", "ninja-drive"),
                showConfirmButton: true,
                confirmButtonText: __("Re authenticate", "ninja-drive"),
                showCancelButton: true,
                icon: "question",
                width: "450px",
                onConfirm: async () => {
                    try {
                        const res = await getAuthUrl({
                            accountKey,
                            connectionType: connectionType,
                        }).unwrap();

                        dispatch(
                            settingsApi.util.invalidateTags(["Auth", "Folder"]),
                        );

                        showAlert({
                            toast: true,
                            type: "success",
                            text:
                                res?.message ||
                                __("Account re authenticated successfully.", "ninja-drive"),
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
                                __("Failed to re authenticate account.", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                },
            });

            return;
        }

        try {
            getAuthUrl({
                accountKey,
                appKey,
                appSecret,
                connectionType: connectionType,
            })
                .unwrap()
                .then((res) => {
                    openAuthWindow(res.data);
                });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccountSwitch = async (account: Account) => {
        showAlert({
            type: "question",
            title: __("Switch", "ninja-drive"),
            text: __("Are you sure you want to switch to this account?", "ninja-drive"),
            showConfirmButton: true,
            confirmButtonText: __("Switch", "ninja-drive"),
            showCancelButton: true,
            icon: "question",
            width: "450px",
            onConfirm: async () => {
                if (!account?.accountKey) {
                    console.error("Account not found");
                    return;
                }
                if (account.lost) {
                    handleAddNewAccount(account.accountKey);
                    return;
                }
                try {
                    const result = await switchAccount(
                        account.accountKey,
                    ).unwrap();

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message || __("Account switched successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message || __("Failed to switch account.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleSyncAccount = async (accountKey: string) => {
        showAlert({
            type: "info",
            title: __("Sync", "ninja-drive"),
            text: __("Do you want to sync this account along with all its cached files?", "ninja-drive"),
            showConfirmButton: true,
            confirmButtonText: __("Sync", "ninja-drive"),
            showCancelButton: true,
            icon: "info",
            width: "450px",
            onConfirm: async () => {
                try {
                    const result = await syncAccount({
                        accountKey,
                    }).unwrap();

                    const event = new CustomEvent("SYNC_ACCOUNT_START", {
                        detail: { accountKey },
                    });

                    window.dispatchEvent(event);

                    showAlert({
                        toast: true,
                        type: "success",
                        text: result?.message || __("Account synced successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text: error?.data?.message || __("Failed to sync account.", "ninja-drive"),
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
            title: __("Remove", "ninja-drive"),
            text: __("Are you sure you want to remove this account?", "ninja-drive"),
            showConfirmButton: true,
            confirmButtonText: __("Remove", "ninja-drive"),
            showCancelButton: true,
            icon: "error",
            width: "450px",
            onConfirm: async () => {
                try {
                    const result = await removeAccount(
                        account?.accountKey!,
                    ).unwrap();

                    dispatch(settingsApi.util.invalidateTags(["Auth"]));

                    const isActiveAccount =
                        activeAccount?.accountKey === account?.accountKey;

                    const isLastAccount = loginAccounts?.length === 1;

                    if (isActiveAccount) {
                        dispatch(setActiveAccount(null as any));
                    }

                    if (isLastAccount) {
                        dispatch(setLoginAccounts([]));
                    }

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message || __("Account removed successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message || __("Failed to remove account.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return {
        activeAccount,
        loginAccounts,
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
