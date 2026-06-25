import { CustomAlertProvider } from "~/shared/molecules/Alert";
import { FileSelectorBridge } from "./index.tsx";
import * as WPElement from "@wordpress/element";
import { store } from "~kernel/store/store.ts";
import { Provider } from "react-redux";

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
