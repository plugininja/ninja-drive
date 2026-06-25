import { selectSettings } from "~features/settings/state/settingSlice";
import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { selectAuth } from "~/features/auth/state/authSlice";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useAppSelector } from "~kernel/store/hooks";
import useAuth from "~features/auth/hooks/useAuth";
import { googleIcon } from "~kernel/utils/icons";
import useDevice from "~kernel/hooks/useDevice";
import { useState } from "@wordpress/element";
import { BlockStack } from "~/ui/molecules";
import { GridStack } from "~/ui/molecules";
import DOCS from "~kernel/utils/docs";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const Form = ({ login = false }: { login?: boolean }) => {
    const { login_accounts } = useAppSelector(selectAuth);
    const { data } = useAppSelector(selectSettings);
    const { saveAccounts } = useSaveSettings();

    const { handleAddNewAccount } = useAuth();

    const device = useDevice();

    const { app_client_id, app_client_secret, redirect_uri } =
        data?.accounts || {};

    const [iDError, setIDError] = useState<string | null>(null);
    const [secretError, setSecretError] = useState<string | null>(null);

    const { showAlert } = useCustomAlert();

    const validateFields = () => {
        let valid = true;

        const clientIdRegex =
            /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
        const secretKeyRegex = /^GOCSPX-[\w-]{20,}$/;

        if (!app_client_id?.trim()) {
            setIDError(__("Client ID is required.", "ninja-drive"));
            valid = false;
        } else if (!clientIdRegex.test(app_client_id?.trim())) {
            setIDError(__("Invalid Client ID format.", "ninja-drive"));
            valid = false;
        } else {
            setIDError(null);
        }

        if (!valid) return valid;

        if (app_client_secret?.includes("*")) {
            return true;
        }

        if (!app_client_secret?.trim()) {
            setSecretError(__("Secret Key is required.", "ninja-drive"));
            valid = false;
        } else if (!secretKeyRegex.test(app_client_secret?.trim())) {
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
        if (!redirect_uri) {
            showAlert({
                position: "top-center",
                toast: true,
                type: "error",
                text: __("No Redirect URI", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        navigator.clipboard.writeText(redirect_uri).then(() => {
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
        handleAddNewAccount(
            "",
            app_client_id,
            app_client_secret,
            false,
            "manual",
        );
    };

    return (
        <SettingsField
            gap={login ? 20 : 10}
            background={login ? "white" : "gray-50"}
            borderStyle={login ? "none" : "solid"}
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
                    id="app_client_id"
                    inputTextColor="gray-600"
                    label={__("App Client ID", "ninja-drive")}
                    labelColor={login ? "black" : "gray-600"}
                    labelFontSize={login ? "xs" : "sm"}
                    placeholder={__("App Client ID", "ninja-drive")}
                    rounded="md"
                    required
                    value={app_client_id || ""}
                    onChange={(value) => {
                        if (login_accounts?.length! > 0) return;
                        saveAccounts("app_client_id", String(value));
                    }}
                    onBlur={submit}
                    error={!!iDError}
                    errorText={iDError || ""}
                    disabled={login_accounts?.length! > 0}
                />

                <Input
                    id="app_client_secret"
                    inputTextColor="gray-600"
                    label={__("App Secret Key", "ninja-drive")}
                    labelColor={login ? "black" : "gray-600"}
                    labelFontSize={login ? "xs" : "sm"}
                    placeholder={__("App Secret Key", "ninja-drive")}
                    rounded="md"
                    required
                    value={app_client_secret || ""}
                    onChange={(value) => {
                        if (login_accounts?.length! > 0) return;
                        saveAccounts("app_client_secret", String(value));
                    }}
                    onBlur={submit}
                    error={!!secretError}
                    errorText={secretError || ""}
                    disabled={login_accounts?.length! > 0}
                />

                {!login && (
                    <Input
                        id="redirect_uri"
                        inputTextColor="gray-600"
                        label={__("Redirect URI", "ninja-drive")}
                        labelColor="gray-600"
                        labelFontSize={login ? "xs" : "sm"}
                        suffix={
                            <Icon
                                name="content_copy"
                                color="primary"
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={handleCopy}
                            />
                        }
                        value={redirect_uri || ""}
                        rounded="md"
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
                    id="redirect_uri"
                    label={__("Redirect URI", "ninja-drive")}
                    labelFontSize={login ? "xs" : "sm"}
                    value={redirect_uri || ""}
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
                <Text color="gray-500" size="xs">
                    {__("Visit", "ninja-drive")}{" "}
                    <Text
                        size="xs"
                        as="a"
                        color="primary"
                        style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                        onClick={() => window.open(DOCS.googleApp, "_blank")}
                    >
                        {__("Documentation", "ninja-drive")}
                    </Text>{" "}
                    {__("to learn how to", "ninja-drive")}{" "}
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
                        {__("create a Google App.", "ninja-drive")}
                    </Text>
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
