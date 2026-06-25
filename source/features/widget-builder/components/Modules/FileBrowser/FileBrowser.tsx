import { FILE_CONTEXT_MENU_LISTS } from "~/shared/file-views/components/FilesViews/FileContextMenu";
import { useModuleFiles } from "~features/widget-builder/hooks/useModuleFiles";
import FilesViews from "~/shared/file-views/components/FilesViews/FilesViews";
import { useFileActions } from "~features/file-browser/hooks/useFileActions";
import Uploader from "~/shared/file-uploader/components/Uploader/Uploader";
import { ModuleConfig } from "~features/widget-builder/types/widget.types";
import { checkPermission } from "~features/widget-builder/utils/widget";
import { useGallery } from "~features/file-browser/hooks/useGallery";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { File } from "~features/file-browser/types/file.types";
import { isFolder } from "~features/file-browser/utils/file";
import { TLayout } from "~features/file-browser/types/ui";
import { useEffect, useState } from "@wordpress/element";
import { Topbar } from "./components/Topbar";
import { BlockStack } from "~/ui/molecules";
import ModuleBottom from "../ModuleBottom";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";

const FileBrowser = ({ data }: { data: ModuleConfig }) => {
    const [showUploader, setShowUploader] = useState(false);
    const [activeFile, setActiveFile] = useState<File | null>(null);
    const [isFileSelecting, setIsFileSelecting] = useState<boolean>(false);
    const [layout, setLayout] = useState<TLayout>(
        data?.data?.style?.file_browser?.folder_view || "grid",
    );
    const [savedFolder, setSavedFolder] = useLocalStorage(
        `pnpnd-active-folder-file-browser-${data?.id}`,
        "/",
    );

    const { style } = data?.data;
    const { loading_type } = data?.data?.style?.files || {};
    const {
        preview,
        rename: renamePermission,
        download: downloadPermission,
        copy,
        move,
        share: sharePermission,
        delete: deletePermission,
        upload,
    } = data?.data?.permissions || {};
    const { max_files, max_size, min_size } =
        data?.data?.configuration?.filter?.upload || {};

    const {
        files,
        breadcrumbs,
        openFolder,
        loading,
        loadMoreRef,
        has_more,
        loadingMore,
        refresh,
        queryArgs,
        setQueryArgs,
        loadMore,
        total_pages,
        isError,
    } = useModuleFiles(data, savedFolder);

    const { active_folder, order, order_by } = queryArgs;

    const enablePreview = checkPermission("preview", preview!);

    const { viewFile } = useGallery(files, data?.id, {
        permissions: {
            download: checkPermission("download", downloadPermission!),
        },
        securePlayBack: data.data.configuration.advanced.secure_video_playback,
        showThumbnails: preview?.preview_thumbnail,
    });

    const {
        createFolder,
        deleteFile,
        rename,
        download,
        openGoogleDrive,
        share,
    } = useFileActions();

    useEffect(() => {
        if (queryArgs?.active_folder !== savedFolder)
            setSavedFolder(queryArgs?.active_folder);
    }, [queryArgs?.active_folder]);

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
            if (menu.id === "preview") {
                return checkPermission("preview", preview!);
            }
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
            if (menu.id === "hide") return false;
            if (menu.id === "delete")
                return checkPermission("delete", deletePermission!);
            return true;
        },
    );

    filteredFileContextMenuList = filteredFileContextMenuList?.map((menu) => {
        if (menu?.id === "download") {
            if (!downloadPermission?.folder_download) {
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
                if (enablePreview && preview?.pop_out) {
                    openGoogleDrive(file, data?.id);
                    return;
                }
                enablePreview && preview?.inline && viewFile(file?.file_key);
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
            case "rename":
                rename(file, active_folder, data?.id);
                break;
            case "delete":
                const file_keys = [file?.file_key];
                deleteFile(file_keys, active_folder, data?.id);
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
            openFolder(file?.file_key);
        } else {
            if (enablePreview && preview?.pop_out) {
                openGoogleDrive(file, data?.id);
                return;
            }
            enablePreview && preview?.inline && viewFile(file?.file_key);
        }
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file?.extension || "")) {
            openFolder(file?.file_key);
        } else {
            if (enablePreview && preview?.pop_out) {
                openGoogleDrive(file, data?.id);
                return;
            }
            enablePreview && preview?.inline && viewFile(file?.file_key);
        }
    };

    const uploader = (
        <Uploader
            background="white"
            borderStyle="dashed"
            shadow
            data={{
                widget_id: data?.id,
                maxFileSize: Number(max_size) || 0,
                minFileSize: Number(min_size) || 0,
                max_files: Number(max_files) || 0,
                activeFolder: active_folder,
                onFileUpload: () => {},
                setIsUploading: setShowUploader,
                uploadImmediately: true,
                enableFolderUpload: upload?.folder_upload,
            }}
            onClose={() => setShowUploader(false)}
        />
    );

    const goPrevious = () => {
        if (breadcrumbs.length <= 1) return;

        const updated = breadcrumbs.slice(0, -1);
        const prevFolder = updated[updated.length - 1];

        openFolder(prevFolder.file_key);
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
                activeFolder={active_folder}
                breadcrumbs={breadcrumbs}
                openFolder={openFolder}
                activeFile={activeFile || undefined}
                setActiveFile={setActiveFile as any}
                selected_files={[]}
                setSelectedFiles={handleSelectFile}
                filesStatus={{ loading, loadingMore, has_more }}
                showUploader={showUploader}
                setShowUploader={setShowUploader}
                sorting={{ order, order_by }}
                setSorting={(value) => setQueryArgs({ ...queryArgs, ...value })}
                widget_id={data.id}
                list_view_table_head={style.file_browser?.list_view_table_head}
                actionsHide={filteredFileContextMenuList?.length === 0}
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
                        fileLoadingType={loading_type}
                        has_more={has_more}
                        loadMore={loadMore}
                        total_pages={total_pages}
                        current_page={queryArgs?.page || 1}
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
