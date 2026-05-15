import FolderOpenIcon from "~/assets/icons/FolderOpenIcon";
import FolderIcon from "~/assets/icons/FolderIcon";
import InlineStack from "~/components/molecules/InlineStack";
import { FolderTree } from "~/types/file.types";
import { MutableRefObject } from "react";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";

export function TreeNodes({
    nodes: nodes,
    expandedKeys,
    onExpand,
    activeFolderKey,
    level = 0,
    loadingKeys,
    nodeRefs,
}: {
    nodes: FolderTree[];
    expandedKeys: string[];
    onExpand: (key: string, action: "expand" | "open", name: string) => void;
    activeFolderKey: string;
    level?: number;
    loadingKeys: string[];
    nodeRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
    return (
        <div style={{ paddingLeft: level > 0 ? 12 : 0 }}>
            {nodes.map((node) => {
                const isExpanded = expandedKeys.includes(node.fileKey);
                const hasChildren = node.children && node.children?.length > 0;
                const isActive = node.fileKey === activeFolderKey;
                const isLoadingNode = loadingKeys.includes(node.fileKey);

                return (
                    <div
                        key={node.fileKey}
                        className="pnpnd-folder-tree-wrapper"
                        ref={(el) => {
                            nodeRefs.current[node.fileKey] = el;
                        }}
                    >
                        <InlineStack
                            gap={8}
                            padding={"4px 6px"}
                            wrap={false}
                            className={clsx(
                                "pnpnd-folder-tree",
                                isActive && "pnpnd-folder-tree--open",
                            )}
                            onClick={() =>
                                onExpand(node.fileKey, "open", node.name)
                            }
                        >
                            <div
                                className={clsx(
                                    "pnpnd-folder-tree__arrow",
                                    isActive ? "bg-white" : "bg-light",
                                    isExpanded &&
                                        "pnpnd-folder-tree__arrow--open",
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onExpand(node.fileKey, "expand", node.name);
                                }}
                            >
                                {isLoadingNode ? (
                                    <Icon
                                        name="autorenew"
                                        color="primary"
                                        fontSize="xl"
                                        className="loading"
                                    />
                                ) : (
                                    <Icon
                                        name="keyboard_arrow_right"
                                        color="primary"
                                        fontSize="xl"
                                    />
                                )}
                            </div>

                            <div className="pnpnd-folder-tree__icon">
                                {isExpanded || isActive ? (
                                    <FolderOpenIcon />
                                ) : (
                                    <FolderIcon />
                                )}
                            </div>

                            <Text
                                size="md"
                                weight="normal"
                                wrap={false}
                                ellipsis
                                style={{ userSelect: "none" }}
                            >
                                {node.name}
                            </Text>
                        </InlineStack>

                        {hasChildren && isExpanded && (
                            <TreeNodes
                                nodes={node.children || []}
                                expandedKeys={expandedKeys}
                                onExpand={onExpand}
                                activeFolderKey={activeFolderKey}
                                level={level + 1}
                                loadingKeys={loadingKeys}
                                nodeRefs={nodeRefs}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
