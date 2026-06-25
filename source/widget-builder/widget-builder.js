import { CustomAlertProvider } from "~/shared/molecules/Alert/Alert.tsx";
import { ModuleBuilderBridge } from "./index.tsx";
import * as WPElement from "@wordpress/element";

function render() {
    const container = document.createElement("div");
    container.id = "pnpnd-widget-builder-root";
    document.body.appendChild(container);

    if (null === container) {
        return;
    }

    const component = (
        <CustomAlertProvider>
            <ModuleBuilderBridge />
        </CustomAlertProvider>
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
