import { completeStep, useOnboardingStep } from "~/hooks/useOnboardingStep";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import FilesViews from "~/components/organisms/FilesViews/FilesViews";
import { isAudio, isFolder, isImage, isVideo } from "~/utils/file";
import FileInfo from "~/components/organisms/FilesViews/FileInfo";
import PageContainer from "~/components/molecules/PageContainer";
import Uploader from "~/components/organisms/Uploader/Uploader";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import StepContent from "~/components/onboarding/StepContent";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "@wordpress/element";
import { useFileActions } from "~/hooks/useFileActions";
import { checkSelectionFiles } from "~/utils/helpers";
import { File, FileTypes } from "~/types/file.types";
import Checkbox from "~/components/atoms/Checkbox";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import SelectedFileList from "./SelectedFileList";
import Divider from "~/components/atoms/Divider";
import { ModuleKey } from "~/types/widget.types";
import { useGallery } from "~/hooks/useGallery";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import { toBoolean } from "~/utils/functions";
import { useFiles } from "~/hooks/useFiles";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import { TLayout } from "~/types/ui";
import FileSidebar from "./Sidebar";
import FileTopbar from "./Topbar";
import DOCS from "~/utils/docs";
import {
    selectFileKeys,
    selectThumbnail,
    updateEditData,
} from "~/store/features/widgetBuilderSlice";

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
        move,
        copy,
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
        if (active_folder === "home") return;
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
            case "copy":
                copy({
                    file,
                    widget_id: "",
                    active_folder_key: active_folder,
                    breadcrumbs,
                });
                break;
            case "move":
                move({
                    file,
                    widget_id: "",
                    active_folder_key: active_folder,
                    breadcrumbs,
                });
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
            docLink={DOCS?.MODULE_BUILDER?.sources?.link}
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
                                        isFileSelecting={true}
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
