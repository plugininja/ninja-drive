import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Notice = "success" | "error" | "warning";

export interface Notification {
    id: string;
    message: string;
    type: Notice;
    status: "read" | "unread";
}

const initialState = {
    notifications: [] as Notification[],
};

export const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        getNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
        },

        getNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
        },

        clearNotifications: (state) => {
            state.notifications = [];
        },

        deleteNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
        },

        statusChange: (
            state,
            action: PayloadAction<{ id: string; status: "read" | "unread" }>
        ) => {
            state.notifications = state.notifications.map((n) => {
                if (n.id === action.payload.id) {
                    n.status = action.payload.status;
                }
                return n;
            });
        },

        allRead: (state) => {
            state.notifications = state.notifications.map((n) => {
                n.status = "read";
                return n;
            });
        },
    },
});

export const {
    getNotifications,
    getNotification,
    clearNotifications,
    deleteNotification,
    statusChange,
    allRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
