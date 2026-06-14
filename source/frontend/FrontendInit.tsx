import { CustomAlertProvider } from "~/components/molecules/Alert";
import { useMemo, type ReactNode } from "@wordpress/element";
import { widgetApi } from "../store/api/widgetApi";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

const createFrontendStore = () =>
    configureStore({
        reducer: {
            [widgetApi.reducerPath]: widgetApi.reducer,
        },

        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(widgetApi.middleware),
    });

let cachedStore: ReturnType<typeof createFrontendStore> | null = null;

const getFrontendStore = () => {
    if (!cachedStore) {
        cachedStore = createFrontendStore();
    }
    return cachedStore;
};

const FrontendInit = ({ children }: { children: ReactNode }) => {
    const frontEndStore = useMemo(() => getFrontendStore(), []);

    return (
        <Provider store={frontEndStore}>
            <CustomAlertProvider>{children}</CustomAlertProvider>
        </Provider>
    );
};

export default FrontendInit;
