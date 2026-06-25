import { LoginCardImg } from "~kernel/utils/images";
import useAuth from "~features/auth/hooks/useAuth";
import { googleIcon } from "~kernel/utils/icons";
import useDevice from "~kernel/hooks/useDevice";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Avatar } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const Auto = () => {
    const { handleAddNewAccount } = useAuth();

    const device = useDevice();

    return (
        <Card
            marginTop={20}
            background="white"
            borderStyle="none"
            flex
            direction="col"
            align="center"
            blockAlign="center"
            gap={15}
            style={{
                height: device === "mobile" ? "100%" : "420px",
                borderRadius:
                    device === "desktop" ? "12px 0 0 12px" : "12px 12px 0 0",
            }}
            className="border border-solid border-secondary"
        >
            <Avatar src={LoginCardImg} height="130px" />

            <Text size="2xl" weight="semibold" align="center">
                {__("You didn't link any account yet.", "ninja-drive")}
            </Text>

            <Text
                color="gray-800"
                size="sm"
                align="center"
                style={{ maxWidth: "800px" }}
            >
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
