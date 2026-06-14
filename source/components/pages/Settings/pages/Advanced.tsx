import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { selectSettings } from "~/store/features/settingSlice";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import useSaveSettings from "~/hooks/useSaveSettings";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Note from "~/components/molecules/Note";
import { useAppSelector } from "~/store/hooks";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

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
