import { selectSettings } from "~/store/features/settingSlice";
import { useCustomAlert } from "~/components/molecules/Alert";
import useSaveSettings from "~/hooks/useSaveSettings";
import SettingsField from "~/components/molecules/SettingsField";
import BlockStack from "~/components/molecules/BlockStack";
import { useAppSelector } from "~/store/hooks";
import { useState } from "@wordpress/element";
import GridStack from "~/components/molecules/GridStack";
import { googleIcon } from "~/assets/icons";
import useDevice from "~/hooks/useDevice";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import useAuth from "~/hooks/useAuth";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import DOCS from "~/utils/docs";

const Form = ({ login = false }: { login?: boolean }) => {
    const { data } = useAppSelector(selectSettings);
    const { saveAccounts } = useSaveSettings();

    const { handleAddNewAccount } = useAuth();

    const device = useDevice();

    const { appClientId, appClientSecret, redirectUri } = data?.accounts || {};

    const [iDError, setIDError] = useState<string | null>(null);
    const [secretError, setSecretError] = useState<string | null>(null);

    const { showAlert } = useCustomAlert();

    const validateFields = () => {
        let valid = true;

        const clientIdRegex =
            /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
        const secretKeyRegex = /^GOCSPX-[\w-]{20,}$/;

        if (!appClientId?.trim()) {
            setIDError(__("Client ID is required.", "ninja-drive"));
            valid = false;
        } else if (!clientIdRegex.test(appClientId?.trim())) {
            setIDError(__("Invalid Client ID format.", "ninja-drive"));
            valid = false;
        } else {
            setIDError(null);
        }

        if (!valid) return valid;

        if (appClientSecret?.includes("*")) {
            return true;
        }

        if (!appClientSecret?.trim()) {
            setSecretError(__("Secret Key is required.", "ninja-drive"));
            valid = false;
        } else if (!secretKeyRegex.test(appClientSecret?.trim())) {
            setSecretError(__("Invalid Secret Key format.", "ninja-drive"));
            valid = false;
        } else {
            setSecretError(null);
        }

        return valid;
    };

    const submit = () => {
        if (!validateFields()) return;
    };

    const handleCopy = () => {
        if (!redirectUri) {
            showAlert({
                position: "top-center",
                toast: true,
                type: "error",
                title: __("No Redirect URI", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        navigator.clipboard.writeText(redirectUri).then(() => {
            showAlert({
                toast: true,
                type: "success",
                text: __("Redirect URI Copied to Clipboard", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        });
    };

    const handleSignIn = () => {
        if (!validateFields()) return;
        handleAddNewAccount("", appClientId, appClientSecret, false, "manual");
    };

    return (
        <SettingsField
            background={login ? "white" : "primary-extralight"}
            borderStyle={login ? "none" : "dashed"}
            style={{
                height: login
                    ? device === "mobile"
                        ? "100%"
                        : "420px"
                    : "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: login
                    ? device === "desktop"
                        ? "12px 0 0 12px"
                        : "12px 12px 0 0"
                    : "12px",
            }}
        >
            {/* {!login && (
                <Note type="warning">
                    <Note.Bullet>
                        <Note.Text>
                            Using your own Google App is optional. For an easy
                            setup you can use the default App of the plugin. If
                            you decide to create your own Google App, please
                            enter your App Client ID & Secret Key below.
                        </Note.Text>
                    </Note.Bullet>

                    <Note.Bullet>
                        <Note.Text>
                            Visit{" "}
                            <Note.Link url={DOCS.SETTINGS.account.appCreate}>
                                Documentation
                            </Note.Link>{" "}
                            to learn how to create a Google App.
                        </Note.Text>
                    </Note.Bullet>
                </Note>
            )} */}
            {login && (
                <>
                    <Text size="2xl" weight="semibold" align="center">
                        {__("Google App Credentials", "ninja-drive")}
                    </Text>

                    <Text
                        size="sm"
                        align="center"
                        style={{
                            textAlign: "center",
                        }}
                    >
                        {__(
                            "Don't have a Google Drive app ? please check",
                            "ninja-drive",
                        )}{" "}
                        <a
                            href={DOCS.SETTINGS.account.appSetup}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                            style={{
                                textDecoration: "underline",
                            }}
                        >
                            {__("documentation", "ninja-drive")}
                        </a>{" "}
                        {__("or", "ninja-drive")}{" "}
                        <a
                            href={DOCS.SETTINGS.account.appCreate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                            style={{
                                textDecoration: "underline",
                            }}
                        >
                            {__("create an app", "ninja-drive")}
                        </a>{" "}
                        {__(".", "ninja-drive")}
                    </Text>
                </>
            )}
            <GridStack columns={login ? 2 : 3} gap={20}>
                <Input
                    id="appClientId"
                    label={__("App Client ID", "ninja-drive")}
                    labelFontSize={login ? "xs" : "sm"}
                    placeholder={__("App Client ID", "ninja-drive")}
                    size="small"
                    required
                    value={appClientId || ""}
                    onChange={(value) =>
                        saveAccounts("appClientId", String(value))
                    }
                    onBlur={submit}
                    error={!!iDError}
                    errorText={iDError || ""}
                />

                <Input
                    id="appClientSecret"
                    label={__("App Secret Key", "ninja-drive")}
                    labelFontSize={login ? "xs" : "sm"}
                    placeholder={__("App Secret Key", "ninja-drive")}
                    size="medium"
                    required
                    value={appClientSecret || ""}
                    onChange={(value) =>
                        saveAccounts("appClientSecret", String(value))
                    }
                    onBlur={submit}
                    error={!!secretError}
                    errorText={secretError || ""}
                />
                {!login && (
                    <Input
                        id="redirectUri"
                        label={__("Redirect URI", "ninja-drive")}
                        labelFontSize={login ? "xs" : "sm"}
                        value={redirectUri || ""}
                        size="medium"
                        readOnly
                        style={{
                            cursor: "pointer",
                        }}
                        inputStyle={{
                            cursor: "pointer",
                        }}
                        onClick={handleCopy}
                    />
                )}
            </GridStack>
            {login && (
                <Input
                    id="redirectUri"
                    label={__("Redirect URI", "ninja-drive")}
                    labelFontSize={login ? "xs" : "sm"}
                    value={redirectUri || ""}
                    size="medium"
                    readOnly
                    style={{
                        cursor: "pointer",
                    }}
                    inputStyle={{
                        cursor: "pointer",
                    }}
                    onClick={handleCopy}
                />
            )}{" "}
            {!login && (
                <Text size="xs">
                    {__("Visit", "ninja-drive")}{" "}
                    <Text
                        size="xs"
                        as="a"
                        color="primary"
                        style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            window.open(
                                DOCS.SETTINGS.account.appCreate,
                                "_blank",
                            )
                        }
                    >
                        {__("Documentation", "ninja-drive")}
                    </Text>{" "}
                    {__("to learn how to create a Google App.", "ninja-drive")}
                </Text>
            )}
            {login && (
                <BlockStack align="center" inlineAlign="center">
                    <Button
                        variant="secondary"
                        rounded="md"
                        startIcon="check"
                        iconUrl={googleIcon}
                        style={{
                            padding: "21px 13px",
                        }}
                        onClick={handleSignIn}
                    >
                        {__("Sign in with Google", "ninja-drive")}
                    </Button>
                </BlockStack>
            )}
        </SettingsField>
    );
};

export default Form;
