import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { File } from "~/types/file.types";
import {
    MBAdvanced,
    MBFilter,
    MBIState,
    MBNotifications,
    MBPermissions,
    ModuleConfig,
} from "../../types/widget.types";

const initialState: MBIState = {
    editData: null,
    defaultData: null,
    isEdited: false,
};

export const shortcodeSlice = createSlice({
    name: "widgetBuilder",
    initialState,
    reducers: {
        widgetInit: (state, action: PayloadAction<ModuleConfig>) => {
            state.editData = action.payload;
            state.defaultData = action.payload;
        },

        updateEditData: (
            state,
            action: PayloadAction<{
                key: keyof ModuleConfig;
                value: ModuleConfig[keyof ModuleConfig];
            }>,
        ) => {
            if (!state.editData) return;

            state.editData = {
                ...state.editData,
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
            if (!state.editData) return;

            state.editData.data.filter = {
                ...state.editData.data.filter,
                [action.payload.key]: action.payload.value,
            };
        },

        updateAdvanced: (
            state,
            action: PayloadAction<{
                key: keyof MBAdvanced;
                value: MBAdvanced[keyof MBAdvanced];
            }>,
        ) => {
            if (!state.editData) return;

            state.editData.data.advanced = {
                ...state.editData.data.advanced,
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
            if (!state.editData) return;
            state.editData.data.notifications = {
                ...state.editData.data.notifications,
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
            if (!state.editData) return;
            state.editData.data.permissions = {
                ...state.editData.data.permissions,
                [action.payload.key]: action.payload.value,
            };
        },

        selectFileKeys: (state, action: PayloadAction<File[]>) => {
            if (!state.editData) return;
            const fileKeys = action.payload.map((file) => {
                const isExistingFile =
                    state.editData?.data.source.fileKeys.find(
                        (f) => f.fileKey === file.fileKey,
                    );
                if (isExistingFile) return isExistingFile;
                return {
                    fileKey: file.fileKey,
                    thumbnailKey: "",
                };
            });
            state.editData.data.source.fileKeys = fileKeys;
            state.editData.data.source.selectedFiles = action.payload;
        },

        selectThumbnail: (
            state,
            action: PayloadAction<{ fileKey: string; thumbnail: File }>,
        ) => {
            if (!state.editData) return;
            const fileKeys = state.editData.data.source.fileKeys.map((file) => {
                if (file.fileKey === action.payload.fileKey)
                    file.thumbnailKey = action.payload.thumbnail.fileKey;
                return file;
            });
            state.editData.data.source.fileKeys = fileKeys;
            const updatedSelectedFiles =
                state.editData.data.source.selectedFiles?.map((file) => {
                    if (file.fileKey === action.payload.fileKey)
                        file.thumbnailData = {
                            name: action.payload.thumbnail.name,
                            fileKey: action.payload.thumbnail.fileKey,
                            extension:
                                action.payload.thumbnail.extension || "webp",
                            basename:
                                action.payload.thumbnail.additionalData
                                    ?.baseName || "",
                            thumbnail: action.payload.thumbnail.thumbnail,
                        };
                    return file;
                });
            state.editData.data.source.selectedFiles = updatedSelectedFiles;
        },

        removeThumbnail: (
            state,
            action: PayloadAction<{ fileKey: string }>,
        ) => {
            if (!state.editData) return;
            const fileKeys = state.editData.data.source.fileKeys.map((file) => {
                if (file.fileKey === action.payload.fileKey)
                    file.thumbnailKey = "";
                return file;
            });
            state.editData.data.source.fileKeys = fileKeys;
            const updatedSelectedFiles =
                state.editData.data.source.selectedFiles?.map((file) => {
                    if (file.fileKey === action.payload.fileKey)
                        file.thumbnailData = {
                            name: "",
                            fileKey: "",
                            extension: "",
                            basename: "",
                            thumbnail: "",
                        };
                    return file;
                });
            state.editData.data.source.selectedFiles = updatedSelectedFiles;
        },

        discardChanges: (state) => {
            state.editData = state.defaultData;
        },

        setIsEdited: (state, action: PayloadAction<boolean>) => {
            state.isEdited = action.payload;
        },
    },
});

export const {
    updateEditData,
    widgetInit,
    updateFilter,
    updatePermissions,
    updateAdvanced,
    updateNotification,
    setIsEdited,
    discardChanges,
    selectThumbnail,
    removeThumbnail,
    selectFileKeys,
} = shortcodeSlice.actions;

export default shortcodeSlice.reducer;
