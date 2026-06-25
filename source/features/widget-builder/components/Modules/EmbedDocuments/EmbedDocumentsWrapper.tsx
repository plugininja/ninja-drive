import { useModuleFiles } from "~features/widget-builder/hooks/useModuleFiles";
import { ModuleConfig } from "~features/widget-builder/types/widget.types";
import { noFoundIconSvg } from "~kernel/utils/icons";
import EmbedDocuments from "./EmbedDocuments";
import { EmptyState } from "~/ui/molecules";
import ModuleBottom from "../ModuleBottom";
import { __ } from "@wordpress/i18n";

const EmbedDocumentsWrapper = ({ data }: { data: ModuleConfig }) => {
    const {
        files,
        has_more,
        loadingMore,
        loadMore,
        total_pages,
        loading,
        loadMoreRef,
        queryArgs,
    } = useModuleFiles(data);

    const { loading_type } = data?.data?.style?.files || {};

    if (!files.length && !loading)
        return (
            <EmptyState
                icon={
                    <img
                        src={noFoundIconSvg}
                        alt=""
                        style={{ width: "200px", height: "200px" }}
                    />
                }
                title={__("No files found", "ninja-drive")}
            />
        );

    return (
        <>
            <EmbedDocuments data={data} files={files} />

            <ModuleBottom
                fileLoadingType={loading_type}
                has_more={has_more}
                loadMore={loadMore}
                total_pages={total_pages}
                current_page={queryArgs?.page || 1}
                isLoading={loading || loadingMore}
                loadMoreFileRef={loadMoreRef}
            />
        </>
    );
};

export default EmbedDocumentsWrapper;
