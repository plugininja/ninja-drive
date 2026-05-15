import { ModuleConfig } from "~/types/widget.types";
import EmbedDocuments from "./EmbedDocuments";
import { useModuleFiles } from "~/hooks/useModuleFiles";
import ModuleBottom from "../ModuleBottom";
import EmptyState from "~/components/molecules/EmptyState";
import NoFoundIcon from "~/assets/icons/NoFoundIcon";
import { __ } from "@wordpress/i18n";

const EmbedDocumentsWrapper = ({ data }: { data: ModuleConfig }) => {
    const {
        files,
        hasMore,
        loadingMore,
        loadMore,
        totalPages,
        loading,
        loadMoreRef,
        queryArgs,
    } = useModuleFiles(data);

    const { loadingType } = data?.data?.advanced.files || {};
    if (!files.length && !loading)
        return (
            <EmptyState
                icon={<NoFoundIcon />}
                title={__("No files found", "ninja-drive")}
            />
        );

    return (
        <>
            <EmbedDocuments data={data} files={files} />

            <ModuleBottom
                fileLoadingType={loadingType}
                hasMore={hasMore}
                loadMore={loadMore}
                totalPages={totalPages}
                currentPage={queryArgs?.page || 1}
                isLoading={loading || loadingMore}
                loadMoreFileRef={loadMoreRef}
            />
        </>
    );
};

export default EmbedDocumentsWrapper;
