import { SearchBoxResultProps } from "./SearchBox.type";
import { formatFileSize } from "~/utils/functions";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { useGallery } from "~/hooks/useGallery";
import { isFolder } from "~/utils/file";
import { __ } from "@wordpress/i18n";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";

const Result = ({
    files,
    totalCount,
    queryArgs,
    loading,
    openFolder,
    setIsCompact,
}: SearchBoxResultProps) => {
    const { viewFile } = useGallery(files || []);

    if (loading) {
        return (
            <BlockStack
                align="center"
                inlineAlign="center"
                style={{
                    height: "100%",
                }}
            >
                <Text size="xs">{__("Loading...", "ninja-drive")}</Text>
            </BlockStack>
        );
    }

    if (!loading && !files?.length) {
        return (
            <BlockStack
                align="center"
                inlineAlign="center"
                style={{
                    height: "100%",
                }}
            >
                <Text size="xs">{__("Result not Found", "ninja-drive")}</Text>
            </BlockStack>
        );
    }

    return (
        <BlockStack className="pn-search-box__results" gap={1} padding={10}>
            {files && files.length > 0 && !loading && queryArgs?.search && (
                <Text as="p" size="sm">
                    {__("Showing", "ninja-drive")} {files.length}{" "}
                    {__("files of", "ninja-drive")} {totalCount}
                </Text>
            )}

            <BlockStack marginTop={5}>
                {!loading &&
                    files &&
                    queryArgs?.search &&
                    files?.map((file) => {
                        const _isFolder = isFolder(file.mimeType);

                        let thumbnail = _isFolder
                            ? PNPNDHelper.getUrl(
                                  "thumbnail",
                                  file.fileKey,
                                  file.name,
                                  undefined,
                                  "lg",
                                  "webp",
                              )
                            : PNPNDHelper.getUrl(
                                  "thumbnail",
                                  file.fileKey,
                                  file.name,
                                  undefined,
                                  "md",
                                  file.extension,
                              );

                        return (
                            <Card
                                key={file.fileKey}
                                padding={10}
                                background="white"
                                borderStyle="none"
                                rounded="md"
                                flex
                                wrap={false}
                                gap={10}
                                className="pn-search-box__item"
                                onClick={() => {
                                    if (isFolder(file?.extension || "")) {
                                        openFolder?.(file?.fileKey!);
                                    } else {
                                        viewFile(file?.fileKey!);
                                    }
                                }}
                            >
                                <Card
                                    padding={0}
                                    rounded="sm"
                                    className="pn-search-box__item-icon"
                                >
                                    <img src={thumbnail} alt={file.name} />
                                </Card>

                                <BlockStack gap={5}>
                                    <Text size="sm" textTransform="none">
                                        {file.name}
                                    </Text>

                                    <InlineStack
                                        gap={8}
                                        className="pn-search-box__item-meta"
                                    >
                                        <Text
                                            color="gray-500"
                                            size="xs"
                                            textTransform="uppercase"
                                        >
                                            {file?.extension}
                                        </Text>

                                        {!_isFolder && (
                                            <Text color="gray-500" size="xs">
                                                {formatFileSize(
                                                    file?.size || 0,
                                                )}
                                            </Text>
                                        )}
                                    </InlineStack>
                                </BlockStack>
                            </Card>
                        );
                    })}
            </BlockStack>

            <InlineStack style={{ cursor: "pointer", marginTop: "5px" }}>
                {files &&
                    files?.length > 0 &&
                    !loading &&
                    queryArgs?.search && (
                        <Text
                            size="sm"
                            className="flex-center"
                            style={{
                                paddingBottom: "10px",
                            }}
                            onClick={() => {
                                setIsCompact?.(true);
                            }}
                        >
                            {__("View", "ninja-drive")}{" "}
                            {totalCount}{" "}
                            {__(
                                "files in File Browser",
                                "ninja-drive",
                            )}
                            <Icon
                                name="arrow_forward"
                                style={{
                                    marginLeft: "6px",
                                }}
                            />
                        </Text>
                    )}
            </InlineStack>
        </BlockStack>
    );
};

export default Result;
