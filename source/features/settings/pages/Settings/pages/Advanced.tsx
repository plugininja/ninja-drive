import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { selectSettings } from "~features/settings/state/settingSlice";
import SettingsField from "~/shared/molecules/SettingsField";
import { useAppSelector } from "~kernel/store/hooks";
import { PageContainer } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Note } from "~/ui/molecules";
import { Switcher } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const Advanced = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveAdvanced } = useSaveSettings();

    const {
        google_workspace_domain,
        sharing_permission,
        allow_dot_extension,
        redirection,
        delete_data_on_uninstall,
    } = data?.advanced || {};

    return (
        <PageContainer compact style={{ margin: "0 auto" }}>
            <SettingsField>
                <BlockStack gap={10}>
                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Workspace Domain", "ninja-drive")}
                        </Text>

                        <Input
                            placeholder={__(
                                "Google Workspace Domain",
                                "ninja-drive",
                            )}
                            fullWidth={false}
                            rounded="md"
                            background="gray-50"
                            color="gray-200"
                            className="flex-1"
                            value={google_workspace_domain || ""}
                            onChange={(value) =>
                                saveAdvanced(
                                    "google_workspace_domain",
                                    String(value),
                                )
                            }
                        />
                    </InlineStack>

                    <Description
                        text={__(
                            "For exclusive document sharing within your Google Workspace Domain, kindly insert your domain.",
                            "ninja-drive",
                        )}
                    />

                    <Note type="info">
                        <Note.Normal>
                            <Note.Title title={__("Note:", "ninja-drive")} />
                            <Note.Text>
                                {__(
                                    "To grant public access to your documents, please leave this field blank.",
                                    "ninja-drive",
                                )}
                            </Note.Text>
                        </Note.Normal>
                    </Note>
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Manage Sharing Permissions", "ninja-drive")}
                        titleSize="sm"
                        checked={sharing_permission}
                        onChange={() =>
                            saveAdvanced(
                                "sharing_permission",
                                !sharing_permission,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "The plugin will handle document sharing permissions by default. To manage sharing permissions manually, please disable this option.",
                            "ninja-drive",
                        )}
                    />

                    {!sharing_permission && (
                        <Note type="warning">
                            <Note.Normal>
                                <Note.Title title={__("Note", "ninja-drive")} />
                                <Note.Text>
                                    {__(
                                        "To ensure the plugin works correctly, please enable this option to automatically manage sharing permissions.",
                                        "ninja-drive",
                                    )}
                                </Note.Text>
                            </Note.Normal>
                        </Note>
                    )}
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__(
                            "Show File Extensions in URLs",
                            "ninja-drive",
                        )}
                        titleSize="sm"
                        checked={allow_dot_extension}
                        onChange={() =>
                            saveAdvanced(
                                "allow_dot_extension",
                                !allow_dot_extension,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Control whether file extensions (e.g., .jpg, .png, .pdf) are displayed in generated file URLs. When enabled, URLs include the original file extension. When disabled, URLs use clean filenames without extensions.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Redirection", "ninja-drive")}
                        titleSize="sm"
                        checked={redirection}
                        onChange={() =>
                            saveAdvanced("redirection", !redirection)
                        }
                    />

                    <Description
                        text={__(
                            "Choose how Google Drive files should be loaded in the Media Library: Redirect or Proxy (default: Redirect).",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Delete Data on Uninstall", "ninja-drive")}
                        titleSize="sm"
                        checked={delete_data_on_uninstall}
                        onChange={() =>
                            saveAdvanced(
                                "delete_data_on_uninstall",
                                !delete_data_on_uninstall,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Upon uninstallation, erase the plugin data, including settings, cache, and accounts.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default Advanced;
