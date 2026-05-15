import { __ } from "@wordpress/i18n";
import SelectedFileList from "../ModuleBuilder/pages/Source/SelectedFileList";
import {
    CustomAlertProvider,
    useCustomAlert,
} from "~/components/molecules/Alert";
import { useFileActions } from "~/hooks/useFileActions";
import { checkSelectionFiles } from "~/utils/helpers";
import { FILES_MENUS } from "~/constants/fileBrowser";
import { File, FileTypes } from "~/types/file.types";
import Accounts from "~/components/molecules/Accounts";
import FilesViews from "../FilesViews/FilesViews";
import InlineStack from "~/components/molecules/InlineStack";
import { useGallery } from "~/hooks/useGallery";
import SearchBox from "../SearchBox/SearchBox";
import { useState } from "@wordpress/element";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import Uploader from "../Uploader/Uploader";
import { useFiles } from "~/hooks/useFiles";
import Sidebar from "~/components/molecules/Sidebar";
import { FontSize } from "~/types/styles";
import { isFolder } from "~/utils/file";
import Topbar from "~/components/molecules/Topbar";
import Button from "~/components/atoms/Button";
import { TLayout } from "~/types/ui";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";
import { useAppSelector } from "~/store/hooks";
import { selectAuth } from "~/store/features/authSlice";
import Login from "../Login/Login";
import IconButton from "~/components/molecules/IconButton";
import { toBoolean } from "~/utils/functions";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "~/store/store";
import MainRoute from "~/Routes/MainRoute";
import AuthRoute from "~/Routes/AuthRoute";

export type FileSelectorContentProps = {
    fileTypes?: FileTypes[];
    prevSelectedFiles?: File[];
    onClose?: () => void;
    onConfirm?: (
        files: { fileKey: string; name: string; extension: string }[],
    ) => void;
};

export function FileSelectorContent({
    onConfirm,
    fileTypes,
    prevSelectedFiles,
    onClose,
}: FileSelectorContentProps) {
    const { activeAccount } = useAppSelector(selectAuth);
    const [showUploader, setShowUploader] = useState(false);
    const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
    const [selectedFiles, setSelectedFiles] = useState<File[]>(
        prevSelectedFiles || [],
    );
    const [layout, setLayout] = useState<TLayout>("grid");

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
    } = useFiles("my-drive", false, fileTypes);

    const { createFolder } = useFileActions();

    const { activeFolder, order, orderBy } = queryArgs;

    const { viewFile } = useGallery(files);

    const handleSelectFile = (newSelectedFiles: File | File[]) => {
        if (fileTypes?.includes("downloadable")) {
            if (Array.isArray(newSelectedFiles)) {
                const isFolderExists = newSelectedFiles.some((file) => {
                    return isFolder(file.extension || "");
                });
                if (isFolderExists) {
                    newSelectedFiles = newSelectedFiles.filter(
                        (file) => !isFolder(file.extension || ""),
                    );
                }
            } else {
                if (isFolder(newSelectedFiles.extension || "")) {
                    return;
                }
            }
        }
        const _newSelectedFiles = checkSelectionFiles(
            newSelectedFiles,
            selectedFiles,
        );
        setSelectedFiles(_newSelectedFiles);
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file.extension || "")) {
            openFolder(file.fileKey);
        } else {
            viewFile(file.fileKey);
        }
    };

    const search = (
        <SearchBox
            activeFolder={activeFolder}
            isCompact
            fileType={false}
            queryArgs={queryArgs}
            setQueryArgs={setQueryArgs}
        />
    );

    const refreshButton = (
        <Button variant="outlined" onClick={refresh}>
            <Icon
                name="autorenew"
                fontSize="lg"
                className={clsx(loading && "loading")}
            />
            {__("Refresh", "ninja-drive")}
        </Button>
    );

    const profile = <Accounts />;

    const uploader = (
        <Uploader
            heightFull={false}
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
            }}
            onClose={() => setShowUploader(false)}
        />
    );

    const rightContents = [refreshButton, profile];
    if (toBoolean(pnpnd.isPro) && !pnpnd?.currentUser?.can?.hasFullAccess) {
        rightContents.pop();
    }

    return (
        <MemoryRouter initialEntries={["/file-browser/:menuKey"]}>
            <Provider store={store}>
                <CustomAlertProvider>
                    <MainRoute>
                        <AuthRoute>
                            <IconButton
                                variant="error"
                                size="extrasmall"
                                name="close"
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "20px",
                                    zIndex: 99999,
                                }}
                                onClick={onClose}
                            />

                            {activeAccount === null ? (
                                <Login />
                            ) : (
                                <>
                                    <MainLayout>
                                        <Sidebar
                                            localStorageKey={
                                                "pnpnd-file-selector"
                                            }
                                            defaultCollapsed
                                            style={{
                                                borderRadius: "8px 0 0 8px",
                                            }}
                                        >
                                            <Sidebar.Menu>
                                                <Sidebar.DropdownItem
                                                    activeKey={activeFolder}
                                                    childrenItems={[
                                                        ...(activeFolder ===
                                                        "home"
                                                            ? [
                                                                  {
                                                                      key: "home",
                                                                      title: __(
                                                                          "Home",
                                                                          "ninja-drive",
                                                                      ),
                                                                      icon: "home",
                                                                      iconSize:
                                                                          "2xl" as FontSize,
                                                                      onClick:
                                                                          () =>
                                                                              openFolder(
                                                                                  "home",
                                                                              ),
                                                                  },
                                                              ]
                                                            : []),

                                                        ...FILES_MENUS.map(
                                                            (menu) => ({
                                                                key: menu.key,
                                                                title: menu.title,
                                                                svgIcon:
                                                                    menu.icon,
                                                                onClick: () =>
                                                                    openFolder(
                                                                        menu.key,
                                                                    ),
                                                            }),
                                                        ),
                                                    ]}
                                                />
                                            </Sidebar.Menu>

                                            <Sidebar.Bottom
                                                helpCenter={false}
                                            />
                                        </Sidebar>

                                        <MainLayout.ContentWrapper>
                                            <Topbar
                                                leftContents={[search]}
                                                rightContents={rightContents}
                                                style={{
                                                    borderRadius: "0 8px 0 0",
                                                }}
                                            />

                                            <MainLayout.Content
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "20px",
                                                }}
                                            >
                                                <FilesViews
                                                    onFileClick={
                                                        handleSelectFile
                                                    }
                                                    onFileDoubleClick={
                                                        handleDoubleClick
                                                    }
                                                    isFileSelecting={true}
                                                    setIsFileSelecting={() => {}}
                                                    layout={layout}
                                                    setLayout={setLayout}
                                                    files={files}
                                                    activeFolder={activeFolder}
                                                    breadcrumbs={breadcrumbs}
                                                    openFolder={openFolder}
                                                    activeFile={activeFile}
                                                    setActiveFile={
                                                        setActiveFile
                                                    }
                                                    selectedFiles={
                                                        selectedFiles
                                                    }
                                                    setSelectedFiles={
                                                        handleSelectFile
                                                    }
                                                    filesStatus={{
                                                        loading,
                                                        loadingMore,
                                                        hasMore,
                                                    }}
                                                    showUploader={showUploader}
                                                    setShowUploader={
                                                        setShowUploader
                                                    }
                                                    sorting={{ order, orderBy }}
                                                    setSorting={(value) =>
                                                        setQueryArgs({
                                                            ...queryArgs,
                                                            ...value,
                                                        })
                                                    }
                                                >
                                                    <InlineStack
                                                        align="between"
                                                        gap={10}
                                                        wrap={false}
                                                    >
                                                        <FilesViews.Breadcrumbs />

                                                        <FilesViews.Actions
                                                            isCompact
                                                            createFolder={
                                                                createFolder
                                                            }
                                                        />
                                                    </InlineStack>

                                                    <FilesViews.Header />

                                                    <FilesViews.Files
                                                        style={{
                                                            marginTop: "20px",
                                                            paddingBottom:
                                                                "80px",
                                                        }}
                                                    />

                                                    {hasMore && (
                                                        <div
                                                            ref={loadMoreRef}
                                                            style={{
                                                                height: "20px",
                                                                marginTop:
                                                                    "-20px",
                                                            }}
                                                        />
                                                    )}

                                                    {showUploader && uploader}
                                                </FilesViews>

                                                <SelectedFileList
                                                    selectedFiles={
                                                        selectedFiles
                                                    }
                                                    setSelectedFiles={
                                                        setSelectedFiles
                                                    }
                                                />
                                            </MainLayout.Content>
                                        </MainLayout.ContentWrapper>
                                    </MainLayout>

                                    <div
                                        style={{
                                            borderRadius: "0 0 8px 8px",
                                        }}
                                        className="pn-alert-buttons"
                                    >
                                        <button
                                            className="pn-alert-button pn-alert-cancel-button"
                                            onClick={onClose}
                                        >
                                            {__("Cancel", "ninja-drive")}
                                        </button>

                                        <button
                                            className="pn-alert-button pn-alert-confirm-button info"
                                            onClick={() => {
                                                onConfirm?.(
                                                    selectedFiles.map((f) => ({
                                                        fileKey: f.fileKey,
                                                        name: f.name,
                                                        extension:
                                                            f.extension || "",
                                                    })),
                                                );
                                            }}
                                        >
                                            {__("OK", "ninja-drive")}
                                        </button>
                                    </div>
                                </>
                            )}
                        </AuthRoute>
                    </MainRoute>
                </CustomAlertProvider>
            </Provider>
        </MemoryRouter>
    );
}

export function useFileSelector() {
    const { showAlert, closeAlert } = useCustomAlert();

    const id = "pnpnd-file-selector-modal";
    const openFileSelector = (props: FileSelectorContentProps) => {
        const { onClose, onConfirm } = props;
        showAlert({
            id: id,
            type: "info",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            html: (
                <FileSelectorContent
                    {...props}
                    onClose={() => {
                        closeAlert("pnpnd-file-selector-modal");
                        onClose?.();
                    }}
                    onConfirm={(files) => {
                        onConfirm?.(files);
                        closeAlert("pnpnd-file-selector-modal");
                    }}
                />
            ),
            width: "90vw",
            height: "85vh",
        });
    };
    return { openFileSelector };
}
