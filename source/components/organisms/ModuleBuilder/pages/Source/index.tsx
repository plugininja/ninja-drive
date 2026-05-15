import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "@wordpress/element";
import { useFileActions } from "~/hooks/useFileActions";
import PageContainer from "~/components/molecules/PageContainer";
import { checkSelectionFiles } from "~/utils/helpers";
import { File, FileTypes } from "~/types/file.types";
import FilesViews from "~/components/organisms/FilesViews/FilesViews";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import SelectedFileList from "./SelectedFileList";
import InlineStack from "~/components/molecules/InlineStack";
import { ModuleKey } from "~/types/widget.types";
import FileInfo from "~/components/organisms/FilesViews/FileInfo";
import { useGallery } from "~/hooks/useGallery";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import { useFiles } from "~/hooks/useFiles";
import Card from "~/components/molecules/Card";
import { isAudio, isFolder, isVideo } from "~/utils/file";
import { TLayout } from "~/types/ui";
import FileSidebar from "./Sidebar";
import FileTopbar from "./Topbar";
import DOCS from "~/utils/docs";
import {
    selectFileKeys,
    selectThumbnail,
    updateEditData,
} from "~/store/features/widgetBuilderSlice";
import SettingsField from "~/components/molecules/SettingsField";
import Switcher from "~/components/atoms/Switcher";
import Uploader from "~/components/organisms/Uploader/Uploader";

const defaultFileTypes: Record<ModuleKey, FileTypes[]> = {
    gallery: ["image", "folder"],
    "file-browser": ["all"],
    "file-uploader": ["folder"],
    "embed-documents": ["folder", "archive", "document"],
    "file-list": ["all"],
    "media-player": ["folder", "video", "audio"],
    "search-box": ["all"],
    "slider-carousel": ["folder", "image"],
};

const Source = () => {
    const [selectedActionKey, setSelectedActionKey] = useState<string | null>(
        null,
    );
    const [showUploader, setShowUploader] = useState(false);
    const [layout, setLayout] = useState<TLayout>("grid");

    const { editData } = useAppSelector((state) => state?.widgetBuilder);

    const selectedFiles = editData?.data?.source?.selectedFiles || [];

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { menuKey, widgetId } = useParams<{
        menuKey?: MenuKey;
        widgetId?: string;
        widgetMenu?: string;
    }>();

    const types = defaultFileTypes[editData?.type as ModuleKey];

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
    } = useFiles("my-drive", !types, types);

    const { activeFolder, order, orderBy } = queryArgs;

    const { viewFile } = useGallery(files);

    const {
        activeFile,
        createFolder,
        deleteFile,
        rename,
        download,
        viewDetails,
        openGoogleDrive,
        move,
        copy,
        share,
    } = useFileActions();

    useEffect(() => {
        if (activeFolder && MENU_KEYS?.includes(activeFolder as MenuKey)) {
            navigate(`/widget-builder/${widgetId}/source/${activeFolder}`);
        }
    }, [activeFolder]);

    useEffect(() => {
        if (
            menuKey &&
            breadcrumbs?.length &&
            !breadcrumbs?.some((b) => b?.fileKey === menuKey)
        ) {
            openFolder(menuKey);
        }
    }, [menuKey]);

    const handleSelectFile = (newSelectedFiles: File | File[]) => {
        if (activeFolder === "home") return;
        if (selectedActionKey && editData?.type === "media-player") {
            if (Array.isArray(newSelectedFiles)) {
                return;
            }

            dispatch(
                selectThumbnail({
                    fileKey: selectedActionKey,
                    thumbnail: newSelectedFiles,
                }),
            );
            return;
        }
        if (editData?.type === "file-uploader") {
            if (!Array.isArray(newSelectedFiles)) {
                dispatch(selectFileKeys([newSelectedFiles]));
            }
            return;
        }
        const _newSelectedFiles = checkSelectionFiles(
            newSelectedFiles,
            selectedFiles,
        );
        dispatch(selectFileKeys(_newSelectedFiles));
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file?.extension || "")) {
            openFolder(file?.fileKey);
        } else {
            viewFile(file?.fileKey);
        }
    };

    const handleSelectAction = (actionKey: string) => {
        setSelectedActionKey(actionKey);
        if (actionKey) {
            setQueryArgs((prev) => ({ ...prev, types: ["folder", "image"] }));
        } else {
            setQueryArgs((prev) => ({
                ...prev,
                types: ["folder", "video", "audio"],
            }));
        }
    };

    const handleContextMenuClick = (actionId: string, file: File) => {
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
                download(file);
                break;
            case "copy":
                copy({
                    file,
                    widgetId: "",
                    activeFolderKey: activeFolder,
                    breadcrumbs,
                });
                break;
            case "move":
                move({
                    file,
                    widgetId: "",
                    activeFolderKey: activeFolder,
                    breadcrumbs,
                });
                break;
            case "rename":
                rename(file, activeFolder);
                break;
            case "delete":
                const fileKeys =
                    selectedFiles.length > 0
                        ? selectedFiles.map((file) => file?.fileKey)
                        : [file?.fileKey];
                deleteFile(fileKeys, activeFolder);
                break;
            default:
                break;
        }
    };

    const _selectedFiles = !selectedActionKey
        ? selectedFiles
        : selectedFiles
              .filter(
                  (file) =>
                      (isVideo(file?.mimeType) || isAudio(file?.mimeType)) &&
                      file?.thumbnailData &&
                      file?.fileKey === selectedActionKey,
              )
              .map((file) => file);

    const uploader = (
        <Uploader
            background="white"
            borderStyle="dashed"
            shadow
            data={{
                minFileSize: 0,
                maxFileSize: pnpnd.isPro ? 5 : 0,
                activeFolder: activeFolder,
                onFileUpload: () => {},
                setIsUploading: setShowUploader,
                uploadImmediately: true,
                enableFolderUpload: true,
            }}
            onClose={() => setShowUploader(false)}
        />
    );

    return (
        <PageContainer
            widget
            title="Select Folders and Files"
            description="Select folders and files to include in the widget."
            docLink={DOCS?.MODULE_BUILDER?.sources?.link}
        >

            <InlineStack blockAlign="start" gap={20} wrap={false}>
                <Card
                    style={{
                        position: "sticky",
                        top: 0,
                        height: "80vh",
                    }}
                    background="white"
                    padding={0}
                >
                    <MainLayout
                        style={{
                            borderRadius: "12px",
                        }}
                        className="pnpnd-widget-builder-layout"
                    >
                        <FileSidebar
                            border={false}
                            className="pnpnd-widget-file-sidebar"
                            activeFolder={activeFolder}
                            sorting={{ order, orderBy }}
                            loading={loading}
                            openFolder={openFolder}
                        />

                        <MainLayout.ContentWrapper>
                            <FileTopbar
                                style={{
                                    borderRadius: "0 12px 0 0",
                                }}
                                activeFolder={activeFolder}
                                queryArgs={queryArgs}
                                expandSearch={setQueryArgs}
                                refresh={refresh}
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
                                    onFileClick={handleSelectFile}
                                    onFileDoubleClick={handleDoubleClick}
                                    isFileSelecting={true}
                                    setIsFileSelecting={() => {}}
                                    layout={layout}
                                    setLayout={setLayout}
                                    files={files}
                                    activeFolder={activeFolder}
                                    breadcrumbs={breadcrumbs}
                                    openFolder={openFolder}
                                    activeFile={activeFile}
                                    setActiveFile={viewDetails}
                                    selectedFiles={_selectedFiles}
                                    setSelectedFiles={handleSelectFile}
                                    filesStatus={{
                                        loading,
                                        loadingMore,
                                        hasMore,
                                    }}
                                    showUploader={showUploader}
                                    setShowUploader={setShowUploader}
                                    sorting={{ order, orderBy }}
                                    setSorting={(value) =>
                                        setQueryArgs({ ...queryArgs, ...value })
                                    }
                                >
                                    <InlineStack
                                        align="between"
                                        gap={10}
                                        wrap={false}
                                    >
                                        <FilesViews.Breadcrumbs />

                                        {pnpnd.currentUser?.can
                                            ?.manageFileBrowser && (
                                            <FilesViews.Actions
                                                isCompact
                                                createFolder={createFolder}
                                            />
                                        )}
                                    </InlineStack>
                                    <FilesViews.Header />

                                    <FilesViews.Files
                                        style={{
                                            marginTop: "20px",
                                            paddingBottom: "20px",
                                        }}
                                    />

                                    <FilesViews.FileContextMenu
                                        onMenuClick={handleContextMenuClick}
                                    />

                                    {hasMore && (
                                        <div
                                            ref={loadMoreRef}
                                            style={{
                                                height: "20px",
                                                marginTop: "-20px",
                                            }}
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
                </Card>

                <SelectedFileList
                    widgetType={editData?.type}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={(newSelectedFiles) =>
                        dispatch(selectFileKeys(newSelectedFiles))
                    }
                    selectedActionKey={selectedActionKey || ""}
                    setSelectedActionKey={handleSelectAction}
                />
            </InlineStack>
        </PageContainer>
    );
};

export default Source;
