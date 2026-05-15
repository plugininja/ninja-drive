import * as WPElement from "@wordpress/element";
import Main from "./Main.tsx";

function render() {
    const container = document.getElementById("pnpnd-admin");

    if (null === container) {
        return;
    }

    const component = <Main />;

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
