import { Account, ServerResponse } from "~/types/Types";
import { TRootState } from "../store";
import { baseApi } from "./baseApi";

type AccountsResponse = ServerResponse<Account[]>;

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAccounts: builder.query<AccountsResponse, { account_key?: string }>({
            async queryFn({ account_key = "all" }, api, _extra, fetchWithBQ) {
                const state = api.getState() as TRootState;
                const existing_accounts = state.auth.login_accounts;

                if (!existing_accounts) {
                    const local_data = pnpnd.accounts;

                    if (local_data) {
                        return {
                            data: {
                                message: "success",
                                success: true,
                                data: local_data,
                            } as AccountsResponse,
                        };
                    }
                }

                const result = await fetchWithBQ({
                    url: `account/${account_key}`,
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
                account_key: string;
                connection_type?: "automatic" | "manual";
                app_key?: string;
                app_secret?: string;
            }
        >({
            query: ({ account_key, app_key, app_secret, connection_type }) => {
                const params: Record<string, string> = { account_key };

                if (app_key) {
                    params.app_key = app_key;
                }
                if (app_secret) {
                    params.app_secret = app_secret;
                }
                if (connection_type) {
                    params.connection_type = connection_type;
                }

                return {
                    url: "account/auth-url",
                    method: "GET",
                    params,
                };
            },
        }),

        switchAccount: builder.mutation<ServerResponse<void>, string>({
            query: (account_key) => {
                return {
                    url: "account/switch",
                    method: "POST",
                    body: { account_key },
                };
            },
            invalidatesTags: ["Auth", "Folder", "Folder_Tree"],
        }),

        deleteAccount: builder.mutation<ServerResponse<void>, string>({
            query: (account_key) => {
                return {
                    url: `account/${account_key}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["Auth", "Folder"],
        }),

        getUserRoles: builder.query<
            ServerResponse<{
                roles: { role_key: string; role_name: string }[];
            }>,
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
            ServerResponse<{ users: { id: number; user_login: string }[] }>,
            {
                hide_current_user?: boolean;
            }
        >({
            query: ({ hide_current_user }) => {
                return {
                    url: "user/list",
                    method: "GET",
                    params: { hide_current_user: hide_current_user },
                };
            },
        }),

        syncAccount: builder.mutation<
            ServerResponse<null>,
            {
                account_key: string;
            }
        >({
            query: ({ account_key }) => {
                return {
                    url: "account/sync",
                    method: "POST",
                    params: { account_key },
                };
            },

            invalidatesTags: ["Auth"],
        }),

        syncAccountStatus: builder.query<
            ServerResponse<{ syncing: boolean }>,
            { account_key: string }
        >({
            query: ({ account_key }) => {
                return {
                    url: "account/sync",
                    method: "GET",
                    params: { account_key },
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
