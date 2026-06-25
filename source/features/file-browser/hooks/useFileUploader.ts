import { useEffect, useRef, useState } from "@wordpress/element";
import { File } from "~features/file-browser/types/file.types";
import { widgetApi } from "~kernel/store/widgetCacheBridge";
import { useAppDispatch } from "~kernel/store/hooks";
import { toBoolean } from "~kernel/utils/functions";
import { __ } from "@wordpress/i18n";
import plupload from "plupload";
import {
    fileApi,
    useLazyUploadedFileQuery,
    useUploadUrlMutation,
} from "~features/file-browser/api/fileApi";

export interface IRawFile {
    id: string;
    name: string;
    type: string;
    size: number;
    percent: number;
    status: string;
    error?: string;
    getNative?: any;
    parentFolder?: string;
}

export interface UploaderData {
    onFileUpload: (file: File) => void;
    onUploadComplete?: () => void;
    setIsUploading: (value: boolean) => void;
    initUploadedFiles?: IRawFile[];
    allowMultipleUpload?: boolean;
    fileUploaderPreviewMode?: boolean;
    enableRootUpload?: boolean;
    maxFileSize?: number;
    minFileSize?: number;
    max_files?: number;
    enableFolderUpload?: boolean;
    showUploadConfirmation?: boolean;
    uploadConfirmationMessage?: string;
    allowAllExtensions?: boolean;
    allowExtensions?: string;
    allowExceptExtensions?: string;
    uploadImmediately?: boolean;
    activeFolder?: string;
    isFormUploader?: boolean;
    isPro?: boolean;
    widget_id?: string;
    uploadedFilesKeys?: string[];
    selectedFolder?: string;
}

const useFileUploader = (
    data: UploaderData,
    containerRef: React.RefObject<HTMLDivElement>,
) => {
    const {
        maxFileSize = 300,
        minFileSize = 0,
        max_files = 10000,
        enableFolderUpload = false,
        showUploadConfirmation = false,
        initUploadedFiles = [],
        isFormUploader = false,
        uploadImmediately = true,
        allowAllExtensions = false,
        allowExtensions = "",
        allowExceptExtensions = "",
        activeFolder = "",
        onFileUpload = () => {},
        widget_id = "",
        onUploadComplete = () => {},
        selectedFolder = "",
    } = data;

    const [getResumeUploadUrl] = useUploadUrlMutation();
    const [getUploadedFile] = useLazyUploadedFileQuery();

    const [files, setFiles] = useState<IRawFile[]>(initUploadedFiles);
    const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    const uploaderRef = useRef<any>(null);
    const activeFolderRef = useRef<string>(activeFolder);
    const submitButtonTextRef = useRef(null);
    const submitButtonRef = useRef<any>(null);
    const browseFilesId = useRef(
        `browse-files-${data.widget_id}-${crypto.randomUUID()}`,
    );
    const browseFolderId = useRef(
        `browse-folder-${data.widget_id}-${crypto.randomUUID()}`,
    );

    useEffect(() => {
        activeFolderRef.current = activeFolder;
    }, [activeFolder]);

    const validateFileExtension = (allowed: any, file: any, callback: any) => {
        if (!allowed) return callback(true);
        const extension = file.name.split(".").pop();
        const isValid = toBoolean(allowAllExtensions)
            ? !allowed
                  .split(",")
                  .map((ext: string) => ext.trim())
                  .includes(extension)
            : allowed
                  .split(",")
                  .map((ext: string) => ext.trim())
                  .includes(extension);

        if (isValid) {
            callback(true);
        } else {
            uploaderRef.current.trigger("Error", { code: "EXT_ERROR", file });
            callback(false);
        }
    };

    const validateMinFileSize = (size: any, file: any, callback: any) => {
        if (!(size = 1024 * size * 1024)) return callback(true);
        if (file.size < size) {
            uploaderRef.current.trigger("Error", {
                code: "SIZE_MIN_ERROR",
                file,
            });
            callback(false);
        } else {
            callback(true);
        }
    };

    const validateMaxFiles = (max: any, file: any, callback: any) => {
        if (!max) return callback(true);
        let count = uploaderRef.current.files.length;
        if (initUploadedFiles.length) {
            count = containerRef.current?.querySelectorAll(
                ".file-list-item.uploaded",
            ).length;
        }
        if (count >= max) {
            uploaderRef.current.trigger("Error", {
                code: "FILES_MAX_ERROR",
                file,
            });
            callback(false);
        } else {
            callback(true);
        }
    };

    const uploadNextFile = async () => {
        const up = uploaderRef.current;
        if (!up) return;

        const nextFile = up.files.find(
            (f: any) =>
                f.status !== plupload.DONE && f.status !== plupload.UPLOADING,
        );

        if (!nextFile) {
            setIsUploadComplete(true);
            return;
        }

        setFiles((prev) =>
            prev.map((f) =>
                f.id === nextFile.id
                    ? { ...f, percent: 0, status: "uploading" }
                    : f,
            ),
        );

        try {
            const parentFolder =
                up.getOption("activeFolder") || activeFolderRef.current;

            const post_id = widget_id
                ? Number(
                      document
                          .getElementById(`pnpnd-widget-${widget_id}`)
                          ?.getAttribute("data-post_id") || "",
                  ) || undefined
                : undefined;

            const queue_index = uploaderRef.current.files.findIndex(
                (f: IRawFile) => f.id === nextFile.id,
            );

            const response = await getResumeUploadUrl({
                folder_key:
                    parentFolder === "my-drive" ? "/" : parentFolder || "",
                widget_id,
                name: nextFile.name,
                size: nextFile.size,
                type: nextFile.type,
                queue_index: queue_index,
                post_id,
            }).unwrap();

            if (!response.data) return;

            const { url, uploadId } = response.data;

            up.setOption("url", url);
            up.setOption("uploadId", uploadId);
            up.setOption(
                "folder_key",
                parentFolder === "my-drive" ? "/" : parentFolder,
            );

            up.start();
        } catch (err) {
            console.error("Failed to get upload URL", err);
        }
    };

    const getPluploadConfig = () => {
        const config: any = {
            container: containerRef.current,
            browse_button: browseFilesId.current,
            drop_element: containerRef.current,
            multipart: false,
            multi_selection: widget_id
                ? toBoolean(data?.allowMultipleUpload || false)
                : true,
            filters: {
                max_files: max_files,
                file_ext: toBoolean(allowAllExtensions)
                    ? allowExceptExtensions.replace(/ /g, "")
                    : allowExtensions.replace(/ /g, ""),
                max_file_size: maxFileSize ? `${maxFileSize}mb` : 0,
                min_file_size: minFileSize,
            },
            init: {
                FilesAdded: (up: any, newFiles: IRawFile[]) => {
                    setFiles((prev) => [
                        ...prev,
                        ...newFiles.map((f) => ({
                            id: f.id || "",
                            name: f.name || "",
                            type: f.type || "",
                            size: f.size || 0,
                            percent: 0,
                            status: "queued",
                            parentFolder: activeFolderRef.current || "",
                        })),
                    ]);
                    if (uploadImmediately) {
                        up.setOption(
                            "activeFolder",
                            activeFolderRef.current || "",
                        );
                        uploadNextFile();
                    }
                },
                UploadProgress(up: any, file: IRawFile) {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === file.id
                                ? {
                                      ...f,
                                      percent: file.percent,
                                      status: "uploading",
                                  }
                                : f,
                        ),
                    );
                },
                FilesRemoved: (_up: any, files: IRawFile[]) => {
                    setFiles((prev: any) =>
                        prev.filter(
                            (f: any) => !files.find((rf) => rf.id === f.id),
                        ),
                    );
                },
                FileUploaded: (up: any, file: IRawFile, info: any) => {
                    up.stop();
                    const response = JSON.parse(info.response);

                    if (response) {
                        const uploadId = up.getOption("uploadId");
                        const folder_key = up.getOption("folder_key");
                        uploadNextFile();
                        getUploadedFile({
                            file_id: response.id,
                            upload_id: uploadId,
                            folder_key: folder_key,
                            widget_id,
                        })
                            .unwrap()
                            .then((res) => {
                                if (!res.data) return;
                                setFiles((prev) =>
                                    prev.map((f) =>
                                        f.id === file.id
                                            ? {
                                                  ...f,
                                                  percent: 100,
                                                  status: "done",
                                              }
                                            : f,
                                    ),
                                );
                                onFileUpload(res.data);
                                const parentFolder =
                                    up.getOption("activeFolder");
                                if (widget_id) {
                                    const folder_key =
                                        parentFolder || activeFolderRef.current;

                                    dispatch(
                                        widgetApi.util.updateQueryData(
                                            "getModuleFiles",
                                            {
                                                file_key:
                                                    folder_key ===
                                                    selectedFolder
                                                        ? "/"
                                                        : folder_key,
                                                id: widget_id,
                                                search:
                                                    folder_key === "/"
                                                        ? null
                                                        : "",
                                            },
                                            (draft) => {
                                                if (!res.data || !draft.data) {
                                                    return;
                                                }
                                                if (
                                                    !draft.data.widget.data
                                                        .source.files
                                                ) {
                                                    draft.data.widget.data.source.files =
                                                        [];
                                                }

                                                draft?.data?.widget.data.source.files.unshift(
                                                    res.data,
                                                );
                                            },
                                        ),
                                    );
                                } else {
                                    dispatch(
                                        fileApi.util.updateQueryData(
                                            "getFiles",
                                            {
                                                file_key:
                                                    parentFolder ||
                                                    activeFolderRef.current,
                                            },
                                            (draft) => {
                                                if (!draft?.data?.files) return;

                                                if (!res.data) return;

                                                draft.data.files.unshift(
                                                    res.data,
                                                );
                                            },
                                        ),
                                    );
                                }
                            });
                    }
                },

                UploadComplete: (up: any) => {
                    up.setOption(
                        "activeFolder",
                        activeFolderRef.current === "my-drive"
                            ? "/"
                            : activeFolderRef.current,
                    );
                    setIsUploadComplete(true);
                },
                Error: (_up: any, err: any) => {
                    let errorMessage;
                    switch (err.code) {
                        case -600:
                            errorMessage = `${__(
                                "File size exceeds the maximum upload size.",
                                "ninja-drive",
                            )} (${maxFileSize ? `${maxFileSize}mb` : 0})`;
                            break;
                        case "SIZE_MIN_ERROR":
                            errorMessage = `${__(
                                "File size is less than the minimum upload size.",
                                "ninja-drive",
                            )} (${minFileSize}mb)`;
                            break;
                        case "EXT_ERROR":
                            errorMessage = __(
                                "This file type is not allowed",
                                "ninja-drive",
                            );
                            break;
                        case "FILES_MAX_ERROR":
                            errorMessage = `${__(
                                "You can not upload more than",
                                "ninja-drive",
                            )} ${max_files} ${__("files", "ninja-drive")}`;
                            break;
                        default:
                            errorMessage = err.error;
                    }

                    err.file.error = errorMessage;
                    if (err.file) {
                        err.file.error = errorMessage;
                        setFiles((prev) => {
                            const index = prev.findIndex(
                                (f) => f.id === err.file.id,
                            );
                            if (index > -1) {
                                const newFiles = [...prev];
                                newFiles[index] = err.file;
                                return newFiles;
                            }
                            return [...prev, err.file];
                        });
                    }
                },
            },
        };
        return config;
    };

    const initializeUploader = () => {
        if (!containerRef.current) return;
        plupload.buildUrl = (url: string) => url;
        plupload.addFileFilter("file_ext", validateFileExtension);
        plupload.addFileFilter("min_file_size", validateMinFileSize);
        plupload.addFileFilter("max_files", validateMaxFiles);

        uploaderRef.current = new plupload.Uploader(getPluploadConfig());
        uploaderRef.current.init();

        const browseFolder = document.getElementById(browseFolderId.current);
        if (toBoolean(enableFolderUpload) && browseFolder) {
            const folderInput = new mOxie.FileInput({
                browse_button: browseFolder,
                directory: true,
            });
            folderInput.init();
            folderInput.onchange = () => {
                uploaderRef.current.addFile(folderInput.files);
            };
        }
    };

    useEffect(() => {
        initializeUploader();
        return () => {
            if (uploaderRef.current) {
                uploaderRef.current.destroy();
                uploaderRef.current.refresh();
            }
        };
    }, []);

    useEffect(() => {
        if (isUploadComplete) {
            uploaderRef.current.setOption(
                "activeFolder",
                activeFolderRef.current,
            );
            setTimeout(() => {
                onUploadComplete();
            }, 2000);
        }
    }, [isUploadComplete]);

    useEffect(() => {
        if (
            files.length &&
            !isUploadComplete &&
            isFormUploader &&
            !uploadImmediately &&
            !!containerRef.current
        ) {
            const $form = jQuery(containerRef.current).closest("form");
            if ($form.length) {
                submitButtonRef.current = $form.find(":submit");
                if (submitButtonRef.current) {
                    const $parent = submitButtonRef.current?.parent();
                    const handleClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        submitButtonRef.current.addClass("pnpnd-disabled");
                        submitButtonTextRef.current =
                            submitButtonRef.current.is("input")
                                ? submitButtonRef.current.val()
                                : submitButtonRef.current.text();
                        submitButtonRef.current.is("input")
                            ? submitButtonRef.current.val(
                                  __("Uploading Files...", "ninja-drive"),
                              )
                            : submitButtonRef.current.text(
                                  __("Uploading Files...", "ninja-drive"),
                              );
                        startUpload();
                    };
                    $parent.on("click", handleClick);

                    return () => {
                        if (submitButtonRef.current) {
                            $parent.off("click", handleClick);
                            submitButtonRef.current.removeClass(
                                "pnpnd-disabled",
                            );
                        }
                    };
                }
            }
        }
    }, [files, isFormUploader, uploadImmediately, isUploadComplete]);

    useEffect(() => {
        if (isUploadComplete && isFormUploader && submitButtonRef.current) {
            const $btn = submitButtonRef.current;

            // restore button text
            if ($btn.is("input")) {
                $btn.val(submitButtonTextRef.current);
            } else {
                $btn.text(submitButtonTextRef.current);
            }

            // enable button
            $btn.removeClass("pnpnd-disabled");

            // submit form
            const $form = $btn.closest("form");
            if ($form.length) {
                $form.trigger("submit");
            }
        }
    }, [isUploadComplete, isFormUploader]);

    const startUpload = () => {
        if (uploaderRef.current) {
            uploaderRef.current.setOption(
                "activeFolder",
                activeFolderRef.current || "",
            );
            uploadNextFile();
        }
    };

    const removeFile = (id: string) => {
        const file = uploaderRef.current.files.find(
            (f: IRawFile) => f.id === id,
        );
        if (file) uploaderRef.current.removeFile(file);
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const getFilteredFiles = (filter: "all" | "completed" | "failed") => {
        const filteredFiles = files.filter(({ id, error }) => {
            if (filter === "completed") {
                return files
                    .filter((f) => f.status === "done")
                    .find((f) => f.id === id);
            } else if (filter === "failed") {
                return !!error;
            } else {
                return true;
            }
        });
        return filteredFiles;
    };

    const showConfirmation =
        !toBoolean(isFormUploader) &&
        !toBoolean(uploadImmediately) &&
        toBoolean(showUploadConfirmation) &&
        isUploadComplete;

    const fileCount =
        files.length || files.filter((file) => !file.error).length;

    const hasUploading = files.some((f) => f.status === "uploading");

    const hasDone = files.length > 0 && files.every((f) => f.status === "done");

    const statusText = hasUploading
        ? __("Item(s) Uploading...", "ninja-drive")
        : hasDone
        ? __("Item(s) Uploaded", "ninja-drive")
        : files.length > 0
        ? __("Item(s) Selected", "ninja-drive")
        : __("No items selected", "ninja-drive");
    return {
        showConfirmation,
        fileCount,
        statusText,
        files,
        uploaderRef,
        setFiles,
        setIsUploadComplete,
        isUploadComplete,
        removeFile,
        startUpload,
        isUploadStarted: hasUploading,
        getFilteredFiles,
        browseFilesId: browseFilesId.current,
        browseFolderId: browseFolderId.current,
    };
};

export default useFileUploader;
