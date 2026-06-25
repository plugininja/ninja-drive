import { useUpdateSettingsMutation } from "~features/settings/api/settingsApi";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { validateAppCredentials } from "~kernel/utils/functions";
import { SettingsData } from "~features/settings/types/settings";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { __ } from "@wordpress/i18n";
import {
    selectSettings,
    settingsInit,
} from "~features/settings/state/settingSlice";

const useSettings = () => {
    const { data, is_dirty } = useAppSelector(selectSettings);
    const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
    const { showAlert } = useCustomAlert();
    const dispatch = useAppDispatch();

    const saveSettings = async (props_data?: SettingsData) => {
        const data_to_save = props_data || data;

        if (data_to_save) {
            if (
                data_to_save.accounts?.connection_type === "manual" &&
                !validateAppCredentials(
                    data_to_save.accounts?.app_client_id,
                    data_to_save.accounts?.app_client_secret,
                )
            ) {
                showAlert({
                    toast: true,
                    type: "error",
                    text: __("Invalid App Credentials", "ninja-drive"),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                return false;
            }

            try {
                if (!props_data && !is_dirty) {
                    return true;
                }

                const result = await updateSettings(data_to_save).unwrap();

                if (result.data?.settings) {
                    dispatch(settingsInit(result.data?.settings));
                }

                showAlert({
                    toast: true,
                    type: "success",
                    text:
                        result?.message ||
                        __("Settings saved successfully", "ninja-drive"),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                return true;
            } catch (error: any) {
                showAlert({
                    toast: true,
                    type: "error",
                    text:
                        error?.data?.message ||
                        __("Failed to save settings", "ninja-drive"),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                return false;
            }
        }
    };

    return { saveSettings, isSaving: isLoading };
};

export default useSettings;
