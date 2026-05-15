import { ModuleConfig, ModuleKey } from "../types/widget.types";
import PreviewEmbedDocuments from "./embed-documents";
import PreviewFileBrowser from "./file-browser";
import PreviewGallery from "./gallery";
import EmptyState from "~/components/molecules/EmptyState";
import NoFoundIcon from "~/assets/icons/NoFoundIcon";
import { __ } from "@wordpress/i18n";

const componentMap: Record<ModuleKey, React.FC<{ data: ModuleConfig }>> = {
    "file-browser": PreviewFileBrowser,
    gallery: PreviewGallery,
    "embed-documents": PreviewEmbedDocuments,
};

const RenderShortcode = ({ data }: { data: ModuleConfig }) => {
    const SelectedComponent = componentMap[data?.type];

    return !!SelectedComponent &&
        data.data.source.files &&
        data.data.source.files?.length > 0 ? (
        <SelectedComponent data={data} />
    ) : (
        <EmptyState
            icon={<NoFoundIcon />}
            title={__("No files found", "ninja-drive")}
        />
    );
};

export default RenderShortcode;
