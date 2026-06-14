import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import BlockStack from "~/components/molecules/BlockStack";
import FolderTreeNode from "./FolderTreeNode";
import DnD from "~/components/molecules/DnD";
import { File } from "~/types/file.types";
import CreateFolder from "./CreateFolder";
import AddFolders from "./AddFolders";
import TreeAction from "./TreeAction";
import { MenuKey } from "./Menus";
import {
    addFolders,
    selectMediaLibrary,
    setLoading,
} from "~/store/features/mediaLibrarySlice";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "@wordpress/element";

const FolderTree = ({ activeMenu }: { activeMenu: MenuKey }) => {
    const { create_folder, active_folder, query_args } =
        useAppSelector(selectMediaLibrary);

    const [showFade, setShowFade] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const dispatch = useAppDispatch();

    const handleScroll = () => {
    };

    return (
        <div style={{ padding: "15px", minWidth: 0 }}>
            <TreeAction
                files={mediaFiles}
                disabled={loading || !mediaFiles || mediaFiles.length === 0}
            />

            {(!mediaFiles || mediaFiles.length === 0) && !loading && (
                <AddFolders />
            )}

            <div
                style={{
                    marginTop: 10,
                }}
                className="pnpnd-media-library-folder-tree"
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <div
                    ref={ref}
                    onScroll={handleScroll}
                    className="pnpnd-media-library-folder-tree__scroll"
                >
                    {loading ? (
                        Array.from({ length: 20 }).map((_, index) => (
                            <SkeletonLoader
                                key={index}
                                width="100%"
                                height="50px"
                            />
                        ))
                    ) : (
                        <BlockStack>
                            {create_folder && !active_folder && (
                                <CreateFolder />
                            )}

                            <DnD
                                isMove
                                onMove={(from, to) =>
                                    moveFolder(String(to), [String(from)])
                                }
                            >
                                {mediaFiles?.map((folder: File) => (
                                    <DnD.Item
                                        key={folder?.file_key}
                                        id={folder?.file_key}
                                        order={folder?.file_key}
                                    >
                                        <FolderTreeNode
                                            folder={folder}
                                            treePadding={false}
                                        />
                                    </DnD.Item>
                                ))}
                            </DnD>
                        </BlockStack>
                    )}
                </div>

                {showFade && (
                    <div className="pnpnd-media-library-folder-tree__layer" />
                )}
            </div>
        </div>
    );
};

export default FolderTree;
