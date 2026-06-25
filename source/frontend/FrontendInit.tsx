import { createFrontendStore } from "~kernel/store/frontendStore";
import { CustomAlertProvider } from "~/shared/molecules/Alert";
import { useMemo } from "@wordpress/element";
import { Provider } from "react-redux";

let cachedStore: ReturnType<typeof createFrontendStore> | null = null;

const getFrontendStore = () => {
    if (!cachedStore) {
        cachedStore = createFrontendStore();
    }
    return cachedStore;
};

const FrontendInit = ({ children }: { children: React.ReactNode }) => {
    const frontEndStore = useMemo(() => getFrontendStore(), []);

    return (
        <Provider store={frontEndStore}>
            <CustomAlertProvider>{children}</CustomAlertProvider>
        </Provider>
    );
};

export default FrontendInit;
