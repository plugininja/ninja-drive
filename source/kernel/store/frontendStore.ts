import { widgetApi } from "~features/widget-builder/api/widgetApi";
import { configureStore } from "@reduxjs/toolkit";

export const createFrontendStore = () =>
    configureStore({
        reducer: {
            [widgetApi.reducerPath]: widgetApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(widgetApi.middleware),
    });
