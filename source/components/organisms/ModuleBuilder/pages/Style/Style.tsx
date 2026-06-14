import EmbedDocuments from "./DisplaySettings/EmbedDocuments/EmbedDocuments";
import SliderCarousel from "./DisplaySettings/SliderCarousel/SliderCarousel";
import FileUploader from "./DisplaySettings/FileUploader/FileUploader";
import FileBrowser from "./DisplaySettings/FileBrowser/FileBrowser";
import MediaPlayer from "./DisplaySettings/MediaPlayer/MediaPlayer";
import SearchBox from "./DisplaySettings/SearchBox/SearchBox";
import FileList from "./DisplaySettings/FileList/FileList";
import Gallery from "./DisplaySettings/Gallery/Gallery";
import { useAppSelector } from "~/store/hooks";
import Layout from "./components/Layout";

const Style = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const { type: widgetType, data } = edit_data || {};

    return (
        <>
            {widgetType === "file_browser" &&
                data?.style?.hasOwnProperty("file_browser") && <FileBrowser />}

            {widgetType === "file_uploader" &&
                data?.style?.hasOwnProperty("file_uploader") && (
                    <FileUploader />
                )}

            {widgetType === "media_player" &&
                data?.style?.hasOwnProperty("media_player") && <MediaPlayer />}

            {widgetType === "gallery" &&
                data?.style?.hasOwnProperty("gallery") && <Gallery />}

            {widgetType === "slider_carousel" &&
                data?.style?.hasOwnProperty("slider_carousel") && (
                    <SliderCarousel />
                )}

            {widgetType === "embed_documents" &&
                data?.style?.hasOwnProperty("embed_documents") && (
                    <EmbedDocuments />
                )}

            {widgetType === "search_box" &&
                data?.style?.hasOwnProperty("search_box") && <SearchBox />}

            {widgetType === "file_list" &&
                data?.style?.hasOwnProperty("file_list") && <FileList />}

            <Layout />
        </>
    );
};

export default Style;
