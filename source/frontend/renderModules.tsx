import { checkAndRenderElements as embedDocuments } from "./embed-documents/widget--embed-documents";
import { checkAndRenderElements as file_browser } from "./file-browser/widget--file-browser";
import { checkAndRenderElements as gallery } from "./gallery/widget--gallery";

const renderModules = () => {
    embedDocuments();
    file_browser();
    gallery();
};

window.pnpndRenderModules = renderModules;
