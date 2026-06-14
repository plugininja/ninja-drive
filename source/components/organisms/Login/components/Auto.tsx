import Button from "~/components/atoms/Button";
import Avatar from "~/components/atoms/Avatar";
import { LoginCardImg } from "~/utils/images";
import Card from "~/components/molecules/Card";
import { googleIcon } from "~/utils/icons";
import Text from "~/components/atoms/Text";
import useDevice from "~/hooks/useDevice";
import useAuth from "~/hooks/useAuth";
import { __ } from "@wordpress/i18n";

const Auto = () => {
    const { handleAddNewAccount } = useAuth();

    const device = useDevice();

    return (
        <Card
            background="white"
            flex
            direction="col"
            align="center"
            blockAlign="center"
            gap={15}
            borderStyle="none"
            style={{
                height: device === "mobile" ? "100%" : "420px",
                borderRadius:
                    device === "desktop" ? "12px 0 0 12px" : "12px 12px 0 0",
            }}
        >
            <Avatar src={LoginCardImg} height="130px" />

            <Text size="2xl" weight="semibold" align="center">
                {__("You didn't link any account yet.", "ninja-drive")}
            </Text>

            <Text color="gray-800" size="sm" align="center">
                {__(
                    "Please connect your Google Drive account to continue. Our app is currently not verified by Google due to the lengthy verification process, so you may need to allow unverified apps in your Google account settings.",
                    "ninja-drive",
                )}
            </Text>

            <Button
                variant="secondary"
                rounded="md"
                startIcon="check"
                iconUrl={googleIcon}
                style={{
                    marginTop: "10px",
                    padding: "21px 13px",
                }}
                onClick={() =>
                    handleAddNewAccount("", "", "", false, "automatic")
                }
            >
                {__("Sign in with Google", "ninja-drive")}
            </Button>
        </Card>
    );
};

export default Auto;
