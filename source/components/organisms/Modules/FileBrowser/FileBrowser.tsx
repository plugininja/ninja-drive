import { FILE_CONTEXT_MENU_LISTS } from "~/components/organisms/FilesViews/FileContextMenu";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useEffect, useState } from "@wordpress/element";
import { useModuleFiles } from "~/hooks/useModuleFiles";
import { useFileActions } from "~/hooks/useFileActions";
import { File } from "~/types/file.types";
import FilesViews from "~/components/organisms/FilesViews/FilesViews";
import { ModuleConfig } from "~/types/widget.types";
import { checkPermission } from "~/utils/widget";
import BlockStack from "~/components/molecules/BlockStack";
import { useGallery } from "~/hooks/useGallery";
import { Topbar } from "./components/Topbar";
import ModuleBottom from "../ModuleBottom";
import { isFolder } from "~/utils/file";
import { TLayout } from "~/types/ui";
import Card from "~/components/molecules/Card";
import Divider from "~/components/atoms/Divider";
import Uploader from "~/components/organisms/Uploader/Uploader";

const FileBrowser = ({ data }: { data: ModuleConfig }) => {
    const [showUploader, setShowUploader] = useState(false);
    const [activeFile, setActiveFile] = useState<File | null>(null);
    const [isFileSelecting, setIsFileSelecting] = useState<boolean>(false);
    const [layout, setLayout] = useState<TLayout>(
        data?.data?.advanced?.fileBrowser?.folderView || "grid",
    );
    const [savedFolder, setSavedFolder] = useLocalStorage(
        `pnpnd-active-folder-file-browser-${data?.id}`,
        "/",
    );

    const { advanced } = data?.data;
    const { loadingType } = data?.data?.advanced?.files || {};
    const {
        preview,
        rename: renamePermission,
        download: downloadPermission,
        copy,
        move,
        share: sharePermission,
        delete: deletePermission,
    } = data?.data?.permissions || {};

    const {
        files,
        breadcrumbs,
        openFolder,
        loading,
        loadMoreRef,
        hasMore,
        loadingMore,
        refresh,
        queryArgs,
        setQueryArgs,
        loadMore,
        totalPages,
        isError,
    } = useModuleFiles(data, savedFolder);

    const { activeFolder, order, orderBy } = queryArgs;

    const enablePreview = checkPermission("preview", preview!);

    const { viewFile } = useGallery(files, data?.id, {
        permissions: {
            download: checkPermission("download", downloadPermission!),
        },
        securePlayBack: advanced?.mediaPlayer?.secureVideoPlayback,
        showThumbnails: preview?.previewThumbnail,
    });

    const {
        createFolder,
        deleteFile,
        rename,
        download,
        openGoogleDrive,
        copy: copyFile,
        move: moveFile,
        share,
    } = useFileActions();

    useEffect(() => {
        if (queryArgs?.activeFolder !== savedFolder)
            setSavedFolder(queryArgs?.activeFolder);
    }, [queryArgs?.activeFolder]);

    useEffect(() => {
        if (isError) {
            setSavedFolder("");
        }
        if (!loading && !loadingMore && files?.length === 0) {
            setSavedFolder("");
        }
    }, [files]);

    const handleSelectFile = (newSelectedFiles: File | File[]) => {};

    let filteredFileContextMenuList = FILE_CONTEXT_MENU_LISTS?.filter(
        (menu) => {
            if (menu.id === "preview")
                return checkPermission("preview", preview!) 
;
            if (menu.id === "open") return false;
            if (menu.id === "view-details") return false;
            if (menu.id === "share")
                return checkPermission("share", sharePermission!);
            if (menu.id === "download")
                return checkPermission("download", downloadPermission!);
            if (menu.id === "downloadLink") return false;
            if (menu.id === "import") return false;
            if (menu.id === "copy") return checkPermission("copy", copy!);
            if (menu.id === "move") return checkPermission("move", move!);
            if (menu.id === "rename")
                return checkPermission("rename", renamePermission!);
            if (menu.id === "delete")
                return checkPermission("delete", deletePermission!);
            return true;
        },
    );

    filteredFileContextMenuList = filteredFileContextMenuList?.map((menu) => {
        if (menu?.id === "download") {
            if (!downloadPermission?.folderDownload) {
                return {
                    ...menu,
                    fileOnly: true,
                };
            } else {
                return menu;
            }
        } else {
            return menu;
        }
    });

    const handleContextMenuClick = (
        actionId: string,
        file: File,
        extension?: string,
    ) => {
        switch (actionId) {
            case "preview":
                if (enablePreview && preview?.popOut) {
                    openGoogleDrive(file, data?.id);
                    return;
                }
                enablePreview && preview?.inline && viewFile(file?.fileKey);
                break;
            case "open":
                openGoogleDrive(file, data?.id);
                break;
            case "share":
                share(file, data?.id);
                break;
            case "download":
                download(file, data?.id, extension);
                break;
            case "copy":
                copyFile({
                    file,
                    widgetId: data?.id,
                    activeFolderKey: activeFolder || "",
                    breadcrumbs,
                });
                break;
            case "move":
                moveFile({
                    file,
                    widgetId: data?.id,
                    activeFolderKey: activeFolder || "",
                    breadcrumbs,
                });
                break;
            case "rename":
                rename(file, activeFolder, data?.id);
                break;
            case "delete":
                const fileKeys = [file?.fileKey];
                deleteFile(fileKeys, activeFolder, data?.id);
                break;
            default:
                break;
        }
    };

    const handleFileClick = (file: File) => {
        if (isFileSelecting) {
            handleSelectFile(file);
            return;
        }

        if (isFolder(file?.extension || "")) {
            openFolder(file?.fileKey);
        } else {
            if (enablePreview && preview?.popOut) {
                openGoogleDrive(file, data?.id);
                return;
            }
            enablePreview && preview?.inline && viewFile(file?.fileKey);
        }
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file?.extension || "")) {
            openFolder(file?.fileKey);
        } else {
            if (enablePreview && preview?.popOut) {
                openGoogleDrive(file, data?.id);
                return;
            }
            enablePreview && preview?.inline && viewFile(file?.fileKey);
        }
    };

    const uploader = (
        <Uploader
            background="white"
            borderStyle="dashed"
            shadow
            data={{
                minFileSize: 0,
                maxFileSize: pnpnd?.isPro !== "1" ? 5 : 0,
                activeFolder: activeFolder,
                onFileUpload: () => {},
                setIsUploading: setShowUploader,
                uploadImmediately: true,
                enableFolderUpload: true,
                widgetId: data?.id,
            }}
            onClose={() => setShowUploader(false)}
        />
    );
    const goPrevious = () => {
        if (breadcrumbs.length <= 1) return;

        const updated = breadcrumbs.slice(0, -1);
        const prevFolder = updated[updated.length - 1];

        openFolder(prevFolder.fileKey);
    };

    return (
        <Card padding={0} background="primary-extralight" className="h-full">
            <FilesViews
                onFileClick={handleFileClick}
                onFileDoubleClick={handleDoubleClick}
                isFileSelecting={isFileSelecting}
                setIsFileSelecting={setIsFileSelecting}
                layout={layout}
                setLayout={setLayout}
                files={files}
                activeFolder={activeFolder}
                breadcrumbs={breadcrumbs}
                openFolder={openFolder}
                activeFile={activeFile || undefined}
                setActiveFile={setActiveFile as any}
                selectedFiles={[]}
                setSelectedFiles={handleSelectFile}
                filesStatus={{ loading, loadingMore, hasMore }}
                showUploader={showUploader}
                setShowUploader={setShowUploader}
                sorting={{ order, orderBy }}
                setSorting={(value) => setQueryArgs({ ...queryArgs, ...value })}
                widgetId={data.id}
                listViewTableHead={advanced.fileBrowser?.listViewTableHead}
            >
                <Card
                    padding={0}
                    style={{
                        borderTopRightRadius: "12px",
                        borderTopLeftRadius: "12px",
                    }}
                    rounded="none"
                    background="white"
                    borderStyle="none"
                >
                    <Topbar
                        data={data}
                        layout={layout}
                        setLayout={setLayout}
                        refresh={refresh}
                        loading={loading}
                        loadingMore={loadingMore}
                        createFolder={createFolder}
                        queryArgs={queryArgs}
                        setQueryArgs={setQueryArgs}
                        goPrevious={goPrevious}
                        breadcrumbs={breadcrumbs}
                    />
                </Card>

                <Divider />

                <BlockStack
                    padding={10}
                    style={{
                        height: "100%",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                        borderRadius: "0 0 12px 12px",
                    }}
                    className="bg-white"
                >
                    <FilesViews.Files
                        style={{
                            marginTop: 0,
                        }}
                    />

                    <ModuleBottom
                        fileLoadingType={loadingType}
                        hasMore={hasMore}
                        loadMore={loadMore}
                        totalPages={totalPages}
                        currentPage={queryArgs?.page || 1}
                        isLoading={loading || loadingMore}
                        loadMoreFileRef={loadMoreRef}
                    />
                </BlockStack>

                <FilesViews.FileContextMenu
                    menuList={filteredFileContextMenuList}
                    onMenuClick={handleContextMenuClick}
                />
            </FilesViews>
            {showUploader && uploader}
        </Card>
    );
};

export default FileBrowser;
