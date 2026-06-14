import { useContextMenu } from "~/components/molecules/ContextMenu";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { useEffect, useState } from "@wordpress/element";
import Checkbox from "~/components/atoms/Checkbox";
import DnD from "~/components/molecules/DnD";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import RenameFolder from "./RenameFolder";
import CreateFolder from "./CreateFolder";
import { File } from "~/types/file.types";
import clsx from "clsx";
import {
    addFolders,
    selectMediaLibrary,
    setActiveFolder,
    setLoading,
    setSelectedFolders,
} from "~/store/features/mediaLibrarySlice";

const FolderTreeNode = ({
    folder,
    treePadding = true,
}: {
    folder: File;
    treePadding?: boolean;
}) => {
    const [currentFolder, setCurrentFolder] = useState<File | null>(folder);
    const [children, setChildren] = useState<File[] | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        active_folder,
        selected_folders,
        create_folder,
        rename_folder,
        bulk_select,
        move_loading,
        query_args,
    } = useAppSelector(selectMediaLibrary);
    const [folderLoading, setFolderLoading] = useState(false);

    const dispatch = useAppDispatch();
    const { show } = useContextMenu();

    const handleChildren = async () => {
        PNPNDHelper.openUpgradePopUp();
    };

    const handleSelectFolder = () => {
        dispatch(setSelectedFolders(currentFolder));
    };

    const isActive = active_folder?.file_key === currentFolder?.file_key;

    const isBulkSelected = selected_folders?.some(
        (f) => f.file_key === currentFolder?.file_key,
    );

    const isRenameActive = rename_folder === currentFolder?.file_key;

    const isMoveLoading =
        move_loading.folder_key === currentFolder?.file_key &&
        move_loading.loading;

    return (
        <div style={{ marginTop: 5, paddingLeft: treePadding ? 15 : 0 }}>
            {isRenameActive ? (
                <RenameFolder
                    folder={currentFolder}
                    setCurrentFolder={setCurrentFolder}
                    setFolderLoading={setFolderLoading}
                />
            ) : (
                <InlineStack
                    gap={5}
                    wrap={false}
                    className={clsx(
                        "pnpnd-media-library-folder-tree__node",
                        isActive &&
                            "pnpnd-media-library-folder-tree__node--active",
                    )}
                    onClick={bulk_select ? handleSelectFolder : handleChildren}
                    onDoubleClick={handleChildren}
                    onContextMenu={(e) => {
                    }}
                >
                    <div
                        className={clsx(
                            "pnpnd-media-library-folder-tree__node-arrow",
                            isActive &&
                                "pnpnd-media-library-folder-tree__node-arrow--active",
                            !bulk_select &&
                                isExpanded &&
                                "pnpnd-media-library-folder-tree__node-arrow--expanded",
                        )}
                    >
                        {folderLoading || isMoveLoading ? (
                            <Icon
                                name="autorenew"
                                color="primary"
                                fontSize="xl"
                                className="loading"
                            />
                        ) : bulk_select ? (
                            <Checkbox
                                checked={isBulkSelected}
                                onChange={() => handleSelectFolder()}
                                size="medium"
                                rounded="sm"
                            />
                        ) : (
                            <Icon
                                name="keyboard_arrow_right"
                                color="primary"
                                fontSize="xl"
                            />
                        )}
                    </div>

                    <div
                        className={clsx(
                            "pnpnd-media-library-folder-tree__node-icon",
                            isExpanded &&
                                "pnpnd-media-library-folder-tree__node-icon--expanded",
                        )}
                    >
                        <img
                            src={folder.icon}
                            alt=""
                            style={{ width: "24px", height: "24px" }}
                        />
                    </div>

                    <Text wrap={false} ellipsis>
                        {currentFolder?.name}
                    </Text>
                </InlineStack>
            )}

            {create_folder && isActive && active_folder && (
                <CreateFolder variant="child" setFolder={setChildren} />
            )}

            {isExpanded && children && (
                <BlockStack>
                    {children.map((child) => (
                        <DnD.Item
                            key={child?.file_key}
                            id={child?.file_key}
                            order={child?.file_key}
                        >
                            <FolderTreeNode folder={child} />
                        </DnD.Item>
                    ))}
                </BlockStack>
            )}
        </div>
    );
};

export default FolderTreeNode;
