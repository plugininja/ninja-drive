import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { CronProps } from "./Cron.type";
import { __ } from "@wordpress/i18n";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import clsx from "clsx";

const Cron = ({
    variant = "primary",
    title,
    description,
    loading,
}: CronProps) => {
    return (
        <InlineStack
            padding="10px 15px"
            align="between"
            gap={20}
            wrap={false}
            style={{
                borderLeft: `4px solid var(--pnpnd-${variant})`,
                borderBottom: `1px solid var(--pnpnd-${variant}-light)`,
            }}
        >
            <InlineStack gap={10} wrap={false}>
                <Text
                    color="gray-800"
                    weight="semibold"
                    style={{
                        fontSize: "13px",
                    }}
                >
                    {title || __("PLUGININJA CRON.", "ninja-drive")}
                </Text>

                <Text
                    color="gray-500"
                    style={{
                        fontSize: "13px",
                    }}
                >
                    {description ||
                        __("Plugininja Cron is running.", "ninja-drive")}
                </Text>
            </InlineStack>

            <BlockStack align="center" inlineAlign="center">
                <Icon
                    name="progress_activity"
                    color={variant}
                    className={clsx(loading && "loading")}
                />
            </BlockStack>
        </InlineStack>
    );
};

export default Cron;
