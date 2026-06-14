import { MediaLibraryState } from "~/types/states";
import { createSlice } from "@reduxjs/toolkit";
import { TRootState } from "../store";

const initialState: MediaLibraryState = {
    folders: [],
    active_folder: null,
    selected_folders: [],
    create_folder: false,
    rename_folder: null,
    bulk_select: false,
    loading: false,
    move_loading: {
        folder_key: null,
        loading: false,
    },
    query_args: {
        order_by: "name",
        order: "ASC",
    },
};

export const mediaLibrarySlice = createSlice({
    name: "media_library",
    initialState,
    reducers: {
        addFolders: (state, action) => {
            state.folders = action.payload;
        },

        setActiveFolder: (state, action) => {
            state.active_folder = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setMoveLoading: (state, action) => {
            state.move_loading = action.payload;
        },

        setCreateFolder: (state, action) => {
            state.create_folder = action.payload;
        },

        setRenameFolder: (state, action) => {
            state.rename_folder = action.payload;
        },

        setBulkSelect: (state, action) => {
            state.bulk_select = action.payload;
            state.selected_folders = [];
        },

        setSelectedFolders: (state, action) => {
            const folder = action.payload;

            const exists = state.selected_folders.find(
                (f) => f.file_key === folder.file_key,
            );

            if (exists) {
                state.selected_folders = state.selected_folders.filter(
                    (f) => f.file_key !== folder.file_key,
                );
            } else {
                state.selected_folders.push(folder);
            }
        },

        setQueryArgs: (state, action) => {
            state.query_args = {
                ...state.query_args,
                ...action.payload,
            };
        },
    },
});

export const {
    addFolders,
    setActiveFolder,
    setLoading,
    setMoveLoading,
    setCreateFolder,
    setRenameFolder,
    setBulkSelect,
    setSelectedFolders,
    setQueryArgs,
} = mediaLibrarySlice.actions;

export const selectMediaLibrary = (state: TRootState) => state.media_library;

const mediaLibraryReducer = mediaLibrarySlice.reducer;

export default mediaLibraryReducer;
