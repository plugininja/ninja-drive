import { CustomAlertProvider } from "~/components/molecules/Alert";
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
                    </MainRoute>
                </CustomAlertProvider>
            </Provider>
        </HashRouter>
    );
};

export default Main;
