import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SettingState } from "~/types/states";
import {
    Accounts,
    Advanced,
    Appearance,
    Integrations,
    SettingsData,
    Synchronization,
    Tools,
    UserAccess,
} from "~/types/settings";

const initialState: SettingState = {
    data: null,
    draft: null,
    defaultData: null,
    isDirty: false,
};

export const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        settingsInit: (state, action: PayloadAction<SettingsData>) => {
            state.data = action.payload;
            state.draft = action.payload;
        },

        defaultSettingsInit: (state, action: PayloadAction<SettingsData>) => {
            state.defaultData = action.payload;
        },

        updateData: (state, action: PayloadAction<SettingsData>) => {
            state.data = action.payload;
        },

        updateAccounts: (
            state,
            action: PayloadAction<{
                key: keyof Accounts;
                value: Accounts[keyof Accounts];
            }>,
        ) => {
            if (!state.data) return;
            state.data.accounts = {
                ...state.data.accounts,
                [action.payload.key]: action.payload.value,
            };
        },

        updateAdvanced: (
            state,
            action: PayloadAction<{
                key: keyof Advanced;
                value: Advanced[keyof Advanced];
            }>,
        ) => {
            if (!state.data) return;
            state.data.advanced = {
                ...state.data.advanced,
                [action.payload.key]: action.payload.value,
            };
        },

        updateAppearance: (
            state,
            action: PayloadAction<{
                key: keyof Appearance;
                value: Appearance[keyof Appearance];
            }>,
        ) => {
            if (!state.data) return;
            state.data.appearance = {
                ...state.data.appearance,
                [action.payload.key]: action.payload.value,
            };
        },

        updateUserAccess: (state, action: PayloadAction<UserAccess[]>) => {
            if (!state.data) return;
            state.data.userAccess = action.payload;
        },

        updateIntegrations: (
            state,
            action: PayloadAction<{
                key: keyof Integrations;
                value: Integrations[keyof Integrations];
            }>,
        ) => {
            if (!state.data) return;
            state.data.integrations = {
                ...state.data.integrations,
                [action.payload.key]: action.payload.value,
            };
        },

        updateSynchronization: (
            state,
            action: PayloadAction<{
                key: keyof Synchronization;
                value: Synchronization[keyof Synchronization];
            }>,
        ) => {
            if (!state.data) return;
            state.data.synchronization = {
                ...state.data.synchronization,
                [action.payload.key]: action.payload.value,
            };
        },

        updateTools: (
            state,
            action: PayloadAction<{
                key: keyof Tools;
                value: Tools[keyof Tools];
            }>,
        ) => {
            if (!state.data) return;
            state.data.tools = {
                ...state.data.tools,
                [action.payload.key]: action.payload.value,
            };
        },

        updateIsDirty: (state, action: PayloadAction<boolean>) => {
            state.isDirty = action.payload;
        },
    },
});

export const {
    settingsInit,
    defaultSettingsInit,
    updateData,
    updateAccounts,
    updateAdvanced,
    updateAppearance,
    updateUserAccess,
    updateIntegrations,
    updateSynchronization,
    updateTools,
    updateIsDirty,
} = settingSlice.actions;

export const selectSettings = (state: { settings: SettingState }) =>
    state.settings;

export default settingSlice.reducer;
