import * as WPElement from "@wordpress/element";
import PreviewFileBrowser from "./index.tsx";

function renderShortcode(element) {
    const shortcodeId = element.getAttribute("data-id");

    if (shortcodeId) {
        const data = window[shortcodeId];

        if (data?.type !== "file_browser") {
            console.error(
                `Element with ID ${shortcodeId} is not a File Browser shortcode.`,
            );
            return;
        }

        const component = <PreviewFileBrowser data={data} />;

        if (WPElement.createRoot) {
            WPElement.createRoot(element).render(component);
        } else {
            WPElement.render(component, element);
        }
    } else {
        console.error("No File Browser shortcode ID found.");
    }
}

export const checkAndRenderElements = () => {
    const elements = document.querySelectorAll(".pnpnd-file_browser");
    if (elements.length === 0) {
        return;
    }

    elements.forEach((element) => {
        if (element.hasAttribute("data-id")) {
            element.setAttribute("data-rendered", "true");
            renderShortcode(element);
        }
    });
};

checkAndRenderElements();
