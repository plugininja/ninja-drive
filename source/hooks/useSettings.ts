import { __ } from "@wordpress/i18n";
import { selectSettings, settingsInit } from "~/store/features/settingSlice";
import { useUpdateSettingsMutation } from "~/store/api/settingsApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { validateAppCredentials } from "../utils/functions";
import { useCustomAlert } from "~/components/molecules/Alert";

const useSettings = () => {
    const { data, isDirty } = useAppSelector(selectSettings);
    const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
    const { showAlert } = useCustomAlert();
    const dispatch = useAppDispatch();

    const saveSettings = async () => {
        if (data) {
            if (
                data.accounts?.connectionType === "manual" &&
                !validateAppCredentials(
                    data.accounts?.appClientId,
                    data.accounts?.appClientSecret,
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
                if (!isDirty) {
                    return true;
                }

                const result = await updateSettings(data).unwrap();

                if (result.data?.settings) {
                    dispatch(settingsInit(result.data?.settings));
                }

                showAlert({
                    toast: true,
                    type: "success",
                    text: result?.message || __("Settings saved successfully", "ninja-drive"),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                return true;
            } catch (error: any) {
                showAlert({
                    toast: true,
                    type: "error",
                    text: error?.data?.message || __("Failed to save settings", "ninja-drive"),
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
