import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "@wordpress/element";
import { useFileActions } from "~/hooks/useFileActions";
import { checkSelectionFiles } from "~/utils/helpers";
import FilesViews from "~/components/organisms/FilesViews/FilesViews";
import FileSidebar from "./components/FileSidebar";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import MainLayout from "~/components/templates/MainLayout";
import FileTopbar from "./components/FileTopbar";
import FileInfo from "~/components/organisms/FilesViews/FileInfo";
import { useGallery } from "~/hooks/useGallery";
import Uploader from "~/components/organisms/Uploader/Uploader";
import { useFiles } from "~/hooks/useFiles";
import { File } from "~/types/file.types";
import { isFolder } from "~/utils/file";
import { TLayout } from "~/types/ui";
import { useSyncAccountMutation } from "~/store/api/authApi";
import { useAppSelector } from "~/store/hooks";
import { selectAuth } from "~/store/features/authSlice";

const FileBrowser: React.FC = () => {
    const [showUploader, setShowUploader] = useState(false);
    const [isFileSelecting, setIsFileSelecting] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [layout, setLayout] = useLocalStorage<TLayout>(
        "pnpnd-layout-file-browser",
        "grid",
    );
    const { activeAccount } = useAppSelector(selectAuth);

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
        hasMore,
        loadingMore,
        refresh,
        isError,
        queryArgs,
        setQueryArgs,
        suggestedFiles,
        addSuggestedFile,
        removeSuggestedFile,
    } = useFiles(savedFolder || "home");

    const { activeFolder, order, orderBy } = queryArgs;

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
        copy,
        share,
        downloadLinkOpen,
        move,
    } = useFileActions();

    useEffect(() => {
        if (activeFolder !== savedFolder) setSavedFolder(activeFolder);

        if (activeFolder && MENU_KEYS.includes(activeFolder as MenuKey)) {
            navigate(`/file-browser/${activeFolder}`);
        }
    }, [activeFolder]);

    useEffect(() => {
        if (
            menuKey &&
            breadcrumbs.length &&
            !breadcrumbs.some((b) => b.fileKey === menuKey)
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
            selectedFiles,
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
            openFolder(file.fileKey);
        } else {
            viewFile(file.fileKey);
        }
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file.extension || "")) {
            openFolder(file.fileKey);
        } else {
            viewFile(file.fileKey);
        }
    };

    const handleContextMenuClick = (
        actionId: string,
        file: File,
        extension?: string,
    ) => {
        switch (actionId) {
            case "preview":
                viewFile(file.fileKey);
                break;
            case "open":
                openGoogleDrive(file);
                break;
            case "view-details":
                if (viewDetails) viewDetails(file);
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
            case "copy":
                copy({ file, activeFolderKey: activeFolder, breadcrumbs });
                break;
            case "move":
                move({ file, activeFolderKey: activeFolder, breadcrumbs });
                break;
            case "rename":
                rename(file, activeFolder);
                break;
            case "hide":
                removeSuggestedFile(file.fileKey);
                break;
            case "delete":
                const fileKeys =
                    isFileSelecting && selectedFiles.length > 0
                        ? selectedFiles.map((file) => file.fileKey)
                        : [file.fileKey];
                deleteFile(fileKeys, activeFolder);
                break;
            default:
                break;
        }
    };
    const handleUploadComplete = async () => {
        try {
            await syncAccount({
                accountKey: activeAccount?.accountKey || "",
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
                maxFileSize: pnpnd.isPro !== "1" ? 5 : 0,
                activeFolder: activeFolder,
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
                activeFolder={queryArgs.activeFolder}
                loading={loading}
                sorting={{ order, orderBy }}
            />

            <MainLayout.ContentWrapper>
                <FileTopbar
                    refresh={refresh}
                    activeFolder={activeFolder}
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
                        activeFolder={activeFolder}
                        breadcrumbs={breadcrumbs}
                        openFolder={openFolder}
                        activeFile={activeFile}
                        setActiveFile={viewDetails}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={handleSelectFile}
                        filesStatus={{ loading, loadingMore, hasMore }}
                        showUploader={showUploader}
                        setShowUploader={setShowUploader}
                        sorting={{ order, orderBy }}
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

                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                style={{ height: "20px", marginTop: "-20px" }}
                            />
                        )}
                    </FilesViews>

                    {activeFile && (
                        <FileInfo
                            activeFile={activeFile}
                            onClose={() => viewDetails(undefined)}
                        />
                    )}

                    {showUploader && uploader}
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default FileBrowser;
