import { UserAccessState } from "~features/user-access/types/userAccess";
import { TRootState } from "~kernel/store/store";
import { createSlice } from "@reduxjs/toolkit";

const initialState: UserAccessState = {
    edit_data: null,
    default_data: null,
    roles: [],
    users: [],
    is_edited: false,
};

export const userAccessSlice = createSlice({
    name: "user_access",
    initialState,
    reducers: {
        userAccessInit: (state, action) => {
            state.edit_data = action.payload.edit_data;
            state.default_data = action.payload.default_data;
            state.roles = action.payload.roles || [];
            state.users = action.payload.users || [];
        },

        updateUserAccess: (state, action) => {
            if (!state.edit_data) return;

            state.edit_data = {
                ...state.edit_data,
                ...action.payload,
            };
        },

        setIsEdited: (state, action) => {
            state.is_edited = action.payload;
        },
    },
});

export const { userAccessInit, updateUserAccess, setIsEdited } =
    userAccessSlice.actions;

export const selectUserAccess = (state: TRootState) => state.user_access;

const userAccessReducer = userAccessSlice.reducer;

export default userAccessReducer;
