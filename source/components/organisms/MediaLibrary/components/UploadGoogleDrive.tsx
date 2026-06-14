import { useEffect, useRef, useState } from "@wordpress/element";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import { useUploadUrlMutation } from "~/store/api/fileApi";
import BlockStack from "~/components/molecules/BlockStack";
import FolderTree from "~/components/organisms/FolderTree";
import Button from "~/components/atoms/Button";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import fetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const createPluploadFileFromAttachment = async (attachment: any) => {
    const res = (await fetch(attachment.url)) as Response;
    const blob = await res.blob();

    const nativeFile = new File(
        [blob],
        attachment.filename || `file-${Date.now()}`,
        {
            type: attachment.mime || blob.type || "application/octet-stream",
            lastModified: Date.now(),
        },
    );

    return nativeFile;
};
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

export function UploadGoogleDriveContent({
    onClose,
    attachments,
}: {
    attachments: any[];
    onClose: () => void;
}) {
    const [files, setFiles] = useState<IRawFile[]>([]);
    const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
    const [selectedFolder, setSelectedFolder] = useState<{
        file_key: string;
        name: string;
    } | null>(null);

    const [getResumeUploadUrl] = useUploadUrlMutation();

    const uploaderRef = useRef<any>(null);
    const selectedFolderRef = useRef<{
        file_key: string;
        name: string;
    } | null>(null);

    useEffect(() => {
        selectedFolderRef.current = selectedFolder;
    }, [selectedFolder]);

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
            const response = await getResumeUploadUrl({
                folder_key:
                    selectedFolder?.file_key ||
                    selectedFolderRef.current?.file_key ||
                    "",
                widget_id: "",
                name: nextFile.name,
                size: nextFile.size,
                type: nextFile.type,
            }).unwrap();

            if (!response.data) return;

            const { url, uploadId } = response.data;

            up.setOption("url", url);
            up.setOption("uploadId", uploadId);

            up.start();
        } catch (err) {
            console.error("Failed to get upload URL", err);
        }
    };

    useEffect(() => {
        const uploader = new plupload.Uploader({
            url: "",
            multipart: false,
            browse_button: "upload",
            multi_selection: true,
            filters: {
                prevent_duplicates: true,
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
                        })),
                    ]);
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
                        uploadNextFile();
                    }
                },

                UploadComplete: (up: any) => {
                    setIsUploadComplete(true);
                },
                Error: (_up: any, err: any) => {
                    let errorMessage;
                    switch (err.code) {
                        case "EXT_ERROR":
                            errorMessage = __(
                                "This file type is not allowed",
                                "ninja-drive",
                            );
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
        });
        uploader.init();
        uploaderRef.current = uploader;
        return () => {
            if (uploaderRef.current) {
                uploaderRef.current.destroy();
            }
        };
    }, []);

    const onsubmit = async () => {
        if (!attachments.length || !selectedFolder || !uploaderRef.current)
            return;

        // Convert all attachments to files
        const generatedFiles = await Promise.all(
            attachments.map(async (attachment, index) => {
                const file = await createPluploadFileFromAttachment(attachment);
                // Add a unique ID to track the file
                return { ...file, id: `file-${index}-${Date.now()}` };
            }),
        );

        // Add all files to uploader and start
        uploaderRef.current.addFile(generatedFiles);
        uploadNextFile();
    };

    const getOverallProgress = () => {
        if (files.length === 0) return 0;
        const totalPercent = files.reduce((sum, item) => sum + item.percent, 0);
        return Math.round(totalPercent / files.length);
    };

    const uploading = files.some((f) => f.status === "uploading");

    const fileCount =
        files.length || files.filter((file) => !file.error).length;

    const completedCount = files.filter(
        (file) => file.status === "done",
    ).length;

    const overallProgress = getOverallProgress();

    return (
        <div
            className={clsx(
                "pnpnd-top-level-wrapper w-full",
                "pnpnd-upload-google-drive",
                (uploading || isUploadComplete) &&
                    "pnpnd-upload-google-drive--uploading",
            )}
        >
            <button id="upload" hidden>
                {__("Upload", "ninja-drive")}
            </button>

            <InlineStack align="center">
                <Text weight="medium">
                    {__("Upload to Google Drive", "ninja-drive")}
                </Text>
            </InlineStack>

            {uploading || isUploadComplete ? (
                <BlockStack marginTop={20} gap={20}>
                    <Card
                        padding={10}
                        background="primary-extralight"
                        rounded="md"
                    >
                        <InlineStack blockAlign="center" align="between">
                            <Text size="sm" weight="medium">
                                {__("Overall Progress", "ninja-drive")}
                            </Text>

                            <Text size="sm" weight="medium">
                                {completedCount}/{fileCount}{" "}
                                {__("files", "ninja-drive")}
                            </Text>
                        </InlineStack>

                        <div
                            style={{
                                height: "8px",
                                background: "#e0e0e0",
                                borderRadius: "4px",
                                marginTop: "8px",
                                marginBottom: "8px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${overallProgress}%`,
                                    height: "100%",
                                    transition: "width 0.3s ease",
                                }}
                                className="bg-primary"
                            />
                        </div>

                        <Text size="xs" align="right">
                            {overallProgress}%
                        </Text>
                    </Card>

                    <Card
                        padding={10}
                        background="primary-extralight"
                        rounded="md"
                        flex
                        direction="col"
                        gap={10}
                        style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                        }}
                    >
                        {files?.map((progress) => (
                            <Card
                                key={progress.id}
                                padding={8}
                                background="white"
                                rounded="sm"
                                style={{
                                    borderLeft: `4px solid ${
                                        progress.status === "completed"
                                            ? "#4caf50"
                                            : progress.status === "error"
                                            ? "#f44336"
                                            : progress.status === "uploading"
                                            ? "#2196f3"
                                            : "#9e9e9e"
                                    }`,
                                }}
                            >
                                <InlineStack
                                    align="between"
                                    blockAlign="center"
                                    gap={8}
                                >
                                    <BlockStack gap={4} style={{ flex: 1 }}>
                                        <Text size="sm" weight="medium">
                                            {progress.name}
                                        </Text>

                                        <Text size="xs" color="gray-500">
                                            {progress.status === "completed"
                                                ? __("Completed", "ninja-drive")
                                                : progress.status === "error"
                                                ? __("Error", "ninja-drive")
                                                : progress.status ===
                                                  "uploading"
                                                ? __(
                                                      "Uploading...",
                                                      "ninja-drive",
                                                  )
                                                : __("Pending", "ninja-drive")}
                                            {progress.error &&
                                                `: ${progress.error}`}
                                        </Text>
                                    </BlockStack>

                                    <Text size="sm" weight="medium">
                                        {progress.percent}%
                                    </Text>
                                </InlineStack>

                                <div
                                    style={{
                                        height: "4px",
                                        background: "#e0e0e0",
                                        borderRadius: "2px",
                                        marginTop: "8px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${progress.percent}%`,
                                            height: "100%",
                                            transition: "width 0.3s ease",
                                            background:
                                                progress.status === "error"
                                                    ? "#f44336"
                                                    : "#2196f3",
                                        }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </Card>
                </BlockStack>
            ) : (
                <Card
                    margin="20px 0"
                    padding="0 10px 10px 10px"
                    background="primary-extralight"
                    rounded="md"
                    style={{
                        height: "250px",
                        overflowX: "hidden",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                    }}
                    className="w-full"
                >
                    <FolderTree
                        onSelect={(key, name) =>
                            setSelectedFolder({ file_key: key, name })
                        }
                        activeFolder={selectedFolder?.file_key || ""}
                        skip={false}
                        modal
                        hideFade
                        openFolder={() => {}}
                    />
                </Card>
            )}

            <InlineStack
                align="center"
                blockAlign="end"
                gap={10}
                marginTop={10}
            >
                {!isUploadComplete && (
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={uploading}
                    >
                        {uploading
                            ? __("Cancel Upload", "ninja-drive")
                            : __("Cancel", "ninja-drive")}
                    </Button>
                )}

                {isUploadComplete && (
                    <Button variant="error" onClick={onClose}>
                        Close
                    </Button>
                )}

                {!uploading && !isUploadComplete && (
                    <Button onClick={onsubmit} variant="primary">
                        Upload
                    </Button>
                )}

                {uploading && !isUploadComplete && (
                    <Button
                        variant="error"
                        onClick={() => {
                            if (uploaderRef.current) {
                                uploaderRef.current.stop();
                            }
                        }}
                    >
                        {__("Stop Upload", "ninja-drive")}
                    </Button>
                )}
            </InlineStack>
        </div>
    );
}

export function useUploadGoogleDrive() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openUploadGoogleDrive = (attachments: any[]) => {
        showAlert({
            id: "upload-google-drive-modal",
            type: "info",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: "450px",
            height: "fit-content",
            html: (
                <UploadGoogleDriveContent
                    attachments={attachments}
                    onClose={() => closeAlert("upload-google-drive-modal")}
                />
            ),
            onConfirm: async () => {},
        });
    };

    return { openUploadGoogleDrive };
}
