import { BackgroundColor, BorderStyle } from "~/types/styles";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { useRef, useState } from "@wordpress/element";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import { toBoolean } from "~/utils/functions";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import useDevice from "~/hooks/useDevice";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import useFileUploader, {
    IRawFile,
    UploaderData,
} from "~/hooks/useFileUploader";

export interface UploaderProps {
    onClose?: () => void;
    data: UploaderData;
    enableLabel?: boolean;
    label?: string;
    fileUploader?: boolean;
    heightFull?: boolean;
    background?: BackgroundColor;
    borderStyle?: BorderStyle;
    shadow?: boolean;
}

const Uploader = ({
    data,
    onClose,
    enableLabel = false,
    label,
    fileUploader = false,
    heightFull = false,
    background = "primary-extralight",
    borderStyle = "none",
    shadow = false,
}: UploaderProps) => {
    const [filter, setFilter] = useState<"all" | "completed" | "failed">("all");
    const containerRef = useRef<HTMLDivElement>(null);
    const device = useDevice();
    const {
        maxFileSize,
        minFileSize,
        enableFolderUpload,
        uploadConfirmationMessage,
        uploadImmediately,
        max_files,
        isFormUploader,
        widget_id = "",
    } = data;

    const {
        fileCount,
        statusText,
        showConfirmation,
        uploaderRef,
        files,
        setIsUploadComplete,
        isUploadComplete,
        removeFile,
        startUpload,
        isUploadStarted,
        getFilteredFiles,
        browseFilesId,
        browseFolderId,
    } = useFileUploader(data, containerRef);

    const filteredFiles = getFilteredFiles(filter);

    return (
        <div
            onDragEnter={() =>
                containerRef.current?.classList.add("pnpnd-drag-active")
            }
            onDragLeave={() =>
                containerRef.current?.classList.remove("pnpnd-drag-active")
            }
            onDrop={() => containerRef.current?.classList.remove("pnpnd-drag-active")}
            ref={containerRef}
            style={{
                width:
                    device === "mobile"
                        ? fileUploader
                            ? "100%"
                            : "90%"
                        : undefined,
                height: heightFull ? "100%" : undefined,
            }}
            className="pnpnd-uploader"
        >
            {onClose && (
                <Icon
                    name="close"
                    fontSize="2xl"
                    fontWeight="bold"
                    style={{
                        position: "absolute",
                        top:
                            !!files.length && !showConfirmation
                                ? "20px"
                                : "30px",
                        right:
                            !!files.length && !showConfirmation
                                ? "20px"
                                : "30px",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                />
            )}

            {!!showConfirmation && (
                <Card
                    padding={30}
                    background="primary-extralight"
                    borderStyle="none"
                    rounded="lg"
                    flex
                    direction="col"
                    gap={15}
                    blockAlign="center"
                    style={{
                        position: "relative",
                    }}
                    className="h-full"
                >
                    <div
                        className="pnpnd-upload-confirmation-message"
                        dangerouslySetInnerHTML={{
                            __html: uploadConfirmationMessage || "",
                        }}
                    />

                    {(!max_files || max_files > files.length) && (
                        <Button
                            variant="primary"
                            size="small"
                            onClick={() => setIsUploadComplete(false)}
                        >
                            {__("Upload More Files", "ninja-drive")}
                        </Button>
                    )}
                </Card>
            )}

            <Card
                padding={device === "mobile" ? 10 : 30}
                background={background}
                borderStyle={borderStyle}
                rounded="lg"
                flex
                direction="col"
                gap={15}
                blockAlign="center"
                align="center"
                style={{
                    position: "relative",
                    display:
                        !showConfirmation && !files.length ? "flex" : "none",
                }}
                className={clsx(shadow && "pnpnd-uploader-shadow", "h-full")}
            >
                <Icon name="cloud_upload" fontSize="6xl" />

                {enableLabel && label && (
                    <Text size="2xl" weight="semibold" align="center">
                        {label}
                    </Text>
                )}

                <Text align="center">
                    {__("Drag & Drop your files here", "ninja-drive")}
                </Text>

                <Text color="primary">{__("OR", "ninja-drive")}</Text>

                <InlineStack gap={10} align="center">
                    <Button
                        variant="primary"
                        size="small"
                        startIcon="files"
                        type="button"
                        id={browseFilesId}
                    >
                        {__("Browse Files", "ninja-drive")}
                    </Button>

                    {enableFolderUpload && (
                        <Button
                            variant="primary"
                            size="small"
                            startIcon="folder"
                            type="button"
                            id={browseFolderId}
                            disabled={!enableFolderUpload}
                        >
                            {__("Browse Folder", "ninja-drive")}
                        </Button>
                    )}
                </InlineStack>

                <div className="pnpnd-upload-info">
                    {!!minFileSize && (
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Min File Size:", "ninja-drive")} {minFileSize}
                            MB
                        </Text>
                    )}

                    {!!minFileSize && !!minFileSize && (
                        <span className="pnpnd-text-lg">•</span>
                    )}

                    {!!maxFileSize && (
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Max File Size:", "ninja-drive")} {maxFileSize}
                            MB
                        </Text>
                    )}
                </div>
            </Card>

            {!!files.length && !showConfirmation && (
                <div className="pnpnd-file-list-wrapper">
                    <BlockStack gap={5}>
                        {enableLabel && label ? (
                            <Text size="lg" color="black" weight="semibold">
                                {label}
                            </Text>
                        ) : (
                            <Text size="lg" color="black" weight="semibold">
                                {__("Uploads", "ninja-drive")}
                            </Text>
                        )}

                        <InlineStack
                            padding={"5px 0px"}
                            gap={6}
                            style={{
                                marginTop: "5px",
                            }}
                        >
                            <Button
                                variant={
                                    filter === "all" ? "primary" : "outlined"
                                }
                                size="extrasmall"
                                onClick={() => setFilter("all")}
                            >
                                {__("All Uploads", "ninja-drive")}
                            </Button>

                            <Button
                                variant={
                                    filter === "completed"
                                        ? "primary"
                                        : "outlined"
                                }
                                size="extrasmall"
                                onClick={() => setFilter("completed")}
                            >
                                {__("Completed", "ninja-drive")}
                            </Button>

                            <Button
                                variant={
                                    filter === "failed" ? "primary" : "outlined"
                                }
                                size="extrasmall"
                                onClick={() => setFilter("failed")}
                            >
                                {__("Failed", "ninja-drive")}
                            </Button>
                        </InlineStack>
                    </BlockStack>

                    <div className="pnpnd-file-list">
                        {filteredFiles.length === 0 && (
                            <Text
                                size="sm"
                                color="gray-800"
                                style={{ padding: "10px 0px" }}
                            >
                                {__("No", "ninja-drive")} {filter}{" "}
                                {__("files", "ninja-drive")}
                            </Text>
                        )}

                        {[...new Set(filteredFiles)].map(
                            (file: IRawFile, index) => {
                                const { id, name, size, type, error } = file;
                                const isUploading =
                                    files.find((f) => f.id === file.id)
                                        ?.status === "uploading";
                                const isUploaded =
                                    files.find((f) => f.id === file.id)
                                        ?.status === "done";

                                const isProcessing =
                                    files.find((f) => f.id === file.id)
                                        ?.status === "uploading";
                                const isPaused =
                                    files.find((f) => f.id === file.id)
                                        ?.status === "paused";

                                const itemClasses = clsx(
                                    "pnpnd-file-list-item",
                                    isUploading && "pnpnd-active",
                                    (isUploaded || isProcessing) && "pnpnd-uploaded",
                                );

                                return (
                                    <div
                                        key={id}
                                        className={itemClasses}
                                        id={id}
                                    >
                                        <div className="pnpnd-file-info">
                                            <div className="pnpnd-file-name">
                                                <Text
                                                    size="sm"
                                                    color="gray-800"
                                                    wrap={false}
                                                >
                                                    #{index + 1} {name}
                                                </Text>

                                                <InlineStack gap={5}>
                                                    <Text
                                                        size="xs"
                                                        color="gray-500"
                                                        wrap={false}
                                                    >
                                                        {type.toLocaleUpperCase()}
                                                    </Text>

                                                    <Text
                                                        size="xs"
                                                        color="gray-500"
                                                    >
                                                        •
                                                    </Text>

                                                    <Text
                                                        size="xs"
                                                        color="gray-500"
                                                        wrap={false}
                                                    >
                                                        {plupload.formatSize(
                                                            size,
                                                        )}
                                                    </Text>

                                                    {error && (
                                                        <>
                                                            <Text
                                                                size="xs"
                                                                color="gray-500"
                                                            >
                                                                •
                                                            </Text>

                                                            <Text
                                                                size="xs"
                                                                color="error"
                                                                wrap={false}
                                                            >
                                                                {error}
                                                            </Text>
                                                        </>
                                                    )}
                                                </InlineStack>
                                            </div>

                                            <div className="pnpnd-file-actions">
                                                {isUploaded && (
                                                    <IconButton
                                                        name="check"
                                                        size="microsmall"
                                                        variant="primary"
                                                    />
                                                )}

                                                {!isUploaded &&
                                                    (isUploading ||
                                                        isProcessing) &&
                                                    !error &&
                                                    !isPaused && (
                                                        <div className="pnpnd-spinner" />
                                                    )}

                                                {!isUploaded &&
                                                    isUploading &&
                                                    !!file.percent && (
                                                        <Text
                                                            size="sm"
                                                            color="black"
                                                        >
                                                            {file.percent}%
                                                        </Text>
                                                    )}

                                                {!isUploaded && (
                                                    <IconButton
                                                        name="close"
                                                        size="microsmall"
                                                        variant="error"
                                                        className="pnpnd-remove-file"
                                                        onClick={() => {
                                                            removeFile(file.id);
                                                        }}
                                                        data-for="remove-file"
                                                    />
                                                )}
                                            </div>

                                            <span
                                                className="pnpnd-file-info-progress"
                                                style={
                                                    {
                                                        "--percentage":
                                                            isUploading
                                                                ? `${file.percent}%`
                                                                : "100%",
                                                    } as React.CSSProperties
                                                }
                                            >
                                                <span className="pnpnd-file-info-progress-bar" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                        {fileCount > 0 &&
                            !toBoolean(!!isFormUploader) &&
                            !toBoolean(!!uploadImmediately) && (
                                <button
                                    type="button"
                                    className="pnpnd-btn pnpnd-start-upload"
                                    onClick={() => startUpload()}
                                >
                                    <Icon name="cloud_upload" color="white" />

                                    {isUploadStarted
                                        ? __(
                                              "Uploading Files...",
                                              "ninja-drive",
                                          )
                                        : __("Start Upload", "ninja-drive")}
                                </button>
                            )}
                    </div>

                    <Card
                        background="primary"
                        padding="10px"
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            left: 0,
                        }}
                    >
                        <InlineStack
                            align={device === "mobile" ? "center" : "between"}
                            gap={10}
                        >
                            <InlineStack gap={5} align="center" wrap={false}>
                                {isUploadComplete ? (
                                    <IconButton
                                        variant="primary"
                                        name="cloud_done"
                                        size="small"
                                        borderStyle="none"
                                    />
                                ) : (
                                    <IconButton
                                        variant="primary"
                                        name="cloud_upload"
                                        size="small"
                                        borderStyle="none"
                                    />
                                )}

                                <InlineStack
                                    gap={3}
                                    padding={"5px 0px"}
                                    wrap={false}
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Text size="md" color="white">
                                        {fileCount}
                                    </Text>

                                    <Text
                                        size="md"
                                        color="white"
                                        wrap={false}
                                        ellipsis
                                        style={{
                                            minWidth: 0,
                                        }}
                                        textTransform="none"
                                    >
                                        {statusText}
                                    </Text>
                                </InlineStack>
                            </InlineStack>

                            <InlineStack gap={10} align="center">
                                <Button
                                    variant="outlined"
                                    size="extrasmall"
                                    startIcon="files"
                                    type="button"
                                    className="pnpnd-uploader-file-select-button"
                                    onMouseOver={() => {
                                        if (
                                            navigator.userAgent.match(
                                                /(iPad|iPhone|iPod)/g,
                                            )
                                        ) {
                                            uploaderRef.current.refresh();
                                        }
                                    }}
                                    onClick={() => {
                                        const browseFilesBtn =
                                            document.getElementById(
                                                browseFilesId,
                                            );
                                        browseFilesBtn?.click();
                                    }}
                                >
                                    {__("Files", "ninja-drive")}
                                </Button>

                                {enableFolderUpload && (
                                    <Button
                                        variant="outlined"
                                        size="extrasmall"
                                        startIcon="folder"
                                        type="button"
                                        className="pnpnd-uploader-file-select-button"
                                        onMouseOver={() => {
                                            if (
                                                navigator.userAgent.match(
                                                    /(iPad|iPhone|iPod)/g,
                                                )
                                            ) {
                                                uploaderRef.current.refresh();
                                            }
                                        }}
                                        disabled={!enableFolderUpload}
                                        onClick={() => {
                                            const browseFilesBtn =
                                                document.getElementById(
                                                    browseFolderId,
                                                );
                                            browseFilesBtn?.click();
                                        }}
                                    >
                                        {__("Folder", "ninja-drive")}
                                    </Button>
                                )}
                            </InlineStack>
                        </InlineStack>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Uploader;
