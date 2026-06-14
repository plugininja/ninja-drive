import { CustomAlertProvider } from "~/components/molecules/Alert";
import Onboarding from "~/components/onboarding/Onboarding";
import { toBoolean } from "~/utils/functions";
import { HashRouter } from "react-router-dom";
import MainRoute from "../Routes/MainRoute";
import { Provider } from "react-redux";
import { store } from "../store/store";
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
