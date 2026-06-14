import { useContextMenu } from "~/components/molecules/ContextMenu";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { useRef, useState, useEffect } from "@wordpress/element";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useGallery } from "~/hooks/useGallery";
import Card from "~/components/molecules/Card";
import { useFilesContext } from "./FilesViews";
import { formatFileSize } from "~/utils/file";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { File } from "~/types/file.types";
import { isFolder } from "~/utils/file";
import { __ } from "@wordpress/i18n";
import Thumbnail from "./Thumbnail";

const Suggested = ({
    files,
    loading,
}: {
    files: File[];
    loading?: boolean;
}) => {
    const [canView, setCanView] = useLocalStorage<boolean>(
        "suggested-files-canView",
        false,
    );
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { show } = useContextMenu();
    const { openFolder } = useFilesContext();
    const { viewFile } = useGallery(files);

    const handleFileClick = (file: File) => {
        if (isFolder(file?.extension || "")) {
            openFolder(file.file_key);
        } else {
            viewFile(file.file_key);
        }
    };

    const updateScrollState = () => {
        if (!scrollRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const amount = 250;

        if (direction === "left") {
            scrollRef.current.scrollLeft -= amount;
        } else {
            scrollRef.current.scrollLeft += amount;
        }

        setTimeout(updateScrollState, 150);
    };

    useEffect(() => {
        updateScrollState();
    }, [files]);

    return (
        <BlockStack
            gap={15}
            style={{
                userSelect: "none",
                marginBottom: "20px",
            }}
            className="pnpnd-suggested-files"
        >
            <InlineStack gap={10} align="between">
                <InlineStack gap={8} style={{ height: "25px" }}>
                    <Text size="sm">
                        {__("Suggested from my engagement", "ninja-drive")}
                    </Text>

                    <Icon
                        name={canView ? "visibility" : "visibility_off"}
                        color="primary"
                        fontSize="xl"
                        className="cursor-pointer"
                        onClick={() => setCanView(!canView)}
                    />
                </InlineStack>

                {canView && (
                    <InlineStack gap={5}>
                        <Icon
                            name="chevron_backward"
                            color="primary"
                            fontSize="2xl"
                            style={{
                                userSelect: "none",
                                cursor: canScrollLeft ? "pointer" : "default",
                                pointerEvents: canScrollLeft ? "auto" : "none",
                                opacity: canScrollLeft ? 1 : 0.5,
                            }}
                            onClick={() => canScrollLeft && scroll("left")}
                        />

                        <Icon
                            name="chevron_forward"
                            color="primary"
                            fontSize="2xl"
                            style={{
                                userSelect: "none",
                                cursor: canScrollRight ? "pointer" : "default",
                                pointerEvents: canScrollRight ? "auto" : "none",
                                opacity: canScrollRight ? 1 : 0.5,
                            }}
                            onClick={() => canScrollRight && scroll("right")}
                        />
                    </InlineStack>
                )}
            </InlineStack>

            {canView && (
                <div className="pnpnd-suggested-files__suggested">
                    <div
                        ref={scrollRef}
                        className="pnpnd-suggested-files__suggested-container"
                        onScroll={updateScrollState}
                    >
                        {loading ? (
                            <InlineStack gap={15} wrap={false}>
                                {[...Array(6)].map((_, index) => (
                                    <SkeletonLoader
                                        key={index}
                                        height="67px"
                                        className="pnpnd-suggested-files__suggested-container-file"
                                    />
                                ))}
                            </InlineStack>
                        ) : (
                            files.map((file, index) => (
                                <Card
                                    key={index}
                                    padding={10}
                                    background="white"
                                    flex
                                    gap={10}
                                    align="between"
                                    blockAlign="center"
                                    style={{
                                        minWidth: 0,
                                    }}
                                    className="pnpnd-suggested-files__suggested-container-file"
                                    onClick={() => handleFileClick(file)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        show("file-menu", e, {
                                            file: file,
                                            suggested: true,
                                        });
                                    }}
                                >
                                    <InlineStack
                                        gap={10}
                                        blockAlign="center"
                                        wrap={false}
                                        style={{
                                            minWidth: 0,
                                        }}
                                        className="pnpnd-files"
                                    >
                                        <Thumbnail
                                            style={{
                                                flexShrink: 0,
                                            }}
                                            file={file}
                                            suggested
                                        />

                                        <BlockStack
                                            gap={2}
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Text wrap={false} ellipsis>
                                                {file.name}
                                            </Text>

                                            <InlineStack gap={5}>
                                                <Text
                                                    color="gray-500"
                                                    size="xs"
                                                >
                                                    {file?.extension?.toUpperCase()}
                                                </Text>

                                                {file?.extension === "folder" &&
                                                    file?.size > 0 && (
                                                        <Text
                                                            color="gray-500"
                                                            size="xs"
                                                        >
                                                            •
                                                        </Text>
                                                    )}

                                                {file?.extension !==
                                                    "folder" && (
                                                    <Text
                                                        color="gray-500"
                                                        size="xs"
                                                    >
                                                        •
                                                    </Text>
                                                )}

                                                <Text
                                                    color="gray-500"
                                                    size="xs"
                                                >
                                                    {file?.extension ===
                                                    "folder"
                                                        ? file?.size > 0
                                                            ? file?.size
                                                            : null
                                                        : formatFileSize(
                                                              file?.size || 0,
                                                          )}
                                                </Text>
                                            </InlineStack>
                                        </BlockStack>
                                    </InlineStack>

                                    <Icon
                                        name="more_vert"
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            show("file-menu", e, {
                                                file,
                                            });
                                        }}
                                    />
                                </Card>
                            ))
                        )}
                    </div>

                    {canScrollLeft && (
                        <div className="pnpnd-suggested-files__suggested-fade pnpnd-suggested-files__suggested-fade--left" />
                    )}

                    {canScrollRight && (
                        <div className="pnpnd-suggested-files__suggested-fade pnpnd-suggested-files__suggested-fade--right" />
                    )}
                </div>
            )}
        </BlockStack>
    );
};

export default Suggested;
