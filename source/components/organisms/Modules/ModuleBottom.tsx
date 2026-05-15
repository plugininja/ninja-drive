import InlineStack from "~/components/molecules/InlineStack";
import Button from "~/components/atoms/Button";
import Pagination from "../Pagination";
import { __ } from "@wordpress/i18n";

const ModuleBottom = ({
    fileLoadingType,
    hasMore,
    loadMore,
    totalPages,
    currentPage,
    isLoading,
    loadMoreFileRef,
}: {
    fileLoadingType: "load_more" | "infinite_scroll" | "pagination";
    hasMore: boolean;
    loadMore: (pageOverride?: number) => void;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    loadMoreFileRef: React.RefObject<HTMLDivElement>;
}) => {
    const isLessMore =
        fileLoadingType === "load_more" &&
        !hasMore &&
        !isLoading &&
        currentPage > 1;

    return (
        <div className="pnpnd-top-level-wrapper">
            {fileLoadingType === "infinite_scroll" && hasMore && !isLoading && (
                <div ref={loadMoreFileRef}></div>
            )}

            {fileLoadingType === "load_more" && hasMore && (
                <InlineStack
                    align="center"
                    blockAlign="center"
                    margin={"10px 0px 5px 0px"}
                >
                    {hasMore && (
                        <Button
                            variant="primary"
                            startIcon="sync"
                            onClick={() => loadMore()}
                            loading={isLoading}
                        >
                            {__("Load More", "ninja-drive")}
                        </Button>
                    )}

                    {isLessMore && (
                        <Button
                            variant="primary"
                            startIcon="keyboard_double_arrow_up"
                            onClick={() => loadMore(1)}
                            loading={isLoading}
                        >
                            {__(" Back to Top", "ninja-drive")}
                        </Button>
                    )}
                </InlineStack>
            )}

            {fileLoadingType === "pagination" && totalPages > 1 && (
                <Pagination
                    variant="small"
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={(p) => loadMore(p)}
                />
            )}
        </div>
    );
};

export default ModuleBottom;
