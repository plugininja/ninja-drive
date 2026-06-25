import { Pagination } from "~/ui/molecules/Pagination";
import { InlineStack } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";

const ModuleBottom = ({
    fileLoadingType,
    has_more,
    loadMore,
    total_pages,
    current_page,
    isLoading,
    loadMoreFileRef,
}: {
    fileLoadingType: "load_more" | "infinite_scroll" | "pagination";
    has_more: boolean;
    loadMore: (pageOverride?: number) => void;
    total_pages: number;
    current_page: number;
    isLoading: boolean;
    loadMoreFileRef: React.RefObject<HTMLDivElement>;
}) => {
    const isLessMore =
        fileLoadingType === "load_more" &&
        !has_more &&
        !isLoading &&
        current_page > 1;

    return (
        <div
            style={{
                borderRadius: "0px 0px 10px 10px",
            }}
        >
            {fileLoadingType === "infinite_scroll" &&
                has_more &&
                !isLoading && <div ref={loadMoreFileRef}></div>}

            {fileLoadingType === "load_more" && has_more && (
                <InlineStack
                    align="center"
                    blockAlign="center"
                    margin={"10px 0px 5px 0px"}
                >
                    {has_more && (
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

            {fileLoadingType === "pagination" && total_pages > 1 && (
                <Pagination
                    variant="small"
                    style={{ margin: "10px 0px 0px 0px" }}
                    total_pages={total_pages}
                    current_page={current_page}
                    onPageChange={(p) => loadMore(p)}
                />
            )}
        </div>
    );
};

export default ModuleBottom;
