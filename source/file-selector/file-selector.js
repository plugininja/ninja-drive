import * as WPElement from "@wordpress/element";
import { FileSelectorBridge } from "./index.tsx";
import { CustomAlertProvider } from "~/components/molecules/Alert";
import { Provider } from "react-redux";
import { store } from "~/store/store.ts";

function render() {
    const container = document.createElement("div");
    container.id = "pnpnd-file-selector-root";
    document.body.appendChild(container);

    if (null === container) {
        return;
    }

    const component = (
        <Provider store={store}>
            <CustomAlertProvider>
                <FileSelectorBridge />
            </CustomAlertProvider>
        </Provider>
    );

    if (WPElement.createRoot) {
        WPElement.createRoot(container).render(component);
    } else {
        WPElement.render(component, container);
    }

    if (import.meta.hot) {
        import.meta.hot.accept();
    }
}

render();
