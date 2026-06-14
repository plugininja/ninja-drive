import BlockStack from "~/components/molecules/BlockStack";
import Button from "~/components/atoms/Button";
import { getProIconSvg } from "~/utils/icons";
import Text from "~/components/atoms/Text";
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
