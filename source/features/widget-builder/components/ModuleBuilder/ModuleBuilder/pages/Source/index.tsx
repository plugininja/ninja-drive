import FilesViews from "~/shared/file-views/components/FilesViews/FilesViews";
import { useFileActions } from "~features/file-browser/hooks/useFileActions";
import Uploader from "~/shared/file-uploader/components/Uploader/Uploader";
import FileInfo from "~/shared/file-views/components/FilesViews/FileInfo";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { File, FileTypes } from "~features/file-browser/types/file.types";
import { ModuleKey } from "~features/widget-builder/types/widget.types";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { useGallery } from "~features/file-browser/hooks/useGallery";
import { useFiles } from "~features/file-browser/hooks/useFiles";
import MainLayout from "~/ui/templates/MainLayout/MainLayout";
import { checkSelectionFiles } from "~kernel/utils/helpers";
import StepContent from "~features/onboarding/StepContent";
import { TLayout } from "~features/file-browser/types/ui";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "@wordpress/element";
import { MENU_KEYS, MenuKey } from "~kernel/types/Types";
import { toBoolean } from "~kernel/utils/functions";
import SelectedFileList from "./SelectedFileList";
import { PageContainer } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import FileSidebar from "./Sidebar";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import FileTopbar from "./Topbar";
import {
    selectFileKeys,
    selectThumbnail,
    updateEditData,
} from "~features/widget-builder/state/widgetBuilderSlice";
import {
    completeStep,
    useOnboardingStep,
} from "~features/widget-builder/hooks/useOnboardingStep";
import {
    isAudio,
    isFolder,
    isImage,
    isVideo,
} from "~features/file-browser/utils/file";

const defaultFileTypes: Record<ModuleKey, FileTypes[]> = {
    gallery: ["image", "folder"],
    file_browser: ["all"],
    file_uploader: ["folder"],
    embed_documents: ["folder", "archive", "document"],
    file_list: ["all"],
    media_player: ["folder", "video", "audio"],
    search_box: ["all"],
    slider_carousel: ["folder", "image"],
};

const Source = () => {
    const [selectedActionKey, setSelectedActionKey] = useState<string | null>(
        null,
    );
    const [showUploader, setShowUploader] = useState(false);

    const [layout, setLayout] = useState<TLayout>("grid");

    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const selected_files = edit_data?.data?.source?.selected_files || [];

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const { menuKey, widget_id } = useParams<{
        menuKey?: MenuKey;
        widget_id?: string;
        widgetMenu?: string;
    }>();

    const types = defaultFileTypes[edit_data?.type as ModuleKey];

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
    } = useFiles("my-drive", !types, types);

    const { active_folder, order, order_by } = queryArgs;

    const { viewFile } = useGallery(files);

    const { isNextStep, completedSteps } = useOnboardingStep();

    const {
        activeFile,
        createFolder,
        deleteFile,
        rename,
        download,
        viewDetails,
        openGoogleDrive,
        share,
    } = useFileActions();

    useEffect(() => {
        if (active_folder && MENU_KEYS?.includes(active_folder as MenuKey)) {
            navigate(`/widget-builder/${widget_id}/source/${active_folder}`);
        }
    }, [active_folder]);

    useEffect(() => {
        if (
            menuKey &&
            breadcrumbs?.length &&
            !breadcrumbs?.some((b) => b?.file_key === menuKey)
        ) {
            openFolder(menuKey);
        }
    }, [menuKey]);

    const handleSelectFile = (newSelectedFiles: File | File[]) => {
        if (active_folder === "home") {
            if (!Array.isArray(newSelectedFiles)) {
                openFolder(newSelectedFiles?.file_key);
            }
            return;
        }

        if (selectedActionKey && edit_data?.type === "media_player") {
            if (Array.isArray(newSelectedFiles)) {
                return;
            }

            if (!isImage(newSelectedFiles?.extension || "")) return;
            dispatch(
                selectThumbnail({
                    file_key: selectedActionKey,
                    thumbnail: newSelectedFiles,
                }),
            );
            return;
        }
        if (edit_data?.type === "file_uploader") {
            if (!Array.isArray(newSelectedFiles)) {
                dispatch(selectFileKeys([newSelectedFiles]));
            }
            return;
        }
        const _newSelectedFiles = checkSelectionFiles(
            newSelectedFiles,
            selected_files,
        );
        dispatch(selectFileKeys(_newSelectedFiles));

        if (toBoolean(pnpnd?.onboarding)) {
            completeStep(2);
        }
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file?.extension || "")) {
            openFolder(file?.file_key);
        } else {
            viewFile(file?.file_key);
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

    const handlePrivateFolder = () => {
        if (!edit_data) return;

        dispatch(
            updateEditData({
                key: "data",
                value: {
                    ...edit_data?.data,
                    source: {
                        ...edit_data?.data?.source,
                        private_folder:
                            !edit_data?.data?.source?.private_folder,
                    },
                },
            }),
        );
    };

    const handleContextMenuClick = (actionId: string, file: File) => {
        switch (actionId) {
            case "preview":
                viewFile(file.file_key);
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
            case "rename":
                rename(file, active_folder);
                break;
            case "delete":
                const file_keys =
                    selected_files.length > 0
                        ? selected_files.map((file) => file?.file_key)
                        : [file?.file_key];
                deleteFile(file_keys, active_folder);
                break;
            default:
                break;
        }
    };

    const _selectedFiles = !selectedActionKey
        ? selected_files
        : selected_files
              .filter(
                  (file) =>
                      (isVideo(file?.mime_type) || isAudio(file?.mime_type)) &&
                      file?.thumbnail_data &&
                      file?.file_key === selectedActionKey,
              )
              .map((file) => file);

    const uploader = (
        <Uploader
            background="white"
            borderStyle="dashed"
            shadow
            data={{
                minFileSize: 0,
                maxFileSize: pnpnd.is_pro ? 5 : 0,
                activeFolder: active_folder,
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
            nodeTitle={
                <InlineStack gap={10}>
                    <Text as="h2" weight="medium" size="lg">
                        {__("Select Folders and Files", "ninja-drive")}
                    </Text>

                    {toBoolean(pnpnd?.onboarding) && isNextStep(2) && (
                        <StepContent
                            title={__("Select files to show", "ninja-drive")}
                            description={__(
                                "Click it to create a new widget Click it to create a new widget Click it to create.",
                                "ninja-drive",
                            )}
                            content={
                                <InlineStack
                                    align="between"
                                    gap={10}
                                    style={{
                                        marginTop: "7px",
                                    }}
                                >
                                    <Text color="gray-300" size="sm">
                                        {completedSteps?.length + 1}{" "}
                                        {__("of", "ninja-drive")} 8
                                    </Text>

                                    <Button
                                        variant="primary"
                                        size="extrasmall"
                                        onClick={() => completeStep(2)}
                                    >
                                        Done
                                    </Button>
                                </InlineStack>
                            }
                            position="bottom-left"
                            arrowPosition="top-left"
                        />
                    )}
                </InlineStack>
            }
            docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
        >
            <Card background="white" border="gray-200">

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
                                activeFolder={active_folder}
                                sorting={{ order, order_by }}
                                loading={loading}
                                openFolder={openFolder}
                            />

                            <MainLayout.ContentWrapper
                                style={{
                                    overflow: "hidden",
                                }}
                            >
                                <MainLayout.Content
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "20px",
                                        borderRadius: "12px",
                                        padding: "0px 20px 20px 20px",
                                    }}
                                    className="bg-white"
                                >
                                    <FilesViews
                                        onFileClick={handleSelectFile}
                                        onFileDoubleClick={handleDoubleClick}
                                        isFileSelecting={
                                            active_folder === "home"
                                                ? false
                                                : true
                                        }
                                        setIsFileSelecting={() => {}}
                                        layout={layout}
                                        setLayout={setLayout}
                                        files={files}
                                        activeFolder={active_folder}
                                        breadcrumbs={breadcrumbs}
                                        openFolder={openFolder}
                                        activeFile={activeFile}
                                        setActiveFile={viewDetails}
                                        selected_files={_selectedFiles}
                                        setSelectedFiles={handleSelectFile}
                                        filesStatus={{
                                            loading,
                                            loadingMore,
                                            has_more,
                                        }}
                                        showUploader={showUploader}
                                        setShowUploader={setShowUploader}
                                        sorting={{ order, order_by }}
                                        setSorting={(value) =>
                                            setQueryArgs({
                                                ...queryArgs,
                                                ...value,
                                            })
                                        }
                                    >
                                        <FileTopbar
                                            style={{
                                                position: "sticky",
                                                top: 0,
                                            }}
                                            activeFolder={active_folder}
                                            queryArgs={queryArgs}
                                            expandSearch={setQueryArgs}
                                            createFolder={createFolder}
                                            refresh={refresh}
                                            loading={loading}
                                        >
                                            <FilesViews.Breadcrumbs />
                                        </FileTopbar>

                                        <FilesViews.Header
                                            background="primary-extralight"
                                            marginTop={5}
                                        />

                                        <FilesViews.Files
                                            style={{
                                                marginTop: "20px",
                                                paddingBottom: "100px",
                                            }}
                                        />

                                        <FilesViews.FileContextMenu
                                            onMenuClick={handleContextMenuClick}
                                        />

                                        {has_more && (
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
                                            onClose={() =>
                                                viewDetails(undefined)
                                            }
                                        />
                                    )}
                                </MainLayout.Content>
                            </MainLayout.ContentWrapper>
                        </MainLayout>
                    </Card>

                    <SelectedFileList
                        widgetType={edit_data?.type}
                        selected_files={selected_files}
                        setSelectedFiles={(newSelectedFiles) =>
                            dispatch(selectFileKeys(newSelectedFiles))
                        }
                        selectedActionKey={selectedActionKey || ""}
                        setSelectedActionKey={handleSelectAction}
                    />
                </InlineStack>

                {showUploader && uploader}
            </Card>
        </PageContainer>
    );
};

export default Source;
