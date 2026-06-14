import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import { createPortal } from "@wordpress/element";
import Divider from "~/components/atoms/Divider";
import Card from "~/components/molecules/Card";
import Avatar from "~/components/atoms/Avatar";
import { formatFileSize } from "~/utils/file";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { File } from "~/types/file.types";
import { isFolder } from "~/utils/file";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

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
        mime_type,
        file_key,
        account_id,
        size,
        created_at,
        updated_at,
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
            value: file_key || "",
        },
        {
            type: __("Account ID:", "ninja-drive"),
            value: account_id || "",
        },
        {
            type: folder
                ? __("Children:", "ninja-drive")
                : __("Size:", "ninja-drive"),
            value: folder ? 0 : formatFileSize(size || 0),
        },
        {
            type: __("Created:", "ninja-drive"),
            value: created_at || "",
        },
        {
            type: __("Updated:", "ninja-drive"),
            value: updated_at || "",
        },
    ];

    const _isFolder = isFolder(mime_type);

    let thumbnail = PNPNDHelper.getUrl(
        "thumbnail",
        file_key,
        name,
        undefined,
        "2xl",
        extension,
    );

    thumbnail = MENU_KEYS.includes(file_key as MenuKey) ? icon : thumbnail;

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

    return createPortal(
        <div className="pnpnd-top-level-wrapper">
            <div className="pn-file-info-overlay" />

            <Card
                background="white"
                rounded="none"
                className={clsx("pn-file-info", {
                    "pn-file-info--active": !!activeFile,
                })}
            >
                <InlineStack align="between" gap={10}>
                    <InlineStack gap={10}>
                        <Icon name="info" />

                        <Text color="gray-800" weight="medium">
                            {__("Info", "ninja-drive")}
                        </Text>
                    </InlineStack>

                    <IconButton
                        variant="error"
                        size="extrasmall"
                        name="close"
                        style={{
                            borderRadius: "7px",
                        }}
                        onClick={onClose}
                    />
                </InlineStack>

                <Divider width="100%" height="1px" marginTop={10} />

                <Avatar
                    useKey
                    src={thumbnail}
                    alt={name}
                    width="100%"
                    height="200px"
                    rounded="md"
                    objectFit={_isFolder ? "contain" : "cover"}
                    style={{
                        margin: "15px 0 20px 0",
                    }}
                    showSpinner
                    customSpinner={
                        <SkeletonLoader width="100%" height="100%" />
                    }
                    className="border border-solid border-primary-light rounded-md"
                />

                <Text color="gray-700" weight="medium">
                    {__("Properties", "ninja-drive")}
                </Text>

                <BlockStack gap={7} style={{ margin: "10px 0 20px 0" }}>
                    {FILE_DETAILS.map(({ type, value }) => (
                        <InlineStack
                            key={type}
                            gap={10}
                            wrap={false}
                            blockAlign="start"
                        >
                            <Text
                                color="gray-600"
                                size="sm"
                                style={{
                                    width: "100px",
                                }}
                            >
                                {type}
                            </Text>

                            <Text
                                color="gray-500"
                                size="sm"
                                wrap={type === "Name:" ? true : false}
                                ellipsis={type === "Name:" ? false : true}
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

                <Text color="gray-700" weight="medium">
                    {__("Description", "ninja-drive")}
                </Text>

                <Input
                    size="small"
                    background="gray-50"
                    color="gray-200"
                    style={{
                        marginTop: "10px",
                    }}
                    value={""}
                />
            </Card>
        </div>,
        document.body,
    );
};

export default FileInfo;
