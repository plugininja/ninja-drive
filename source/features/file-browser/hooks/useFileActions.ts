import { useDownloadLink } from "~/shared/file-operations/components/DownloadLink";
import { useShareLink } from "~/shared/file-operations/components/ShareLink";
import { selectFile } from "~features/file-browser/state/manageFileSlice";
import { File } from "~features/file-browser/types/file.types";
import { isFolder } from "~features/file-browser/utils/file";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useAppDispatch } from "~kernel/store/hooks";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import {
    useCreateFolderMutation,
    useDeleteFilesMutation,
    useOpenInGoogleDriveMutation,
    useRenameFileMutation,
} from "~features/file-browser/api/fileApi";

export const useFileActions = () => {
    const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
    const { showAlert } = useCustomAlert();
    const { openShareLink } = useShareLink();
    const { openDownloadLink } = useDownloadLink();
    const dispatch = useAppDispatch();

    const [deleteFiles] = useDeleteFilesMutation();
    const [openInGoogleDrive] = useOpenInGoogleDriveMutation();
    const [renameFile] = useRenameFileMutation();
    const [createFolderMutation] = useCreateFolderMutation();

    const createFolder = async (
        activeFolderKey: string,
        widget_id?: string,
    ) => {
        showAlert({
            type: "info",
            showIcon: false,
            title: __("Create a folder", "ninja-drive"),
            input: "text",
            inputValue: "New Folder",
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
                        file_key:
                            activeFolderKey === "/"
                                ? "my-drive"
                                : activeFolderKey,
                        name:
                            String(inputValue) ||
                            __("New Folder", "ninja-drive"),
                        widget_id,
                    }).unwrap();

                    if (res.success) {
                        showAlert({
                            toast: true,
                            type: "success",
                            text:
                                res.message ||
                                __("Create Successfully!", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    } else {
                        showAlert({
                            toast: true,
                            type: "error",
                            text:
                                res.message ||
                                __("Create Failed!", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Folder Create Failed!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleDelete = async (
        file_keys: string[],
        active_folder_key: string,
        widget_id?: string,
        onSuccess?: () => void,
    ) => {
        showAlert({
            type: "error",
            title: __("Delete?", "ninja-drive"),
            text: __(
                "Are you sure you want to delete this file?",
                "ninja-drive",
            ),
            showConfirmButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            showCancelButton: true,
            icon: "question",
            width: "450px",
            onConfirm: async () => {
                try {
                    const res = await deleteFiles({
                        file_keys,
                        parent_key: active_folder_key,
                        widget_id,
                    }).unwrap();

                    dispatch(selectFile([]));

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            res?.message ||
                            __("Deleted Successfully!", "ninja-drive"),
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
                            __(
                                "Delete Failed! Please try again.",
                                "ninja-drive",
                            ),
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
        active_folder_key: string,
        widget_id?: string,
    ) => {
        showAlert({
            type: "info",
            showIcon: false,
            title: __("Rename this file", "ninja-drive"),
            input: "text",
            inputValue: file?.additional_data?.base_name,
            inputSuffix: isFolder(file?.mime_type)
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
                        file_key: file?.file_key,
                        name:
                            String(inputValue) ||
                            file?.additional_data?.base_name ||
                            file?.name,
                        parent_key: active_folder_key,
                        widget_id,
                    });

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            res.data?.message ||
                            __("Rename Successfully!", "ninja-drive"),
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
                            __(
                                "Rename Failed! Please try again.",
                                "ninja-drive",
                            ),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const download = (file: File, widget_id?: string, extension?: string) => {
        const { file_key, name, extension: fileExtension } = file;

        try {
            const downloadUrl = PNPNDHelper.getUrl(
                "download",
                file_key,
                name,
                widget_id,
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
                text:
                    error?.data?.message ||
                    __("An unexpected error occurred.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            console.error(error);
        }
    };

    const openGoogleDrive = async (file: File, widget_id?: string) => {
        try {
            const res = await openInGoogleDrive({
                file_key: file.file_key,
                widget_id,
            }).unwrap();

            const previewUrl = res.data;

            showAlert({
                toast: true,
                type: "success",
                text:
                    res?.message ||
                    __("Opening in Google Drive...", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            window.open(previewUrl, "_blank");
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Invalid response from server", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            console.error(error);
        }
    };

    const share = (file: File, widget_id?: string) => {
        openShareLink({
            file,
            widget_id,
            onConfirm: async (file_key) => {},
        });
    };

    const downloadLinkOpen = (file: File) => {
        openDownloadLink({
            file,
            onConfirm: async (file_key) => {},
        });
    };

    const actionExecuter = async (
        actionId: string,
        file: File,
        active_folder_key: string,
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
            case "rename":
                rename(file, active_folder_key);
                break;
            case "delete":
                handleDelete([file?.file_key], active_folder_key);
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
        rename,
        deleteFile: handleDelete,
        actionExecuter,
    };
};
