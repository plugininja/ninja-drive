import FilesViews from "~/shared/file-views/components/FilesViews/FilesViews";
import { useFileActions } from "~features/file-browser/hooks/useFileActions";
import Uploader from "~/shared/file-uploader/components/Uploader/Uploader";
import FileInfo from "~/shared/file-views/components/FilesViews/FileInfo";
import { useGallery } from "~features/file-browser/hooks/useGallery";
import { useSyncAccountMutation } from "~features/auth/api/authApi";
import { useFiles } from "~features/file-browser/hooks/useFiles";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { File } from "~features/file-browser/types/file.types";
import { isFolder } from "~features/file-browser/utils/file";
import { selectAuth } from "~features/auth/state/authSlice";
import { checkSelectionFiles } from "~kernel/utils/helpers";
import { TLayout } from "~features/file-browser/types/ui";
import { useNavigate, useParams } from "react-router-dom";
import { MENU_KEYS, MenuKey } from "~kernel/types/Types";
import { useEffect, useState } from "@wordpress/element";
import { useAppSelector } from "~kernel/store/hooks";
import MainLayout from "~/ui/templates/MainLayout";
import FileSidebar from "./components/FileSidebar";
import FileTopbar from "./components/FileTopbar";

const FileBrowser: React.FC = () => {
    const [showUploader, setShowUploader] = useState(false);
    const [isFileSelecting, setIsFileSelecting] = useState<boolean>(false);
    const [selected_files, setSelectedFiles] = useState<File[]>([]);
    const [layout, setLayout] = useLocalStorage<TLayout>(
        "pnpnd-layout-file-browser",
        "grid",
    );

    const { active_account } = useAppSelector(selectAuth);

    const [syncAccount] = useSyncAccountMutation();

    const navigate = useNavigate();

    const { menuKey } = useParams<{
        menuKey?: MenuKey;
    }>();

    const [savedFolder, setSavedFolder] = useLocalStorage(
        "pnpnd-active-folder-file-browser",
        "",
    );

    const {
        files,
        breadcrumbs,
        openFolder,
        loading,
        loadMoreRef,
        has_more,
        loadingMore,
        refresh,
        isError,
        queryArgs,
        setQueryArgs,
        suggestedFiles,
        addSuggestedFile,
        removeSuggestedFile,
    } = useFiles(savedFolder || "home");

    const { active_folder, order, order_by } = queryArgs;

    const { viewFile } = useGallery(files);

    const {
        activeFile,
        setActiveFile,
        createFolder,
        deleteFile,
        rename,
        download,
        viewDetails,
        openGoogleDrive,
        share,
        downloadLinkOpen,
    } = useFileActions();

    useEffect(() => {
        if (active_folder !== savedFolder) setSavedFolder(active_folder);

        if (active_folder && MENU_KEYS.includes(active_folder as MenuKey)) {
            navigate(`/file-browser/${active_folder}`);
        }
    }, [active_folder]);

    useEffect(() => {
        if (
            menuKey &&
            breadcrumbs.length &&
            !breadcrumbs.some((b) => b.file_key === menuKey)
        ) {
            openFolder(menuKey);
        }
    }, [menuKey]);

    useEffect(() => {
        if (isError) {
            setSavedFolder("home");
        }
        if (!loading && !loadingMore && files.length === 0) {
            setSavedFolder("home");
        }
    }, [files]);

    const handleSelectFile = (newSelectedFiles: File | File[]) => {
        const _newSelectedFiles = checkSelectionFiles(
            newSelectedFiles,
            selected_files,
        );
        setSelectedFiles(_newSelectedFiles);
    };

    const handleFileClick = (file: File) => {
        if (activeFile) {
            setActiveFile(file);
            return;
        }
        if (isFileSelecting) {
            handleSelectFile(file);
            return;
        }

        if (isFolder(file.extension || "")) {
            openFolder(file.file_key);
        } else {
            viewFile(file.file_key);
        }
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file.extension || "")) {
            openFolder(file.file_key);
        } else {
            viewFile(file.file_key);
        }
    };

    const handleContextMenuClick = (
        actionId: string,
        file: File,
        extension?: string,
    ) => {
        switch (actionId) {
            case "preview":
                viewFile(file.file_key);
                break;
            case "open":
                openGoogleDrive(file);
                break;
            case "share":
                share(file);
                break;
            case "download":
                download(file, undefined, extension);
                break;
            case "downloadLink":
                downloadLinkOpen(file);
                break;
            case "rename":
                rename(file, active_folder);
                break;
            case "hide":
                removeSuggestedFile(file.file_key);
                break;
            case "delete":
                const file_keys =
                    isFileSelecting && selected_files.length > 0
                        ? selected_files.map((file) => file.file_key)
                        : [file.file_key];
                deleteFile(file_keys, active_folder);
                break;
            default:
                break;
        }
    };

    const handleUploadComplete = async () => {
        try {
            await syncAccount({
                account_key: active_account?.account_key || "",
            }).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const uploader = (
        <Uploader
            background="white"
            borderStyle="dashed"
            shadow
            data={{
                minFileSize: 0,
                maxFileSize: pnpnd.is_pro !== "1" ? 5 : 0,
                activeFolder: active_folder,
                onFileUpload: () => {},
                setIsUploading: setShowUploader,
                uploadImmediately: true,
                enableFolderUpload: true,
                onUploadComplete: handleUploadComplete,
            }}
            onClose={() => setShowUploader(false)}
        />
    );

    return (
        <MainLayout className="pnpnd-file-browser-container">
            <FileSidebar
                openFolder={openFolder}
                activeFolder={queryArgs.active_folder}
                loading={loading}
                sorting={{ order, order_by }}
            />

            <MainLayout.ContentWrapper>
                <FileTopbar
                    refresh={refresh}
                    activeFolder={active_folder}
                    queryArgs={queryArgs}
                    expandSearch={setQueryArgs}
                    openFolder={openFolder}
                    loading={loading}
                />

                <MainLayout.Content
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "20px",
                    }}
                >
                    <FilesViews
                        style={{
                            minWidth: 0,
                        }}
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
                        activeFile={activeFile}
                        setActiveFile={viewDetails}
                        selected_files={selected_files}
                        setSelectedFiles={handleSelectFile}
                        filesStatus={{ loading, loadingMore, has_more }}
                        showUploader={showUploader}
                        setShowUploader={setShowUploader}
                        sorting={{ order, order_by }}
                        setSorting={(value) =>
                            setQueryArgs({ ...queryArgs, ...value })
                        }
                        addSuggestedFile={addSuggestedFile}
                    >
                        <FilesViews.Actions createFolder={createFolder} />

                        <FilesViews.Breadcrumbs />

                        <FilesViews.Header />

                        <FilesViews.Files
                            style={{
                                padding: "20px 0px",
                            }}
                        />

                        <FilesViews.FileContextMenu
                            onMenuClick={handleContextMenuClick}
                        />

                        {has_more && (
                            <div
                                ref={loadMoreRef}
                                style={{ height: "20px", marginTop: "-20px" }}
                            />
                        )}
                    </FilesViews>

                    {showUploader && uploader}
                </MainLayout.Content>

                {activeFile && (
                    <FileInfo
                        activeFile={activeFile}
                        onClose={() => viewDetails(undefined)}
                    />
                )}
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default FileBrowser;
