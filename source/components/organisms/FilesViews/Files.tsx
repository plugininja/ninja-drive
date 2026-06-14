import { formatFileSize, isFolder, isShortcut } from "~/utils/file";
import { useContextMenu } from "~/components/molecules/ContextMenu";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { FilesViewsProps, useFilesContext } from "./FilesViews";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import EmptyState from "~/components/molecules/EmptyState";
import GridStack from "~/components/molecules/GridStack";
import { useEffect, useRef } from "@wordpress/element";
import { useDragSelect } from "~/hooks/useDragSelect";
import { noFoundIconSvg } from "~/utils/icons";
import Checkbox from "~/components/atoms/Checkbox";
import Card from "~/components/molecules/Card";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { timeAgo } from "~/utils/functions";
import { __ } from "@wordpress/i18n";
import Thumbnail from "./Thumbnail";
import clsx from "clsx";

export const DEFAULT_CONFIG = {
    PER_PAGE_LIMIT: 24,
    CLEANUP_INTERVAL: 5 * 60 * 1000,
} as const;

const Files = ({
    style = {
        marginTop: 20,
    },
    emptyStateInner,
    notFoundTitle = __("No files found", "ninja-drive"),
}: {
    style?: React.CSSProperties;
    emptyStateInner?: React.ReactNode;
    notFoundTitle?: string;
}) => {
    const filesProps = useFilesContext();
    const {
        files,
        selected_files,
        activeFile,
        isFileSelecting,
        layout,
        filesStatus,
        setSelectedFiles,
        setActiveFile,
        openFolder,
        activeFolder,
        addSuggestedFile,
        list_view_table_head,
    } = filesProps;

    const selectContainerRef = useRef<HTMLDivElement | null>(null);

    const { selectedItems } = useDragSelect(
        selectContainerRef,
        isFileSelecting,
    );

    useEffect(() => {
        if (selectedItems.length > 0 && isFileSelecting) {
            const newFiles = files.filter((file) =>
                selectedItems.includes(file.file_key),
            );
            setSelectedFiles(newFiles);
        }
    }, [selectedItems, isFileSelecting]);

    if ((!files || files.length === 0) && !filesStatus.loading) {
        return (
            <EmptyState icon={<img src={noFoundIconSvg} alt="" style={{ width: "200px", height: "200px" }} />} title={notFoundTitle}>
                {emptyStateInner}
            </EmptyState>
        );
    }

    return (
        <BlockStack
            ref={selectContainerRef}
            style={style}
            className="pnpnd-files"
        >
            {layout === "list" ? (
                <ListView {...filesProps} />
            ) : (
                <GridView {...filesProps} />
            )}
        </BlockStack>
    );
};

export default Files;

const ListView = ({
    files,
    selected_files,
    activeFile,
    isFileSelecting,
    onFileClick,
    onFileDoubleClick,
    filesStatus,
    setSelectedFiles,
    addSuggestedFile,
    list_view_table_head = {
        name: __("NAME", "ninja-drive"),
        size: __("SIZE", "ninja-drive"),
        type: __("TYPE", "ninja-drive"),
        updated: __("DATE", "ninja-drive"),
        action: __("ACTIONS", "ninja-drive"),
    },
}: FilesViewsProps) => {
    const { show } = useContextMenu();

    const loader = (
        <>
            {Array.from({ length: 14 }).map((_, index) => (
                <SkeletonLoader
                    key={index}
                    height="55px"
                    rounded="none"
                    className="pnpnd-file-list-loader"
                />
            ))}
        </>
    );

    const isAllSelected = selected_files.length === files.length;

    return (
        <BlockStack className="pnpnd-file-list">
            <InlineStack
                align="between"
                blockAlign="center"
                gap={10}
                padding="16px"
                className="pnpnd-file-list__header"
            >
                {isFileSelecting && (
                    <InlineStack
                        align="start"
                        blockAlign="center"
                        className="pnpnd-file-list__header-col pnpnd-file-list__header-col--status"
                    >
                        <Checkbox
                            checked={isAllSelected}
                            rounded="sm"
                            onChange={() => {
                                if (!isAllSelected) {
                                    setSelectedFiles(files);
                                } else {
                                    setSelectedFiles([]);
                                }
                            }}
                        />
                    </InlineStack>
                )}

                <Text
                    color="gray-500"
                    size="xs"
                    weight="semibold"
                    textTransform="none"
                    className="pnpnd-file-list__header-col pnpnd-file-list__header-col--name"
                >
                    {list_view_table_head.name}
                </Text>

                <Text
                    color="gray-500"
                    size="xs"
                    weight="semibold"
                    textTransform="none"
                    align="center"
                    className="pnpnd-file-list__header-col pnpnd-file-list__header-col--size"
                >
                    {list_view_table_head.size}
                </Text>

                <Text
                    color="gray-500"
                    size="xs"
                    weight="semibold"
                    textTransform="none"
                    align="center"
                    className="pnpnd-file-list__header-col pnpnd-file-list__header-col--type"
                >
                    {list_view_table_head.type}
                </Text>

                <Text
                    color="gray-500"
                    size="xs"
                    weight="semibold"
                    textTransform="none"
                    align="center"
                    className="pnpnd-file-list__header-col pnpnd-file-list__header-col--date"
                >
                    {list_view_table_head.updated}
                </Text>

                <Text
                    color="gray-500"
                    size="xs"
                    weight="semibold"
                    textTransform="none"
                    align="center"
                    className="pnpnd-file-list__header-col pnpnd-file-list__header-col--actions"
                >
                    {list_view_table_head.action}
                </Text>
            </InlineStack>

            {filesStatus.loading && !filesStatus.loadingMore && loader}

            {!filesStatus.loading &&
                files.map((file) => {
                    const { extension, size, updated_at, mime_type } = file;
                    const isSelected =
                        selected_files.some(
                            (f) => f.file_key === file.file_key,
                        ) || activeFile?.file_key === file.file_key;
                    const _isFolder = isFolder(mime_type || "");

                    return (
                        <InlineStack
                            key={file.file_key}
                            align="between"
                            blockAlign="center"
                            gap={10}
                            className={clsx(
                                "pnpnd-file-list__item",
                                isSelected && "pnpnd-file-list__item--selected",
                            )}
                            padding="12px 16px"
                            data-key={file.file_key}
                            onClick={() => {
                                onFileClick(file);
                                addSuggestedFile &&
                                    addSuggestedFile?.(file?.file_key);
                            }}
                            onDoubleClick={() => onFileDoubleClick(file)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                show(
                                    "file-menu",
                                    e as React.MouseEvent<HTMLElement>,
                                    { file },
                                );
                            }}
                        >
                            {isFileSelecting && (
                                <InlineStack
                                    align="start"
                                    blockAlign="center"
                                    className="pnpnd-file-list__status"
                                >
                                    <Checkbox
                                        rounded="sm"
                                        checked={isSelected}
                                        onChange={() => onFileClick(file)}
                                    />
                                </InlineStack>
                            )}

                            <InlineStack
                                className="pnpnd-file-list__name"
                                gap={12}
                                wrap={false}
                            >
                                <InlineStack
                                    className="pnpnd-file-list__icon"
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        height: "32px",
                                        width: "32px",
                                    }}
                                >
                                    <Thumbnail file={file} compact />
                                </InlineStack>

                                <Text size="sm" wrap={false}>
                                    {file?.additional_data?.base_name ||
                                        file?.name}
                                </Text>
                            </InlineStack>

                            {_isFolder ? (
                                <Text
                                    color="gray-500"
                                    size="xs"
                                    className="pnpnd-file-list__size"
                                    align="center"
                                >
                                    {__("N/A", "ninja-drive")}
                                </Text>
                            ) : (
                                <Text
                                    color="gray-500"
                                    size="xs"
                                    className="pnpnd-file-list__size"
                                    align="center"
                                >
                                    {formatFileSize(Number(size) || 0)}
                                </Text>
                            )}

                            <Text
                                color="gray-500"
                                size="xs"
                                textTransform="uppercase"
                                className="pnpnd-file-list__type"
                                align="center"
                            >
                                {extension}
                            </Text>

                            <Text
                                color="gray-500"
                                size="xs"
                                textTransform="lowercase"
                                className="pnpnd-file-list__date"
                                align="center"
                            >
                                {timeAgo(updated_at || "")}
                            </Text>

                            <InlineStack
                                blockAlign="center"
                                align="center"
                                className="pnpnd-file-list__actions"
                            >
                                <Icon
                                    name="more_vert"
                                    fontSize="md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        show(
                                            "file-menu",
                                            e as React.MouseEvent<HTMLElement>,
                                            { file },
                                        );
                                    }}
                                />
                            </InlineStack>
                        </InlineStack>
                    );
                })}

            {!filesStatus.loading && filesStatus.loadingMore && loader}
        </BlockStack>
    );
};

const GridView = ({
    files,
    selected_files,
    activeFile,
    isFileSelecting,
    onFileClick,
    onFileDoubleClick,
    filesStatus,
    addSuggestedFile,
}: FilesViewsProps) => {
    const { show } = useContextMenu();

    const loader = (
        <>
            {Array.from({ length: 24 }).map((_, index) => (
                <SkeletonLoader key={index} height="220px" />
            ))}
        </>
    );

    return (
        <GridStack
            gap={15}
            columns="auto-fill"
            min="180px"
            className="pnpnd-file-grid"
        >
            {filesStatus.loading && !filesStatus.loadingMore && loader}

            {!filesStatus.loading &&
                files.map((file) => {
                    const isSelected =
                        selected_files.some(
                            (f) => f.file_key === file.file_key,
                        ) || activeFile?.file_key === file.file_key;
                    const _isFolder = isFolder(file.mime_type || "");
                    const _isShortcut = isShortcut(file.extension || "");

                    return (
                        <Card
                            key={file.file_key}
                            padding={10}
                            background="white"
                            rounded="md"
                            flex
                            direction="col"
                            gap={7}
                            data-key={file.file_key}
                            className={clsx(
                                "pnpnd-file-grid__item",
                                isSelected && "pnpnd-file-grid__item--selected",
                            )}
                            onClick={() => {
                                onFileClick(file);
                                addSuggestedFile &&
                                    addSuggestedFile?.(file?.file_key);
                            }}
                            onDoubleClick={() => onFileDoubleClick(file)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                show(
                                    "file-menu",
                                    e as React.MouseEvent<HTMLElement>,
                                    { file },
                                );
                            }}
                        >
                            {isFileSelecting && (
                                <Checkbox
                                    rounded="sm"
                                    className="pnpnd-file-grid__status"
                                    checked={isSelected}
                                    onChange={() => onFileClick(file)}
                                />
                            )}

                            <Thumbnail file={file} />

                            <InlineStack align="between" gap={10} wrap={false}>
                                <BlockStack gap={3}>
                                    <Text
                                        wrap={false}
                                        size="sm"
                                        className="pnpnd-file-grid__name"
                                    >
                                        {file?.additional_data?.base_name ||
                                            file?.name}
                                    </Text>

                                    <InlineStack
                                        gap={8}
                                        className="pnpnd-file-grid__meta"
                                    >
                                        <Text
                                            color="gray-500"
                                            size="xs"
                                            textTransform="uppercase"
                                            className="pnpnd-file-grid__type"
                                        >
                                            {file?.extension}
                                        </Text>

                                        {!_isFolder &&
                                            !_isShortcut &&
                                            file?.size && (
                                                <Text
                                                    color="gray-500"
                                                    size="xs"
                                                    className="pnpnd-file-grid__size"
                                                >
                                                    {formatFileSize(
                                                        Number(file?.size) || 0,
                                                    )}
                                                </Text>
                                            )}
                                    </InlineStack>
                                </BlockStack>

                                <Icon
                                    name="more_vert"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        show(
                                            "file-menu",
                                            e as React.MouseEvent<HTMLElement>,
                                            { file },
                                        );
                                    }}
                                />
                            </InlineStack>
                        </Card>
                    );
                })}

            {!filesStatus.loading && filesStatus.loadingMore && loader}
        </GridStack>
    );
};
