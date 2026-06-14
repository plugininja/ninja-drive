import { ModuleConfig, ModuleKey } from "../types/widget.types";
import EmptyState from "~/components/molecules/EmptyState";
import PreviewEmbedDocuments from "./embed-documents";
import { noFoundIconSvg } from "~/utils/icons";
import PreviewFileBrowser from "./file-browser";
import PreviewGallery from "./gallery";
import { __ } from "@wordpress/i18n";

const componentMap: Record<ModuleKey, React.FC<{ data: ModuleConfig }>> = {
    file_browser: PreviewFileBrowser,
    gallery: PreviewGallery,
    embed_documents: PreviewEmbedDocuments,
};

const RenderShortcode = ({ data }: { data: ModuleConfig }) => {
    const SelectedComponent = componentMap[data?.type];

    return !!SelectedComponent &&
        data.data.source.files &&
        data.data.source.files?.length > 0 ? (
        <SelectedComponent data={data} />
    ) : (
        <EmptyState
            icon={<img src={noFoundIconSvg} alt="" style={{ width: "200px", height: "200px" }} />}
            title={__("No files found", "ninja-drive")}
        />
    );
};

export default RenderShortcode;
