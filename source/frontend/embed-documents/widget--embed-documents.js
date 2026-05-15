import * as WPElement from "@wordpress/element";
import PreviewEmbedDocuments from "./index.tsx";

function renderShortcode(element) {
    const shortcodeId = element.getAttribute("data-id");

    if (shortcodeId) {
        const data = window[shortcodeId];

        if (data.type !== "embed-documents") {
            console.error(
                `Element with ID ${shortcodeId} is not a File List shortcode.`
            );
            return;
        }

        const component = <PreviewEmbedDocuments data={data} />;

        if (WPElement.createRoot) {
            WPElement.createRoot(element).render(component);
        } else {
            WPElement.render(component, element);
        }
    } else {
        console.error("No Embed Documents shortcode ID found.");
    }
}

export const checkAndRenderElements = () => {
    const elements = document.querySelectorAll(".pnpnd-embed-documents");
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
