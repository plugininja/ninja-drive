import { UserAccessState } from "~/types/states";
import { createSlice } from "@reduxjs/toolkit";
import { UserAccess } from "~/types/settings";
import { TRootState } from "../store";

const initialState: UserAccessState = {
    userAccessList: [],
    userAccessListDraft: [],
};

export const userAccessSlice = createSlice({
    name: "userAccess",
    initialState,
    reducers: {
        userAccessInit: (state, action) => {
            state.userAccessList = (action.payload as UserAccess[]).map(
                (item: UserAccess) => ({ ...item }),
            );
            state.userAccessListDraft = (action.payload as UserAccess[]).map(
                (item: UserAccess) => ({ ...item }),
            );
        },

        addNewUserAccess: (state, action) => {
            state.userAccessList.push({ ...action.payload });
        },

        updateUserAccess: (state, action) => {
            const { id, changes } = action.payload;

            const index = state.userAccessList.findIndex((a) => a.id === id);

            if (index !== -1) {
                state.userAccessList[index] = {
                    ...state.userAccessList[index],
                    ...changes,
                };
            }
        },

        updateUserAccessDraft: (state, action) => {
            const updatedAccess = action.payload;

            const index = state.userAccessListDraft.findIndex(
                (access) => access.id === updatedAccess.id,
            );

            if (index !== -1) {
                state.userAccessListDraft[index] = { ...updatedAccess };
            } else {
                state.userAccessListDraft.push({ ...updatedAccess });
            }
        },

        deleteUserAccess: (state, action) => {
            state.userAccessList = state.userAccessList.filter(
                (access) => access.id !== action.payload,
            );

            state.userAccessListDraft = state.userAccessListDraft.filter(
                (access) => access.id !== action.payload,
            );
        },
    },
});

export const {
    userAccessInit,
    addNewUserAccess,
    updateUserAccess,
    updateUserAccessDraft,
    deleteUserAccess,
} = userAccessSlice.actions;

export const selectUserAccess = (state: TRootState) => state.userAccess;

const userAccessReducer = userAccessSlice.reducer;

export default userAccessReducer;
