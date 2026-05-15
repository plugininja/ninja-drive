import { __, sprintf } from "@wordpress/i18n";
import { selectFile } from "../store/features/manageFileSlice";
import { useDownloadLink } from "~/components/organisms/modals/DownloadLink";
import { useCustomAlert } from "~/components/molecules/Alert";
import { useCopyMoveAlert } from "~/components/organisms/modals/CopyMove";
import { useShareLink } from "~/components/organisms/modals/ShareLink";
import { useAppDispatch } from "../store/hooks";
import { useState } from "@wordpress/element";
import { File } from "~/types/file.types";
import {
    useCopyMutation,
    useCreateFolderMutation,
    useDeleteFilesMutation,
    useMoveMutation,
    useOpenInGoogleDriveMutation,
    useRenameFileMutation,
} from "../store/api/fileApi";
import { TBreadcrumb } from "~/types/ui";
import { isFolder } from "~/utils/file";

export const useFileActions = () => {
    const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
    const { showAlert } = useCustomAlert();
    const { openCopyMove } = useCopyMoveAlert();
    const { openShareLink } = useShareLink();
    const { openDownloadLink } = useDownloadLink();
    const dispatch = useAppDispatch();

    const [deleteFiles] = useDeleteFilesMutation();
    const [openInGoogleDrive] = useOpenInGoogleDriveMutation();
    const [renameFile] = useRenameFileMutation();
    const [createFolderMutation] = useCreateFolderMutation();
    const [moveFile] = useMoveMutation();
    const [copyFile] = useCopyMutation();

    const createFolder = async (activeFolderKey: string, widgetId?: string) => {
        showAlert({
            type: "info",
            showIcon: false,
            title: __("Create a folder", "ninja-drive"),
            input: "text",
            inputValue: "",
            inputPlaceholder: __("Enter new name", "ninja-drive"),
            showCancelButton: true,
            confirmButtonText: __("Create", "ninja-drive"),
            width: "450px",
            inputValidator: (value) => {
                if (!value) {
                    return __("Please enter a name!", "ninja-drive");
                }
                return null;
            },
            onConfirm: async (inputValue) => {
                try {
                    const res = await createFolderMutation({
                        fileKey:
                            activeFolderKey === "/"
                                ? "my-drive"
                                : activeFolderKey,
                        name: String(inputValue) || __("New Folder", "ninja-drive"),
                        widgetId,
                    }).unwrap();

                    if (res.success) {
                        showAlert({
                            toast: true,
                            type: "success",
                            text: res.message || __("Create Successfully!", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    } else {
                        showAlert({
                            toast: true,
                            type: "error",
                            text: res.message || __("Create Failed!", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text: error?.data?.message || __("Folder Create Failed!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleDelete = async (
        fileKeys: string[],
        activeFolderKey: string,
        widgetId?: string,
        onSuccess?: () => void,
    ) => {
        showAlert({
            type: "error",
            title: __("Delete this item?", "ninja-drive"),
            text: __("You won't be able to revert this!", "ninja-drive"),
            showConfirmButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            showCancelButton: true,
            icon: "question",
            width: "450px",
            onConfirm: async () => {
                try {
                    const res = await deleteFiles({
                        fileKeys,
                        parentKey: activeFolderKey,
                        widgetId,
                    }).unwrap();

                    dispatch(selectFile([]));

                    showAlert({
                        toast: true,
                        type: "success",
                        text: res?.message || __("Deleted Successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });

                    onSuccess?.();
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Delete Failed! Please try again.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const rename = async (
        file: File,
        activeFolderKey: string,
        widgetId?: string,
    ) => {
        showAlert({
            type: "info",
            showIcon: false,
            title: __("Rename this file", "ninja-drive"),
            input: "text",
            inputValue: file?.additionalData?.baseName,
            inputSuffix: isFolder(file?.mimeType)
                ? undefined
                : file?.extension
                ? `.${file?.extension}`
                : undefined,
            inputPlaceholder: __("Enter new name", "ninja-drive"),
            showCancelButton: true,
            confirmButtonText: __("Rename", "ninja-drive"),
            width: "450px",
            inputValidator: (value) => {
                if (!value) {
                    return __("Please enter a name!", "ninja-drive");
                }
                return null;
            },

            onConfirm: async (inputValue) => {
                try {
                    const res = await renameFile({
                        fileKey: file?.fileKey,
                        name:
                            String(inputValue) ||
                            file?.additionalData?.baseName ||
                            file?.name,
                        parentKey: activeFolderKey,
                        widgetId,
                    });

                    showAlert({
                        toast: true,
                        type: "success",
                        text: res.data?.message || __("Rename Successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Rename Failed! Please try again.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const download = (file: File, widgetId?: string, extension?: string) => {
        const { fileKey, name, extension: fileExtension } = file;

        try {
            const downloadUrl = PNPNDHelper.getUrl(
                "download",
                fileKey,
                name,
                widgetId,
                "xl",
                extension ? extension : fileExtension,
            );

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            showAlert({
                toast: true,
                type: "success",
                text: __("Download Started", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text: error?.data?.message || __("An unexpected error occurred.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            console.error(error);
        }
    };

    const openGoogleDrive = async (file: File, widgetId?: string) => {
        try {
            const res = await openInGoogleDrive({
                fileKey: file.fileKey,
                widgetId,
            }).unwrap();

            const previewUrl = res.data;

            showAlert({
                toast: true,
                type: "success",
                text: res?.message || __("Opening in Google Drive...", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            window.open(previewUrl, "_blank");
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text: error?.data?.message || __("Invalid response from server", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            console.error(error);
        }
    };

    const copy = ({
        file,
        widgetId,
        activeFolderKey,
        breadcrumbs,
    }: {
        file: File;
        widgetId?: string;
        activeFolderKey: string;
        breadcrumbs?: TBreadcrumb[];
    }) => {
        openCopyMove({
            mode: "copy",
            file,
            widgetId,
            breadcrumbs,
            onConfirm: async (folderKey) => {
                try {
                    const res = await copyFile({
                        currentFolderKey: activeFolderKey,
                        destination: folderKey,
                        fileKeys: [file.fileKey],
                        widgetId,
                    }).unwrap();

                    showAlert({
                        toast: true,
                        type: "success",
                        text: res?.message || __("Copy Successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Copy Failed! Please try again.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const move = ({
        file,
        widgetId,
        activeFolderKey,
        breadcrumbs,
    }: {
        file: File;
        widgetId?: string;
        activeFolderKey: string;
        breadcrumbs?: TBreadcrumb[];
    }) => {
        openCopyMove({
            mode: "move",
            file,
            widgetId,
            breadcrumbs,
            onConfirm: async (folderKey) => {
                try {
                    const res = await moveFile({
                        currentFolderKey: activeFolderKey,
                        destination: folderKey,
                        fileKeys: [file?.fileKey],
                        widgetId,
                    }).unwrap();

                    showAlert({
                        toast: true,
                        type: "success",
                        text: res?.message || __("Move Successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Move Failed! Please try again.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const share = (file: File, widgetId?: string) => {
        openShareLink({
            file,
            widgetId,
            onConfirm: async (fileKey) => {},
        });
    };

    const downloadLinkOpen = (file: File) => {
        openDownloadLink({
            file,
            onConfirm: async (fileKey) => {},
        });
    };

    const actionExecuter = async (
        actionId: string,
        file: File,
        activeFolderKey: string,
    ) => {
        switch (actionId) {
            case "open":
                openGoogleDrive(file);
                break;
            case "view-details":
                if (setActiveFile) setActiveFile(file);
                break;
            case "share":
                share(file);
                break;
            case "download":
                download(file);
                break;
            case "download-link":
                downloadLinkOpen(file);
                break;
            case "import":
                importToMedia(file?.fileKey, file?.mimeType);
                break;
            case "move":
                move({ file, activeFolderKey });
                break;
            case "rename":
                rename(file, activeFolderKey);
                break;
            case "copy":
                copy({ file, activeFolderKey });
                break;
            case "delete":
                handleDelete([file?.fileKey], activeFolderKey);
                break;
            default:
                break;
        }
    };

    return {
        activeFile,
        setActiveFile,
        createFolder,
        openGoogleDrive,
        viewDetails: setActiveFile,
        share,
        downloadLinkOpen,
        download,
        move,
        copy,
        rename,
        deleteFile: handleDelete,
        actionExecuter,
    };
};
