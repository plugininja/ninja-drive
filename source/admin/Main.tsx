import { CustomAlertProvider } from "~/shared/molecules/Alert";
import Onboarding from "~features/onboarding/Onboarding";
import { toBoolean } from "~kernel/utils/functions";
import MainRoute from "~/kernel/routes/MainRoute";
import { HashRouter } from "react-router-dom";
import { store } from "~/kernel/store";
import { Provider } from "react-redux";
import App from "./App";

const Main = () => {
    return (
        <HashRouter>
            <Provider store={store}>
                <CustomAlertProvider>
                    <MainRoute>
                        <App />

                        {toBoolean(pnpnd?.onboarding) &&
                            window?.location?.hash.includes(
                                "widget-builder",
                            ) && <Onboarding />}
                    </MainRoute>
                </CustomAlertProvider>
            </Provider>
        </HashRouter>
    );
};

export default Main;
