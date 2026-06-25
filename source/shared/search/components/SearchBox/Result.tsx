import { useGallery } from "~features/file-browser/hooks/useGallery";
import { formatFileSize } from "~features/file-browser/utils/file";
import { InlineStack, BlockStack, Card } from "~/ui/molecules";
import { isFolder } from "~features/file-browser/utils/file";
import { SearchBoxResultProps } from "./SearchBox.type";
import { Text, Icon } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";

type ResultProps = SearchBoxResultProps & {
    highlightQuery?: string;
};

const highlightText = (text: string, query: string): JSX.Element | string => {
    if (!query || query.length < 2) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    if (parts.length === 1) return text;

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="pn-search-highlight">
                        {part}
                    </mark>
                ) : (
                    part
                ),
            )}
        </>
    );
};

const Result = ({
    files,
    total_count,
    queryArgs,
    loading,
    openFolder,
    setIsCompact,
    highlightQuery,
}: ResultProps) => {
    const { viewFile } = useGallery(files || []);

    const query = highlightQuery ?? queryArgs?.search ?? "";

    if (loading) {
        return (
            <BlockStack
                align="center"
                inlineAlign="center"
                style={{ height: "100%" }}
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
                style={{ height: "100%" }}
            >
                <Text size="xs">{__("Result not Found", "ninja-drive")}</Text>
            </BlockStack>
        );
    }

    return (
        <BlockStack className="pn-search-box__results" gap={1} padding={10}>
            {files && files.length > 0 && !loading && query && (
                <Text as="p" size="sm">
                    {__("Showing", "ninja-drive")} {files.length}{" "}
                    {__("files of", "ninja-drive")} {total_count}
                </Text>
            )}

            <BlockStack marginTop={5}>
                {!loading &&
                    files &&
                    query &&
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
                                        {highlightText(file.name, query)}
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
                {files && files?.length > 0 && !loading && query && (
                    <Text
                        size="sm"
                        className="flex-center"
                        style={{ paddingBottom: "10px" }}
                        onClick={() => {
                            setIsCompact?.(true);
                        }}
                    >
                        {__("View", "ninja-drive")} {total_count}{" "}
                        {__("files in File Browser", "ninja-drive")}
                        <Icon
                            name="arrow_forward"
                            style={{ marginLeft: "6px" }}
                        />
                    </Text>
                )}
            </InlineStack>
        </BlockStack>
    );
};

export default Result;
