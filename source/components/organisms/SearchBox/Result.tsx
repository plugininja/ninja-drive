import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { SearchBoxResultProps } from "./SearchBox.type";
import { useGallery } from "~/hooks/useGallery";
import Card from "~/components/molecules/Card";
import { formatFileSize } from "~/utils/file";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { isFolder } from "~/utils/file";
import { __ } from "@wordpress/i18n";

const Result = ({
    files,
    total_count,
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
                    {__("files of", "ninja-drive")} {total_count}
                </Text>
            )}

            <BlockStack marginTop={5}>
                {!loading &&
                    files &&
                    queryArgs?.search &&
                    files?.map((file) => {
                        const _isFolder = isFolder(file.mime_type);

                        let thumbnail = _isFolder
                            ? PNPNDHelper.getUrl(
                                  "thumbnail",
                                  file.file_key,
                                  file.name,
                                  undefined,
                                  "lg",
                                  "webp",
                              )
                            : PNPNDHelper.getUrl(
                                  "thumbnail",
                                  file.file_key,
                                  file.name,
                                  undefined,
                                  "md",
                                  file.extension,
                              );

                        return (
                            <Card
                                key={file.file_key}
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
                                        openFolder?.(file?.file_key!);
                                    } else {
                                        viewFile(file?.file_key!);
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
                            {__("View", "ninja-drive")} {total_count}{" "}
                            {__("files in File Browser", "ninja-drive")}
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
