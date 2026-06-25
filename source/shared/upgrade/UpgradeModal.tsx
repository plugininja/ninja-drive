import { useCustomAlert } from "~/shared/molecules/Alert";
import { BlockStack, Card } from "~/ui/molecules";
import { proIconSvg } from "~kernel/utils/icons";
import { Icon, Text } from "~/ui/atoms";

export function UpgradeModalContent() {
    return (
        <BlockStack gap={20} align="center" inlineAlign="center">
            <img
                src={proIconSvg}
                alt=""
                style={{ width: "100px", height: "100px" }}
            />

            <Text
                size="2xl"
                weight="semibold"
                textTransform="uppercase"
                align="center"
            >
                Upgrade to Pro
            </Text>

            <Text
                color="gray-500"
                align="center"
                style={{
                    lineHeight: "26px",
                }}
            >
                Upgrade to the Pro version of Accessiy to unlock all the
                features and get access to premium support.
            </Text>

            <Card
                padding="8px 13px"
                background="primary"
                flex
                gap={7}
                style={{
                    width: "fit-content",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
                onClick={() =>
                    window.open(pnpnd.upgrade_url, "_blank", "noreferrer")
                }
            >
                <Icon color="white" name="crown" fontSize="lg" />

                <Text color="white" size="sm">
                    UPGRADE NOW
                </Text>
            </Card>
        </BlockStack>
    );
}

export function useUpgradePopUp() {
    const { showAlert, closeAlert } = useCustomAlert();

    const showUpgradePopUp = () => {
        showAlert({
            id: "upgrade-modal",
            type: "warning",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "450px",
            height: "fit-content",
            html: <UpgradeModalContent />,
        });
    };

    return { showUpgradePopUp };
}
