import { formatFileSize } from "~/utils/functions";
import { StorageProps } from "./Storage.type";
import ProgressBar from "~/components/atoms/ProgressBar";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { __ } from "@wordpress/i18n";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";

const Storage = ({ id, style, className, total, used }: StorageProps) => {
    const percent = (used / total) * 100;

    return (
        <BlockStack id={id} gap={5} style={style} className={className}>
            <InlineStack gap={10} wrap={false}>
                <Icon name="cloud" fontSize="2xl" />

                <Text size="sm" weight="semibold">
                    {__("Storage", "ninja-drive")}
                </Text>
            </InlineStack>

            <ProgressBar progress={percent} />

            <Text color="gray-500" size="xs" weight="semibold">
                {formatFileSize(used)} {__("of", "ninja-drive")} {formatFileSize(total)}{" "}
                {percent.toFixed(2)}{__("% Used", "ninja-drive")}
            </Text>
        </BlockStack>
    );
};

export default Storage;
