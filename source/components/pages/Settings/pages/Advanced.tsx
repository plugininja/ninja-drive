import { __ } from "@wordpress/i18n";
import { selectSettings } from "~/store/features/settingSlice";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import useSaveSettings from "~/hooks/useSaveSettings";
import { useAppSelector } from "~/store/hooks";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import Note from "~/components/molecules/Note";

const Advanced = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveAdvanced } = useSaveSettings();

    const {
        googleWorkspaceDomain,
        sharingPermission,
        allowDotExtension,
        secureVideoPlayback,
        deleteDataOnUninstall,
    } = data?.advanced || {};

    return (
        <PageContainer>

            <SettingsField
                description={__("Control whether file extensions (e.g., .jpg, .png, .pdf) are displayed in generated file URLs. When enabled, URLs include the original file extension. When disabled, URLs use clean filenames without extensions.", "ninja-drive")}
                action={
                    <Switcher
                        title={__("Show File Extensions in URLs", "ninja-drive")}
                        checked={allowDotExtension}
                        onChange={() =>
                            saveAdvanced(
                                "allowDotExtension",
                                !allowDotExtension,
                            )
                        }
                    />
                }
            />

            <SettingsField
                description={__("Upon uninstallation, erase the plugin data, including settings, cache, and accounts.", "ninja-drive")}
                action={
                    <Switcher
                        title={__("Delete Data on Uninstall", "ninja-drive")}
                        checked={deleteDataOnUninstall}
                        onChange={() =>
                            saveAdvanced(
                                "deleteDataOnUninstall",
                                !deleteDataOnUninstall,
                            )
                        }
                    />
                }
            />
        </PageContainer>
    );
};

export default Advanced;
