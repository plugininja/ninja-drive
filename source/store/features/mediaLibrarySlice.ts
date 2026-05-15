import { MediaLibraryState } from "~/types/states";
import { createSlice } from "@reduxjs/toolkit";
import { TRootState } from "../store";

const initialState: MediaLibraryState = {
    folders: [],
    activeFolder: null,
    selectedFolders: [],
    createFolder: false,
    renameFolder: null,
    bulkSelect: false,
    loading: false,
    moveLoading: {
        folderKey: null,
        loading: false,
    },
    queryArgs: {
        orderBy: "name",
        order: "ASC",
    },
};

export const mediaLibrarySlice = createSlice({
    name: "mediaLibrary",
    initialState,
    reducers: {
        addFolders: (state, action) => {
            state.folders = action.payload;
        },

        setActiveFolder: (state, action) => {
            state.activeFolder = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setMoveLoading: (state, action) => {
            state.moveLoading = action.payload;
        },

        setCreateFolder: (state, action) => {
            state.createFolder = action.payload;
        },

        setRenameFolder: (state, action) => {
            state.renameFolder = action.payload;
        },

        setBulkSelect: (state, action) => {
            state.bulkSelect = action.payload;
            state.selectedFolders = [];
        },

        setSelectedFolders: (state, action) => {
            const folder = action.payload;

            const exists = state.selectedFolders.find(
                (f) => f.fileKey === folder.fileKey,
            );

            if (exists) {
                state.selectedFolders = state.selectedFolders.filter(
                    (f) => f.fileKey !== folder.fileKey,
                );
            } else {
                state.selectedFolders.push(folder);
            }
        },

        setQueryArgs: (state, action) => {
            state.queryArgs = {
                ...state.queryArgs,
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

export const selectMediaLibrary = (state: TRootState) => state.mediaLibrary;

const mediaLibraryReducer = mediaLibrarySlice.reducer;

export default mediaLibraryReducer;
