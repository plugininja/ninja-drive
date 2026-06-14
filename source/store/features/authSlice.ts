import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "../../types/Types";
import { AuthState } from "~/types/states";

const initialState: AuthState = {
    login_accounts: null,
    active_account: null,
    loading: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setActiveAccount: (state, action: PayloadAction<Account>) => {
            state.active_account = action.payload;
            state.loading = false;
        },
        setLoginAccounts: (state, action: PayloadAction<Account[]>) => {
            state.login_accounts = action.payload;
            state.loading = false;
        },
        switchAccount: (state, action: PayloadAction<Account>) => {
            state.active_account = action.payload;
            const updatedAccounts =
                state.login_accounts && state.login_accounts?.length > 0
                    ? state.login_accounts.map((account) => {
                          if (
                              account?.account_key ===
                              action.payload?.account_key
                          ) {
                              return { ...account, active: 1 };
                          }
                          return { ...account, active: 0 };
                      })
                    : null;
            state.login_accounts = updatedAccounts as Account[];
            window.pnpnd.accounts = updatedAccounts as Account[];
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
    setActiveAccount,
    setLoginAccounts,
    switchAccount,
    logOut,
    setLoading,
} = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
