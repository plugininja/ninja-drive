import { getProIconSvg } from "~kernel/utils/icons";
import { BlockStack } from "~/ui/molecules";
import { Button, Text } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";

const UpgradeBanner = ({
    title = __(
        "User Access management is a Pro feature. Upgrade to unlock granular permissions and user management.",
        "ninja-drive",
    ),
}: {
    title?: string;
}) => (
    <BlockStack inlineAlign="center" align="center" gap={24} padding={40}>
        <img
            src={getProIconSvg}
            alt=""
            style={{ width: "100px", height: "100px" }}
        />

        <Text size="2xl" weight="semibold" align="center">
            {__("Upgrade to Pro", "ninja-drive")}
        </Text>

        <Text
            size="md"
            align="center"
            color="gray-600"
            style={{
                maxWidth: "800px",
                lineHeight: "1.5",
            }}
        >
            {title}
        </Text>

        <Button
            startIcon="crown"
            variant="primary"
            onClick={() =>
                window.open(pnpnd.upgrade_url, "_blank", "noreferrer")
            }
        >
            {__("Upgrade Now", "ninja-drive")}
        </Button>
    </BlockStack>
);

export default UpgradeBanner;
