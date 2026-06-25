import { File } from "~features/file-browser/types/file.types";
import { TRootState } from "~kernel/store/store";
import { createSlice } from "@reduxjs/toolkit";

export interface DashboardState {
    image_cache: {
        key: string;
        count: string | number;
        size: string | number;
    }[];
    cached_files: {
        files: File[];
    };
    shared_files: {
        files: File[];
    };
    downloaded_files: {
        files: File[];
    };
}

const initialState: DashboardState = {
    image_cache: [],
    cached_files: {
        files: [],
    },
    shared_files: {
        files: [],
    },
    downloaded_files: {
        files: [],
    },
};

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        dashboardInit: (state, action) => {
            state.image_cache = action.payload.image_cache;
            state.cached_files = action.payload.cached_files;
            state.shared_files = action.payload.shared_files;
            state.downloaded_files = action.payload.downloaded_files;
        },

        setCache: (state, action) => {
            const { image_cache, cached_files } = action.payload;

            if (image_cache) state.image_cache = image_cache;
            if (cached_files) state.cached_files = cached_files;
        },
    },
});

export const { dashboardInit, setCache } = dashboardSlice.actions;

export const selectDashboard = (state: TRootState) => state.dashboard;

const dashboardReducer = dashboardSlice.reducer;

export default dashboardReducer;
