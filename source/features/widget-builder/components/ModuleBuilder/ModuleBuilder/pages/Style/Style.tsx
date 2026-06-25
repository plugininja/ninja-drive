import EmbedDocuments from "./DisplaySettings/EmbedDocuments/EmbedDocuments";
import FileBrowser from "./DisplaySettings/FileBrowser/FileBrowser";
import Gallery from "./DisplaySettings/Gallery/Gallery";
import { useAppSelector } from "~kernel/store/hooks";
import Layout from "./components/Layout";

const Style = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const { type: widgetType, data } = edit_data || {};

    return (
        <>
            {widgetType === "file_browser" &&
                data?.style?.hasOwnProperty("file_browser") && <FileBrowser />}

            {widgetType === "gallery" &&
                data?.style?.hasOwnProperty("gallery") && <Gallery />}

            {widgetType === "embed_documents" &&
                data?.style?.hasOwnProperty("embed_documents") && (
                    <EmbedDocuments />
                )}

            <Layout />
        </>
    );
};

export default Style;
