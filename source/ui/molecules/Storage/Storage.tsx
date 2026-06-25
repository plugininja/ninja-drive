import { formatFileSize } from "~features/file-browser/utils/file";
import { StorageProps } from "./Storage.type";
import { __ } from "@wordpress/i18n";
import { BlockStack } from "../BlockStack";
import { InlineStack } from "../InlineStack";
import { Icon, ProgressBar, Text } from "~/ui/atoms";

const Storage = ({ id, style, className, total, used }: StorageProps) => {
    const percent = (used / total) * 100;

    return (
        <BlockStack id={id} gap={10} style={style} className={className}>
            <InlineStack gap={10} wrap={false}>
                <Icon color="gray-700" name="cloud" fontSize="2xl" />

                <Text color="gray-700" size="sm" weight="semibold">
                    {__("Storage", "ninja-drive")}
                </Text>
            </InlineStack>

            <ProgressBar progress={percent} />

            <Text color="gray-500" size="xs">
                {formatFileSize(used)} {__("of", "ninja-drive")}{" "}
                {formatFileSize(total)} {percent.toFixed(2)}
                {__("% Used", "ninja-drive")}
            </Text>
        </BlockStack>
    );
};

export default Storage;
