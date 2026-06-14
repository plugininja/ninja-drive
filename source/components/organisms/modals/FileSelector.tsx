import SelectedFileList from "../ModuleBuilder/pages/Source/SelectedFileList";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import { useEffect, useRef, useState } from "@wordpress/element";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import { selectAuth } from "~/store/features/authSlice";
import { useFileActions } from "~/hooks/useFileActions";
import Accounts from "~/components/molecules/Accounts";
import { checkSelectionFiles } from "~/utils/helpers";
import { FILES_MENUS } from "~/constants/fileBrowser";
import Sidebar from "~/components/molecules/Sidebar";
import { File, FileTypes } from "~/types/file.types";
import Topbar from "~/components/molecules/Topbar";
import FilesViews from "../FilesViews/FilesViews";
import { useGallery } from "~/hooks/useGallery";
import { MemoryRouter } from "react-router-dom";
import SearchBox from "../SearchBox/SearchBox";
import Button from "~/components/atoms/Button";
import { useAppSelector } from "~/store/hooks";
import { toBoolean } from "~/utils/functions";
import Uploader from "../Uploader/Uploader";
import { useFiles } from "~/hooks/useFiles";
import MainRoute from "~/Routes/MainRoute";
import Icon from "~/components/atoms/Icon";
import AuthRoute from "~/Routes/AuthRoute";
import { FontSize } from "~/types/styles";
import { isFolder } from "~/utils/file";
import { Provider } from "react-redux";
import { store } from "~/store/store";
import { TLayout } from "~/types/ui";
import { __ } from "@wordpress/i18n";
import Login from "../Login/Login";
import clsx from "clsx";
import {
    CustomAlertProvider,
    useCustomAlert,
} from "~/components/molecules/Alert";

export type FileSelectorContentProps = {
    fileTypes?: FileTypes[];
    prevSelectedFiles?: File[];
    onClose?: () => void;
    onConfirm?: (
        files: { file_key: string; name: string; extension: string }[],
    ) => void;
};

export function FileSelectorContent({
    onConfirm,
    fileTypes,
    prevSelectedFiles,
    onClose,
}: FileSelectorContentProps) {
    const { active_account } = useAppSelector(selectAuth);
    const [showUploader, setShowUploader] = useState(false);
    const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
    const [selected_files, setSelectedFiles] = useState<File[]>(
        prevSelectedFiles || [],
    );
    const [layout, setLayout] = useState<TLayout>("grid");

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
    } = useFiles("my-drive", false, fileTypes);

    const initialized = useRef(false);

    useEffect(() => {
        if (
            initialized.current ||
            !files?.length ||
            !prevSelectedFiles?.length
        ) {
            return;
        }

        const mergedSelectedFiles = prevSelectedFiles.map(
            (prevFile) =>
                files.find((file) => file.file_key === prevFile.file_key) ||
                prevFile,
        );

        setSelectedFiles(mergedSelectedFiles);
        initialized.current = true;
    }, [files, prevSelectedFiles]);

    const { createFolder } = useFileActions();

    const { active_folder, order, order_by } = queryArgs;

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
            selected_files,
        );
        setSelectedFiles(_newSelectedFiles);
    };

    const handleDoubleClick = (file: File) => {
        if (isFolder(file.extension || "")) {
            openFolder(file.file_key);
        } else {
            viewFile(file.file_key);
        }
    };

    const search = (
        <SearchBox
            activeFolder={active_folder}
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
                maxFileSize: pnpnd.is_pro !== "1" ? 5 : 0,
                activeFolder: active_folder,
                onFileUpload: () => {},
                setIsUploading: setShowUploader,
                uploadImmediately: true,
                enableFolderUpload: true,
            }}
            onClose={() => setShowUploader(false)}
        />
    );

    const rightContents = [refreshButton, profile];

    if (
        toBoolean(pnpnd.is_pro) &&
        !pnpnd?.current_user?.can?.has_full_access &&
        !pnpnd?.current_user?.can?.accounts_connect &&
        !pnpnd?.current_user?.can?.accounts_manage
    ) {
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
                                    background: "var(--pnpnd-white)",
                                    position: "absolute",
                                    top: "-30px",
                                    right: "-30px",
                                    zIndex: 99999,
                                }}
                                onClick={onClose}
                            />

                            {active_account === null ? (
                                <Login />
                            ) : (
                                <>
                                    <MainLayout
                                        style={{
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                        }}
                                    >
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
                                                    activeKey={active_folder}
                                                    childrenItems={[
                                                        ...(active_folder ===
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
                                                                iconUrl:
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
                                                    padding: "20px",
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
                                                    activeFolder={active_folder}
                                                    breadcrumbs={breadcrumbs}
                                                    openFolder={openFolder}
                                                    activeFile={activeFile}
                                                    setActiveFile={
                                                        setActiveFile
                                                    }
                                                    selected_files={
                                                        selected_files
                                                    }
                                                    setSelectedFiles={
                                                        handleSelectFile
                                                    }
                                                    filesStatus={{
                                                        loading,
                                                        loadingMore,
                                                        has_more,
                                                    }}
                                                    showUploader={showUploader}
                                                    setShowUploader={
                                                        setShowUploader
                                                    }
                                                    sorting={{
                                                        order,
                                                        order_by,
                                                    }}
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
                                                                "190px",
                                                        }}
                                                    />

                                                    {has_more && (
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
                                                    selected_files={
                                                        selected_files
                                                    }
                                                    setSelectedFiles={
                                                        setSelectedFiles
                                                    }
                                                    style={{
                                                        marginBottom: "170px",
                                                    }}
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
                                                    selected_files.map((f) => ({
                                                        file_key: f.file_key,
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
