import { CustomAlertProvider } from "~/components/molecules/Alert";
import { widgetApi } from "../store/api/widgetApi";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";

const createFrontendStore = () =>
    configureStore({
        reducer: {
            [widgetApi.reducerPath]: widgetApi.reducer,
        },

        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(widgetApi.middleware),
    });

const FrontendInit = ({ children }: { children: ReactNode }) => {
    const frontEndStore = createFrontendStore();

    return (
        <Provider store={frontEndStore}>
            <CustomAlertProvider>{children}</CustomAlertProvider>
        </Provider>
    );
};

export default FrontendInit;
