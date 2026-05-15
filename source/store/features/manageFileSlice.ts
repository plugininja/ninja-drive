import { Breadcrumb, File, Order, OrderBy } from "../../types/Types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IOpenFolder {
    activeFolder: File;
    chunkFiles: File[];
    breadcrumbs: Breadcrumb[];
}

export interface ManageFileState {
    files: File[];
    selectedFiles: File[];
    breadcrumbs: Breadcrumb[];
    activeFolder: File | null;
    isFileSelecting?: boolean;
    fileLoading: boolean;
    hasMore: boolean;
    order: Order;
    orderBy: OrderBy;
    page: number;
    multiSelect?: boolean;
    availableTypes?: (
        | "all"
        | "image"
        | "video"
        | "audio"
        | "document"
        | "folder"
    )[];
}

const initialState: ManageFileState = {
    breadcrumbs: [],
    activeFolder: null,
    files: [],
    selectedFiles: [],
    isFileSelecting: false,
    fileLoading: true,
    hasMore: true,
    order: "ASC",
    orderBy: "name",
    page: 2,
    multiSelect: true,
    availableTypes: ["all"],
};

export const manageFileSlice = createSlice({
    name: "manageFiles",
    initialState,
    reducers: {
        setActiveFolder: (state, action: PayloadAction<File>) => {
            state.activeFolder = action.payload;
        },

        setFiles: (state, action: PayloadAction<File[]>) => {
            state.files = action.payload;
        },

        prependFiles: (
            state,
            action: PayloadAction<{ files: File[]; slice?: number }>
        ) => {
            const { files, slice = 0 } = action.payload;
            state.files = [...files, ...state.files.slice(slice)];
        },

        appendFiles: (
            state,
            action: PayloadAction<{ files: File[]; slice?: number }>
        ) => {
            const { files, slice = 0 } = action.payload;
            state.files = [...state.files.slice(slice), ...files];
        },

        openFolder: (state, action: PayloadAction<IOpenFolder>) => {
            state.breadcrumbs = action.payload.breadcrumbs;
            state.activeFolder = action.payload.activeFolder;
            state.files = action.payload.chunkFiles;
            state.fileLoading = false;
        },

        addFileAfterUpload: (state, action: PayloadAction<File>) => {
            state.files = [action.payload, ...state.files];
        },

        setIsFileSelecting: (state, action: PayloadAction<boolean>) => {
            state.isFileSelecting = action.payload;
        },

        setFileLoading: (state, action: PayloadAction<boolean>) => {
            state.fileLoading = action.payload;
        },

        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },

        setOrder: (state, action: PayloadAction<Order>) => {
            state.order = action.payload;
        },

        setOrderBy: (state, action: PayloadAction<OrderBy>) => {
            state.orderBy = action.payload;
        },

        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },

        selectFile: (state, action: PayloadAction<string | string[]>) => {
            if (action.payload instanceof Array) {
                const files = state.files.filter((file) =>
                    action.payload.includes(file.key)
                );
                const fromSelected = state.selectedFiles.filter((file) =>
                    action.payload.includes(file.key)
                );
                const allFiles = [...fromSelected, ...files];

                const uniqueFileMap = new Map<string, (typeof allFiles)[0]>();
                allFiles.forEach((file) => {
                    uniqueFileMap.set(file.key, file);
                });

                state.selectedFiles = Array.from(uniqueFileMap.values());
            } else {
                if (
                    state.selectedFiles.find(
                        (file) => file.key === action.payload
                    )
                ) {
                    state.selectedFiles = state.selectedFiles.filter(
                        (file) => file.key !== action.payload
                    );
                } else {
                    const file = state.files.find(
                        (file) => file.key === action.payload
                    );
                    if (!file) return;
                    state.selectedFiles.push(file);
                }
            }
        },

        setSelectedFiles: (state, action: PayloadAction<File[]>) => {
            state.selectedFiles = action.payload;
        },
    },
});

export const {
    setFileLoading,
    addFileAfterUpload,
    openFolder,
    setActiveFolder,
    prependFiles,
    appendFiles,
    setFiles,
    setIsFileSelecting,
    setHasMore,
    setOrder,
    setOrderBy,
    setPage,
    setSelectedFiles,
    selectFile,
} = manageFileSlice.actions;

export default manageFileSlice.reducer;
