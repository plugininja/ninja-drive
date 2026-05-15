import { Account, ServerResponse } from "~/types/Types";
import { baseApi } from "./baseApi";
import { TRootState } from "../store";

type AccountsResponse = ServerResponse<Account[]>;

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAccounts: builder.query<AccountsResponse, { accountKey?: string }>({
            async queryFn({ accountKey = "all" }, api, _extra, fetchWithBQ) {
                const state = api.getState() as TRootState;
                const existingAccounts = state.auth.loginAccounts;

                if (!existingAccounts) {
                    const localData = pnpnd.accounts;

                    if (localData) {
                        return {
                            data: {
                                message: "success",
                                success: true,
                                data: localData,
                            } as AccountsResponse,
                        };
                    }
                }

                const result = await fetchWithBQ({
                    url: `account/${accountKey}`,
                });

                if (result.error) {
                    return { error: result.error };
                }

                return {
                    data: result.data as AccountsResponse,
                };
            },

            providesTags: ["Auth"],
        }),

        getAuthUrl: builder.query<
            ServerResponse<string>,
            {
                accountKey: string;
                connectionType?: "automatic" | "manual";
                appKey?: string;
                appSecret?: string;
            }
        >({
            query: ({ accountKey, appKey, appSecret, connectionType }) => {
                const params: Record<string, string> = { accountKey };

                if (appKey) {
                    params.appKey = appKey;
                }
                if (appSecret) {
                    params.appSecret = appSecret;
                }
                if (connectionType) {
                    params.connectionType = connectionType;
                }

                return {
                    url: "account/auth-url",
                    method: "GET",
                    params,
                };
            },
        }),

        switchAccount: builder.mutation<ServerResponse<void>, string>({
            query: (accountKey) => {
                return {
                    url: "account/switch",
                    method: "POST",
                    body: { accountKey },
                };
            },
            invalidatesTags: ["Auth", "Folder"],
        }),

        deleteAccount: builder.mutation<ServerResponse<void>, string>({
            query: (accountKey) => {
                return {
                    url: `account/${accountKey}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["Auth", "Folder"],
        }),

        getUserRoles: builder.query<
            ServerResponse<{ roles: { roleKey: string; roleName: string }[] }>,
            void
        >({
            query: () => {
                return {
                    url: "user/roles",
                    method: "GET",
                };
            },
        }),

        getUserList: builder.query<
            ServerResponse<{ users: { ID: number; user_login: string }[] }>,
            {
                hideCurrentUser?: boolean;
            }
        >({
            query: ({ hideCurrentUser }) => {
                return {
                    url: "user/list",
                    method: "GET",
                    params: { hideCurrentUser: hideCurrentUser },
                };
            },
        }),

        syncAccount: builder.mutation<
            ServerResponse<null>,
            {
                accountKey: string;
            }
        >({
            query: ({ accountKey }) => {
                return {
                    url: "account/sync",
                    method: "POST",
                    params: { accountKey },
                };
            },

            invalidatesTags: ["Auth"],
        }),

        syncAccountStatus: builder.query<
            ServerResponse<{ syncing: boolean }>,
            { accountKey: string }
        >({
            query: ({ accountKey }) => {
                return {
                    url: "account/sync",
                    method: "GET",
                    params: { accountKey },
                };
            },
        }),
    }),

    overrideExisting: false,
});

export const {
    useGetAccountsQuery,
    useLazyGetAuthUrlQuery,
    useSwitchAccountMutation,
    useDeleteAccountMutation,
    useGetUserRolesQuery,
    useGetUserListQuery,
    useSyncAccountMutation,
    useLazySyncAccountStatusQuery,
} = authApi;
