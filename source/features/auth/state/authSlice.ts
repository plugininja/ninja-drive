import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "~kernel/types/states";
import { Account } from "~kernel/types/Types";

const initialState: AuthState = {
    login_accounts: null,
    active_account: null,
    loading: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        init: (
            state,
            action: PayloadAction<{
                login_accounts: Account[];
                active_account: Account | null;
            }>,
        ) => {
            state.login_accounts = action.payload.login_accounts;
            state.active_account = action.payload.active_account;
            state.loading = false;
        },

        setActiveAccount: (state, action: PayloadAction<Account | null>) => {
            state.active_account = action.payload;
            state.loading = false;
        },

        setLoginAccounts: (state, action: PayloadAction<Account[]>) => {
            state.login_accounts = action.payload;
            state.loading = false;
        },

        switchAccount: (state, action: PayloadAction<Account>) => {
            state.active_account = action.payload;
            state.login_accounts =
                state.login_accounts && state.login_accounts.length > 0
                    ? state.login_accounts.map((account) => ({
                          ...account,
                          active:
                              account.account_key === action.payload.account_key
                                  ? 1
                                  : 0,
                      }))
                    : null;
            state.loading = false;
        },
        logOut: (state) => {
            state.active_account = null;
            state.login_accounts = [];
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    init,
    setActiveAccount,
    setLoginAccounts,
    switchAccount,
    logOut,
    setLoading,
} = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
