import { checkAndRenderElements as embedDocuments } from "./embed-documents/widget--embed-documents";
import { checkAndRenderElements as fileBrowser } from "./file-browser/widget--file-browser";
import { checkAndRenderElements as gallery } from "./gallery/widget--gallery";

const renderModules = () => {
    embedDocuments();
    fileBrowser();
    gallery();
};

window.pnpndRenderModules = renderModules;
