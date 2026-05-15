import * as WPElement from "@wordpress/element";
import PreviewGallery from "./index.tsx";

function renderGalleryShortcode(element) {
    const shortcodeId = element.getAttribute("data-id");

    if (shortcodeId) {
        const data = window[shortcodeId];

        if (data.type !== "gallery") {
            console.error(
                `Element with ID ${shortcodeId} is not a gallery shortcode.`
            );
            return;
        }

        const component = <PreviewGallery data={data} />;

        if (WPElement.createRoot) {
            WPElement.createRoot(element).render(component);
        } else {
            WPElement.render(component, element);
        }
    } else {
        console.error("No Gallery shortcode ID found.");
    }
}

export const checkAndRenderElements = () => {
    const galleryElements = document.querySelectorAll(".pnpnd-gallery");
    if (galleryElements.length === 0) {
        return;
    }
    galleryElements.forEach((galleryElement) => {
        if (galleryElement.hasAttribute("data-id")) {
            galleryElement.setAttribute("data-rendered", "true");
            renderGalleryShortcode(galleryElement);
        }
    });
};

checkAndRenderElements();
