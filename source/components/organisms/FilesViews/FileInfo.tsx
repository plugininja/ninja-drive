import { useCustomAlert } from "~/components/molecules/Alert";
import { formatFileSize } from "~/utils/functions";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { File } from "~/types/file.types";
import { isFolder } from "~/utils/file";
import Avatar from "~/components/atoms/Avatar";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Card from "~/components/molecules/Card";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";

const FileInfo = ({
    activeFile,
    onClose,
}: {
    activeFile: File;
    onClose: () => void;
}) => {
    const { showAlert } = useCustomAlert();

    const {
        name,
        icon,
        extension,
        mimeType,
        fileKey,
        accountId,
        size,
        createdAt,
        updatedAt,
    } = activeFile || {};

    const folder = isFolder(extension || "");

    const FILE_DETAILS = [
        {
            type: __("Name:", "ninja-drive"),
            value: name || "",
        },
        {
            type: __("Type:", "ninja-drive"),
            value: extension || "",
        },
        {
            type: __("Owner:", "ninja-drive"),
            value: "Unknown",
        },
        {
            type: __("File Key:", "ninja-drive"),
            value: fileKey || "",
        },
        {
            type: __("Account ID:", "ninja-drive"),
            value: accountId || "",
        },
        {
            type: folder
                ? __("Children:", "ninja-drive")
                : __("Size:", "ninja-drive"),
            value: folder ? 0 : formatFileSize(size || 0),
        },
        {
            type: __("Created:", "ninja-drive"),
            value: createdAt || "",
        },
        {
            type: __("Updated:", "ninja-drive"),
            value: updatedAt || "",
        },
    ];

    const _isFolder = isFolder(mimeType);

    let thumbnail = PNPNDHelper.getUrl(
        "thumbnail",
        fileKey,
        name,
        undefined,
        "2xl",
        extension,
    );

    thumbnail = MENU_KEYS.includes(fileKey as MenuKey) ? icon : thumbnail;

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);

        showAlert({
            toast: true,
            type: "success",
            text: __("Copied to clipboard!", "ninja-drive"),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    return (
        <Card
            background="white"
            style={{
                flex: "0 0 400px",
                maxWidth: "400px",
                position: "sticky",
                top: "0",
                zIndex: 99,
                height: "100%",
            }}
        >
            <InlineStack align="between" gap={10}>
                <InlineStack gap={10}>
                    <Icon name="info" />

                    <Text weight="medium">{__("Info", "ninja-drive")}</Text>
                </InlineStack>

                <IconButton
                    variant="error"
                    size="extrasmall"
                    name="close"
                    onClick={onClose}
                />
            </InlineStack>

            <Avatar
                useKey
                src={thumbnail}
                alt={name}
                width="100%"
                height="200px"
                rounded="md"
                objectFit={_isFolder ? "contain" : "cover"}
                style={{
                    margin: "20px 0",
                }}
                showSpinner
                customSpinner={<SkeletonLoader width="100%" height="100%" />}
                className="border border-solid border-light rounded-md"
            />

            <Text weight="medium">
                {__("Properties", "ninja-drive")}
            </Text>

            <BlockStack gap={7} style={{ margin: "10px 0 20px 0" }}>
                {FILE_DETAILS.map(({ type, value }) => (
                    <InlineStack key={type} gap={10} wrap={false}>
                        <Text
                            size="sm"
                            style={{
                                width: "100px",
                            }}
                        >
                            {type}
                        </Text>

                        <Text
                            size="sm"
                            wrap={false}
                            ellipsis
                            style={{
                                cursor:
                                    type === "File Key:" ||
                                    type === "Account ID:"
                                        ? "pointer"
                                        : "default",
                            }}
                            className="flex-1"
                            onClick={() => {
                                if (
                                    type === "File Key:" ||
                                    type === "Account ID:"
                                ) {
                                    handleCopyToClipboard(String(value));
                                }
                            }}
                        >
                            {value}
                        </Text>
                    </InlineStack>
                ))}
            </BlockStack>

            <Text weight="medium">
                {__("Description", "ninja-drive")}
            </Text>

            <Input
                size="small"
                style={{
                    marginTop: "10px",
                }}
                value={""}
            />
        </Card>
    );
};

export default FileInfo;
