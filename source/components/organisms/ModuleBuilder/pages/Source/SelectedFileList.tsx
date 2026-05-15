import { removeThumbnail } from "~/store/features/widgetBuilderSlice";
import InlineStack from "~/components/molecules/InlineStack";
import { ModuleKey } from "~/types/widget.types";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import { useAppDispatch } from "~/store/hooks";
import { File } from "~/types/file.types";
import Card from "~/components/molecules/Card";
import Avatar from "~/components/atoms/Avatar";
import Button from "~/components/atoms/Button";
import { __ } from "@wordpress/i18n";
import { isFolder } from "~/utils/file";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";

const SelectedFileList = ({
    widgetType,
    selectedFiles,
    setSelectedFiles,
    selectedActionKey,
    setSelectedActionKey,
}: {
    widgetType?: ModuleKey;
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
    selectedActionKey?: string;
    setSelectedActionKey?: (key: string) => void;
}) => {
    const dispatch = useAppDispatch();

    const maxDigits = String(selectedFiles?.length)?.length;

    const indexWidth = `${maxDigits * 8 + 8}px`;

    const formatIndex = (i: number) => String(i).padStart(maxDigits, "0");

    return (
        <Card
            padding={0}
            background="white"
            style={{
                flex: "0 0 250px",
                position: "sticky",
                top: 0,
                height: "80vh",
                overflowY: "auto",
                scrollbarWidth: "none",
            }}
            className="pnpnd-widget-selected-files"
        >
            <InlineStack
                align="between"
                blockAlign="center"
                className="pnpnd-widget-selected-files__header"
            >
                <InlineStack gap={10}>
                    <Text color="black" size="sm" weight="medium">
                        <Text color="primary" size="sm" weight="medium">
                            ({selectedFiles?.length})
                        </Text>{" "}
                        Items Selected
                    </Text>
                </InlineStack>

                <Button
                    variant="error"
                    size="supersmall"
                    onClick={() => setSelectedFiles([])}
                    disabled={selectedFiles?.length === 0}
                >
                    Clear
                </Button>
            </InlineStack>

            <BlockStack
                marginTop={selectedFiles?.length > 0 ? 0 : 10}
                style={{
                    minWidth: 0,
                }}
            >
                {selectedFiles?.length > 0 ? (
                    <>
                        {selectedFiles.map((file, index) => {
                            const _isFolder = isFolder(file?.mimeType);
                            const thumbnail = _isFolder
                                ? PNPNDHelper.getUrl(
                                      "thumbnail",
                                      file?.fileKey,
                                      file?.name,
                                      undefined,
                                      "lg",
                                      "webp",
                                  )
                                : PNPNDHelper.getUrl(
                                      "thumbnail",
                                      file?.fileKey,
                                      file?.name,
                                      undefined,
                                      "md",
                                      file?.extension,
                                  );

                            return (
                                <Card
                                    key={file?.fileKey}
                                    padding={10}
                                    background="white"
                                    borderStyle="none"
                                    rounded="none"
                                    flex
                                    direction="col"
                                    gap={10}
                                    style={{
                                        minWidth: 0,
                                    }}
                                    className="pnpnd-widget-selected-files__file"
                                >
                                    <InlineStack
                                        align="between"
                                        gap={10}
                                        wrap={false}
                                        style={{ minWidth: 0 }}
                                    >
                                        <InlineStack
                                            gap={10}
                                            align="center"
                                            wrap={false}
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <InlineStack
                                                gap={10}
                                                align="center"
                                                wrap={false}
                                            >
                                                <Text
                                                    size="sm"
                                                    style={{
                                                        width: indexWidth,
                                                        textAlign: "right",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {formatIndex(index + 1)}.
                                                </Text>

                                                <Card
                                                    padding={0}
                                                    rounded="sm"
                                                    style={{
                                                        width: "35px",
                                                        height: "30px",
                                                        flexShrink: 0,
                                                    }}
                                                    className="flex-center"
                                                >
                                                    <Avatar
                                                        src={thumbnail}
                                                        width="100%"
                                                        height="100%"
                                                        rounded="sm"
                                                    />
                                                </Card>
                                            </InlineStack>

                                            <Text
                                                size="sm"
                                                wrap={false}
                                                ellipsis
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >
                                                {file.name}
                                            </Text>
                                        </InlineStack>

                                        <InlineStack gap={5} wrap={false}>
                                            {widgetType === "media-player" &&
                                                !isFolder(
                                                    file.extension || "",
                                                ) && (
                                                    <IconButton
                                                        title="Select a thumbnail"
                                                        variant="primary"
                                                        size="microsmall"
                                                        name="add_photo_alternate"
                                                        fontSize="sm"
                                                        onClick={() =>
                                                            setSelectedActionKey?.(
                                                                selectedActionKey ===
                                                                    file?.fileKey
                                                                    ? ""
                                                                    : file?.fileKey,
                                                            )
                                                        }
                                                    />
                                                )}

                                            <IconButton
                                                variant="error"
                                                size="microsmall"
                                                name="clear"
                                                fontSize="sm"
                                                style={{
                                                    flexShrink: 0,
                                                }}
                                                onClick={() =>
                                                    setSelectedFiles(
                                                        selectedFiles.filter(
                                                            (f) =>
                                                                f?.fileKey !==
                                                                file?.fileKey,
                                                        ),
                                                    )
                                                }
                                            />
                                        </InlineStack>
                                    </InlineStack>

                                    {selectedActionKey === file?.fileKey && (
                                        <Card
                                            padding={0}
                                            background="primary-extralight"
                                            style={{
                                                overflow: "hidden",
                                                aspectRatio: "16/9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                            }}
                                        >
                                            {file?.thumbnailData?.fileKey && (
                                                <Card
                                                    padding="5px 10px"
                                                    background="error"
                                                    style={{
                                                        position: "absolute",
                                                        width: "fit-content",
                                                        zIndex: 1,
                                                        top: "50%",
                                                        left: "50%",
                                                        transform:
                                                            "translate(-50%, -50%)",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => {
                                                        if (
                                                            !file?.thumbnailData ||
                                                            file?.thumbnailData
                                                                ?.fileKey === ""
                                                        ) {
                                                            setSelectedActionKey?.(
                                                                "",
                                                            );
                                                        } else {
                                                            dispatch(
                                                                removeThumbnail(
                                                                    {
                                                                        fileKey:
                                                                            file?.fileKey,
                                                                    },
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Text
                                                        color="white"
                                                        size="sm"
                                                    >
                                                        Remove
                                                    </Text>
                                                </Card>
                                            )}

                                            {file?.thumbnailData?.fileKey ? (
                                                <Avatar
                                                    src={PNPNDHelper.getUrl(
                                                        "thumbnail",
                                                        file?.thumbnailData
                                                            ?.fileKey,
                                                        file?.thumbnailData?.name,
                                                        "",
                                                        "md",
                                                        file?.thumbnailData
                                                            ?.extension,
                                                    )}
                                                    width="100%"
                                                    height="100%"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <Text size="sm" align="center">
                                                    Select a thumbnail
                                                </Text>
                                            )}
                                        </Card>
                                    )}
                                </Card>
                            );
                        })}
                    </>
                ) : (
                    <InlineStack align="center" blockAlign="center" gap={7}>
                        <Icon name="info" />

                        <Text size="sm">{ __( "No files selected.", "ninja-drive" ) }</Text>
                    </InlineStack>
                )}
            </BlockStack>
        </Card>
    );
};

export default SelectedFileList;
