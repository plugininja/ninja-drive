import notificationsReducer from "~features/notifications/state/notificationSlice";
import mediaLibraryReducer from "~features/media-library/state/mediaLibrarySlice";
import fileSelectorReducer from "~features/file-browser/state/fileSelectorSlice";
import widgetBuilder from "~features/widget-builder/state/widgetBuilderSlice";
import ManageFileReducer from "~features/file-browser/state/manageFileSlice";
import userAccessReducer from "~features/user-access/state/userAccessSlice";
import dashboardReducer from "~features/dashboard/state/dashboardSlice";
import settingsReducer from "~features/settings/state/settingSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "~features/auth/state/authSlice";
import { baseApi } from "~/kernel/store/baseApi";

const rootReducer = combineReducers({
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    manage_files: ManageFileReducer,
    settings: settingsReducer,
    user_access: userAccessReducer,
    media_library: mediaLibraryReducer,
    widget_builder: widgetBuilder,
    notifications: notificationsReducer,
    file_selector: fileSelectorReducer,
    dashboard: dashboardReducer,
});

export const createAdminStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware),
    });

export const store = createAdminStore();

export type TRootState = ReturnType<typeof store.getState>;

export type TAppDispatch = typeof store.dispatch;
