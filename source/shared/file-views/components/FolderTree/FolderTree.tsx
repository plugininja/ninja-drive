import { FolderTree as TFolderTree } from "~features/file-browser/types/file.types";
import { MenuKey, Order, OrderBy } from "~kernel/types/Types";
import { SkeletonLoader } from "~/ui/molecules";
import { useParams } from "react-router-dom";
import { BlockStack } from "~/ui/molecules";
import { TreeNodes } from "./TreeNodes";
import { __ } from "@wordpress/i18n";
import { Text } from "~/ui/atoms";
import clsx from "clsx";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "@wordpress/element";
import {
    useGetFolderTreeQuery,
    useLazyGetFolderTreeQuery,
} from "~features/file-browser/api/fileApi";

const FolderTree = ({
    activeFolder,
    sorting = { order: "ASC", order_by: "name" },
    widget_id,
    openFolder,
    onSelect,
    style,
    className,
    skip,
    modal = false,
    hideFade = false,
}: {
    activeFolder: string;
    sorting?: {
        order: Order;
        order_by: OrderBy;
    };
    widget_id?: string;
    openFolder: (folderKey: string) => void;
    onSelect?: (folderKey: string, name: string) => void;
    style?: React.CSSProperties;
    className?: string;
    skip: boolean;
    modal?: boolean;
    hideFade?: boolean;
}) => {
    const { menuKey } = useParams<{ menuKey?: MenuKey }>();

    const { data, isLoading, isFetching } = useGetFolderTreeQuery(
        {
            file_key: menuKey || "my-drive",
            order: sorting?.order,
            order_by: sorting?.order_by,
            widget_id,
        },
        { skip },
    );

    const loading = isLoading || isFetching;

    const [getFolderTree] = useLazyGetFolderTreeQuery();

    const [tree, setTree] = useState<TFolderTree[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [loadingKeys, setLoadingKeys] = useState<string[]>([]);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showFade, setShowFade] = useState(false);

    const folders = data?.data?.files || [];

    useEffect(() => {
        if (!folders.length) return;

        setTree(
            folders.map((folder: TFolderTree) => ({
                file_key: folder.file_key,
                name: folder.name,
                children: [],
                icon: folder.icon,
            })),
        );
    }, [folders]);

    const insertChildren = (
        nodes: TFolderTree[],
        key: string,
        children: TFolderTree[],
    ): TFolderTree[] => {
        return nodes.map((node) => {
            if (node.file_key === key) {
                return {
                    ...node,
                    children,
                };
            }

            if (node.children?.length) {
                return {
                    ...node,
                    children: insertChildren(node.children, key, children),
                };
            }

            return node;
        });
    };

    const toggleExpand = async (
        key: string,
        action: "expand" | "open",
        name: string,
    ) => {
        if (action === "open") {
            openFolder(key);
        }

        onSelect?.(key, name);

        const isExpanded = expandedKeys.includes(key);

        setExpandedKeys((prev) =>
            isExpanded ? prev.filter((k) => k !== key) : [...prev, key],
        );

        if (!isExpanded) {
            const node = findNode(tree, key);
            if (!node) return;

            if (node.children && node.children.length > 0) return;

            setLoadingKeys((prev) => [...prev, key]);

            try {
                const res = await getFolderTree({
                    file_key: key,
                    order: sorting?.order,
                    order_by: sorting?.order_by,
                    widget_id,
                }).unwrap();

                const children =
                    res?.data?.files?.map((folder: TFolderTree) => ({
                        file_key: folder.file_key,
                        name: folder.name,
                        children: [],
                        icon: folder.icon,
                    })) || [];

                setTree((prev) => insertChildren(prev, key, children));
            } finally {
                setLoadingKeys((prev) => prev.filter((k) => k !== key));
            }
        }
    };

    const findNode = (
        nodes: TFolderTree[],
        key: string,
    ): TFolderTree | null => {
        for (const node of nodes) {
            if (node.file_key === key) return node;
            if (node.children?.length) {
                const found = findNode(node.children, key);
                if (found) return found;
            }
        }
        return null;
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;

        const hasScroll =
            scrollRef.current.scrollHeight > scrollRef.current.clientHeight;

        const reachedBottom =
            scrollRef.current.scrollTop + scrollRef.current.clientHeight >=
            scrollRef.current.scrollHeight - 2;
        if (!hideFade) {
            setShowFade(hasScroll && !reachedBottom);
        }
    };

    useLayoutEffect(() => {
        requestAnimationFrame(() => handleScroll());
    }, [tree, expandedKeys]);

    return (
        <div
            style={{
                ...style,
                minHeight: 0,
                height: modal
                    ? "100%"
                    : !pnpnd.is_pro
                    ? "calc(100% - 360px)"
                    : "calc(100% - 310px)",
                marginTop: "20px",
            }}
            className={className}
        >
            <Text color="gray-700" size="md" weight="semibold">
                {__("Folders", "ninja-drive")}
            </Text>

            <div className="pnpnd-folder-tree-fixed">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={clsx(
                        "pnpnd-folder-tree-container",
                        !pnpnd.is_pro && "pnpnd-folder-tree-container--free",
                    )}
                >
                    {loading ? (
                        <BlockStack gap={3}>
                            {Array.from({ length: 20 }).map((_, index) => (
                                <SkeletonLoader
                                    key={index}
                                    width="100%"
                                    height="35px"
                                />
                            ))}
                        </BlockStack>
                    ) : (
                        <TreeNodes
                            nodes={tree}
                            expandedKeys={expandedKeys}
                            onExpand={toggleExpand}
                            activeFolderKey={activeFolder}
                            loadingKeys={loadingKeys}
                            nodeRefs={nodeRefs}
                        />
                    )}
                </div>

                {showFade && <div className="pnpnd-folder-tree-gradient" />}
            </div>
        </div>
    );
};

export default FolderTree;
