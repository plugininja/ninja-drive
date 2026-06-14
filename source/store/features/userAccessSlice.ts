import { UserAccessState } from "~/types/userAccess";
import { createSlice } from "@reduxjs/toolkit";
import { TRootState } from "../store";

const initialState: UserAccessState = {
    edit_data: null,
    default_data: null,
    roles: [],
    users: [],
    queryArgs: {
        base: "all",
        search: "",
        order_by: "created_at",
        status: "all",
        order: "desc",
        page: 1,
        per_page: 10,
    },
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

        setQueryArgs: (state, action) => {
            state.queryArgs = {
                ...state.queryArgs,
                ...action.payload,
            };
        },

        setIsEdited: (state, action) => {
            state.is_edited = action.payload;
        },
    },
});

export const { userAccessInit, updateUserAccess, setQueryArgs, setIsEdited } =
    userAccessSlice.actions;

export const selectUserAccess = (state: TRootState) => state.user_access;

const userAccessReducer = userAccessSlice.reducer;

export default userAccessReducer;
