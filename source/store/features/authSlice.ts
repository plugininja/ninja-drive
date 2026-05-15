import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "../../types/Types";
import { AuthState } from "~/types/states";

const initialState: AuthState = {
    loginAccounts: null,
    activeAccount: null,
    loading: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setActiveAccount: (state, action: PayloadAction<Account>) => {
            state.activeAccount = action.payload;
            state.loading = false;
        },
        setLoginAccounts: (state, action: PayloadAction<Account[]>) => {
            state.loginAccounts = action.payload;
            state.loading = false;
        },
        switchAccount: (state, action: PayloadAction<Account>) => {
            state.activeAccount = action.payload;
            const updatedAccounts =
                state.loginAccounts && state.loginAccounts?.length > 0
                    ? state.loginAccounts.map((account) => {
                          if (
                              account?.accountKey === action.payload?.accountKey
                          ) {
                              return { ...account, active: 1 };
                          }
                          return { ...account, active: 0 };
                      })
                    : null;
            state.loginAccounts = updatedAccounts as Account[];
            window.pnpnd.accounts = updatedAccounts as Account[];
            state.loading = false;
        },
        logOut: (state) => {
            state.activeAccount = null;
            state.loginAccounts = [];
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
