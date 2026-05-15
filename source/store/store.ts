import { combineReducers, configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./features/notificationSlice";
import mediaLibraryReducer from "./features/mediaLibrarySlice";
import ManageFileReducer from "./features/manageFileSlice";
import userAccessReducer from "./features/userAccessSlice";
import widgetBuilder from "./features/widgetBuilderSlice";
import settingsReducer from "./features/settingSlice";
import authReducer from "./features/authSlice";
import { baseApi } from "./api/baseApi";

const rootReducer = combineReducers({
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    manageFiles: ManageFileReducer,
    settings: settingsReducer,
    userAccess: userAccessReducer,
    mediaLibrary: mediaLibraryReducer,
    widgetBuilder: widgetBuilder,
    notifications: notificationsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

export type TRootState = ReturnType<typeof store.getState>;

export type TAppDispatch = typeof store.dispatch;
