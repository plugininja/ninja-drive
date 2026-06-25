import { File } from "~features/file-browser/types/file.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    MBFilter,
    MBIState,
    MBNotifications,
    MBPermissions,
    MBStyle,
    ModuleConfig,
} from "~features/widget-builder/types/widget.types";

const initialState: MBIState = {
    edit_data: null,
    default_data: null,
    is_edited: false,
};

export const widgetBuilderSlice = createSlice({
    name: "widgetBuilder",
    initialState,
    reducers: {
        widgetInit: (state, action: PayloadAction<ModuleConfig>) => {
            state.edit_data = action.payload;
            state.default_data = action.payload;
        },

        updateEditData: (
            state,
            action: PayloadAction<{
                key: keyof ModuleConfig;
                value: ModuleConfig[keyof ModuleConfig];
            }>,
        ) => {
            if (!state.edit_data) return;

            state.edit_data = {
                ...state.edit_data,
                [action.payload.key]: action.payload.value,
            };
        },

        updateConfiguration: (
            state,
            action: PayloadAction<{
                key: keyof ModuleConfig["data"]["configuration"];
                value: ModuleConfig["data"]["configuration"][keyof ModuleConfig["data"]["configuration"]];
            }>,
        ) => {
            if (!state.edit_data) return;
            state.edit_data.data.configuration = {
                ...state.edit_data.data.configuration,
                [action.payload.key]: action.payload.value,
            };
        },

        updateFilter: (
            state,
            action: PayloadAction<{
                key: keyof MBFilter;
                value: MBFilter[keyof MBFilter];
            }>,
        ) => {
            if (!state.edit_data) return;

            state.edit_data.data.configuration.filter = {
                ...state.edit_data.data.configuration.filter,
                [action.payload.key]: action.payload.value,
            };
        },

        updateStyle: (
            state,
            action: PayloadAction<{
                key: keyof MBStyle;
                value: MBStyle[keyof MBStyle];
            }>,
        ) => {
            if (!state.edit_data) return;
            state.edit_data.data.style = {
                ...state.edit_data.data.style,
                [action.payload.key]: action.payload.value,
            };
        },

        updateNotification: (
            state,
            action: PayloadAction<{
                key: keyof MBNotifications;
                value: MBNotifications[keyof MBNotifications];
            }>,
        ) => {
            if (!state.edit_data) return;
            state.edit_data.data.notifications = {
                ...state.edit_data.data.notifications,
                [action.payload.key]: action.payload.value,
            };
        },

        updatePermissions: (
            state,
            action: PayloadAction<{
                key: keyof MBPermissions;
                value: MBPermissions[keyof MBPermissions];
            }>,
        ) => {
            if (!state.edit_data) return;
            state.edit_data.data.permissions = {
                ...state.edit_data.data.permissions,
                [action.payload.key]: action.payload.value,
            };
        },

        selectFileKeys: (state, action: PayloadAction<File[]>) => {
            if (!state.edit_data) return;
            const file_keys = action.payload.map((file) => {
                const isExistingFile =
                    state.edit_data?.data.source.file_keys.find(
                        (f) => f.file_key === file.file_key,
                    );
                if (isExistingFile) return isExistingFile;
                return {
                    file_key: file.file_key,
                    thumbnail_key: "",
                };
            });
            state.edit_data.data.source.file_keys = file_keys;
            state.edit_data.data.source.selected_files = action.payload;
        },

        selectThumbnail: (
            state,
            action: PayloadAction<{ file_key: string; thumbnail: File }>,
        ) => {
            if (!state.edit_data) return;
            const file_keys = state.edit_data.data.source.file_keys.map(
                (file) => {
                    if (file.file_key === action.payload.file_key)
                        file.thumbnail_key = action.payload.thumbnail.file_key;
                    return file;
                },
            );
            state.edit_data.data.source.file_keys = file_keys;
            const updatedSelectedFiles =
                state.edit_data.data.source.selected_files?.map((file) => {
                    if (file.file_key === action.payload.file_key)
                        file.thumbnail_data = {
                            name: action.payload.thumbnail.name,
                            file_key: action.payload.thumbnail.file_key,
                            extension:
                                action.payload.thumbnail.extension || "webp",
                            base_name:
                                action.payload.thumbnail.additional_data
                                    ?.base_name || "",
                            thumbnail: action.payload.thumbnail.thumbnail,
                        };
                    return file;
                });
            state.edit_data.data.source.selected_files = updatedSelectedFiles;
        },

        removeThumbnail: (
            state,
            action: PayloadAction<{ file_key: string }>,
        ) => {
            if (!state.edit_data) return;
            const file_keys = state.edit_data.data.source.file_keys.map(
                (file) => {
                    if (file.file_key === action.payload.file_key)
                        file.thumbnail_key = "";
                    return file;
                },
            );
            state.edit_data.data.source.file_keys = file_keys;
            const updatedSelectedFiles =
                state.edit_data.data.source.selected_files?.map((file) => {
                    if (file.file_key === action.payload.file_key)
                        file.thumbnail_data = {
                            name: "",
                            file_key: "",
                            extension: "",
                            base_name: "",
                            thumbnail: "",
                        };
                    return file;
                });
            state.edit_data.data.source.selected_files = updatedSelectedFiles;
        },

        discardChanges: (state) => {
            state.edit_data = state.default_data;
        },

        setIsEdited: (state, action: PayloadAction<boolean>) => {
            state.is_edited = action.payload;
        },
    },
});

export const {
    updateEditData,
    widgetInit,
    updateConfiguration,
    updateFilter,
    updateStyle,
    updatePermissions,
    updateNotification,
    setIsEdited,
    discardChanges,
    selectThumbnail,
    removeThumbnail,
    selectFileKeys,
} = widgetBuilderSlice.actions;

export default widgetBuilderSlice.reducer;
