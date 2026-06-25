import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuKey } from "~kernel/types/Types";

export interface FileSelectorState {
    folderKey?: string;
    menuKey: MenuKey;
}

const initialState: FileSelectorState = {
    menuKey: "my-drive",
    folderKey: "",
};

const fileSelectorSlice = createSlice({
    name: "fileSelector",
    initialState,
    reducers: {
        setMenuKey: (
            state,
            action: PayloadAction<FileSelectorState["menuKey"]>,
        ) => {
            state.menuKey = action.payload;
        },

        setFolderKey: (state, action: PayloadAction<string>) => {
            state.folderKey = action.payload;
        },
    },
});

export const { setMenuKey, setFolderKey } = fileSelectorSlice.actions;

export default fileSelectorSlice.reducer;
