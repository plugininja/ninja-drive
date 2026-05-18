import { selectSettings, settingsInit } from "~/store/features/settingSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useGetModulesQuery } from "~/store/api/widgetApi";
import { useCustomAlert } from "~/components/molecules/Alert";
import PageContainer from "~/components/molecules/PageContainer";
import useSaveSettings from "~/hooks/useSaveSettings";
import SettingsField from "~/components/molecules/SettingsField";
import InlineStack from "~/components/molecules/InlineStack";
import { useNavigate } from "react-router-dom";
import SelectBox from "~/components/molecules/SelectBox";
import { useState } from "@wordpress/element";
import Switcher from "~/components/atoms/Switcher";
import Button from "~/components/atoms/Button";
import { __ } from "@wordpress/i18n";
import Note from "~/components/molecules/Note";
import {
    useImportShortcodesMutation,
    useUpdateSettingsMutation,
} from "~/store/api/settingsApi";
import { CSS_VAR } from "~/types/tokens";

type ExportOptions = "export_all" | "settings" | "shortcode_widgets";

const Tools = () => {
    const [exportedData, setExportedData] =
        useState<ExportOptions>("export_all");
    const { data, defaultData } = useAppSelector(selectSettings);
    const { saveTools } = useSaveSettings();
    const [updateSettings] = useUpdateSettingsMutation();

    const [importShortcodes] = useImportShortcodesMutation();

    const { showAlert } = useCustomAlert();

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const { autoSave } = data?.tools || {};

    const { data: widgetsData } = useGetModulesQuery({
        orderBy: "name",
        order: "ASC",
        page: 1,
        perPage: -1,
        type: "all",
        search: "",
        status: "all",
    });

    const handleExportData = () => {
        const selectedData = exportedData;

        let dataToExport = {};

        switch (selectedData) {
            case "export_all":
                dataToExport = {
                    settings: data,
                    widgets: widgetsData?.data?.widgets || [],
                };
                break;
            case "settings":
                dataToExport = {
                    settings: data,
                };
                break;
            case "shortcode_widgets":
                dataToExport = {
                    widgets: widgetsData?.data?.widgets || [],
                };
                break;
            default:
                return;
        }

        const filenamePart = selectedData.replace(/_/g, "_");
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(dataToExport, null, 2));

        const downloadAnchorNode = document.createElement("a");

        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
            "download",
            `pnpnd_${filenamePart}_${new Date().getTime()}.json`,
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        showAlert({
            toast: true,
            type: "success",
            text: __("Data exported successfully!", "ninja-drive"),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    const handleImport = () => {
        const importInput = document.getElementById(
            "pnpnd-import-input",
        ) as HTMLInputElement;

        importInput?.click();
    };

    const handleImportData = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            console.error(__("No file selected for import", "ninja-drive"));
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const result = e.target?.result;

                if (typeof result !== "string") {
                    throw new Error("Invalid file content");
                }

                const importedData = JSON.parse(result);

                if (importedData.settings) {
                    try {
                        const response = await updateSettings(
                            importedData.settings,
                        ).unwrap();

                        dispatch(settingsInit(importedData.settings));

                        if (response.data?.settings) {
                            dispatch(settingsInit(importedData.settings));
                        }

                        showAlert({
                            toast: true,
                            type: "success",
                            text:
                                response?.message ||
                                __(
                                    "Settings imported successfully",
                                    "ninja-drive",
                                ),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    } catch (error: any) {
                        showAlert({
                            toast: true,
                            type: "error",
                            text:
                                error?.data?.message ||
                                __("Failed to import settings.", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                }

                if (importedData.widgets) {
                    try {
                        const response = await importShortcodes({
                            widgets: importedData.widgets,
                        }).unwrap();

                        showAlert({
                            toast: true,
                            type: "success",
                            text:
                                response?.message ||
                                __(
                                    "Shortcode widgets imported successfully",
                                    "ninja-drive",
                                ),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    } catch (error: any) {
                        showAlert({
                            toast: true,
                            type: "error",
                            text:
                                error?.data?.message ||
                                __(
                                    "Failed to import widget widgets.",
                                    "ninja-drive",
                                ),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                }
            } catch (error) {
                console.error(
                    __("Failed to import data:", "ninja-drive"),
                    error,
                );
            }
        };

        reader.onerror = (error) => {
            console.error(__("Error reading file:", "ninja-drive"), error);
        };

        reader.readAsText(file);
        event.target.value = "";
    };

    const handleReset = () => {
        showAlert({
            type: "error",
            title: __("Reset Settings", "ninja-drive"),
            text: __("Are you sure you want to reset all settings?", "ninja-drive"),
            showCancelButton: true,
            confirmButtonText: __("Reset", "ninja-drive"),
            onConfirm: async () => {
                try {
                    if (!defaultData) return;

                    const result = await updateSettings(defaultData).unwrap();

                    dispatch(settingsInit(result.data?.settings!));

                    const color =
                        result.data?.settings?.appearance?.primaryColor ||
                        "#1F6CFA";

                    const root = document.documentElement;

                    root.style.setProperty(CSS_VAR.PRIMARY, color);

                    navigate("/settings/accounts");

                    showAlert({
                        toast: true,
                        type: "success",
                        text: result?.message || __("Settings reset successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message || __("Failed to reset settings!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return (
        <PageContainer>
            <input
                id="pnpnd-import-input"
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportData}
            />

            <SettingsField
                description={__("Enable or Disable Auto Save on Settings Page.", "ninja-drive")}
                action={
                    <Switcher
                        title={__("Enable Auto Save", "ninja-drive")}
                        checked={autoSave}
                        onChange={() => saveTools("autoSave", !autoSave)}
                    />
                }
            />

            <SettingsField
                title={__("Clear Cache Files", "ninja-drive")}
                description={__("Clear cache files and update cloud file synchronization", "ninja-drive")}
                secondaryAction={
                    <Button variant="warning" size="small" startIcon="cached">
                        {__("Clear Cache", "ninja-drive")}
                    </Button>
                }
            />

            <SettingsField
                title={__("Export Data", "ninja-drive")}
                secondaryAction={
                    <InlineStack gap={10}>
                        <SelectBox
                            size="small"
                            style={{
                                width: "200px",
                            }}
                            options={EXPORT_OPTIONS}
                            value={[exportedData]}
                            onChange={(value) =>
                                setExportedData(value[0] as ExportOptions)
                            }
                        />

                        <Button
                            variant="primary"
                            size="small"
                            startIcon="output_circle"
                            onClick={handleExportData}
                        >
                            {__("Export", "ninja-drive")}
                        </Button>
                    </InlineStack>
                }
            >
                <Note>
                    <Note.Normal>
                        <Note.Title title={__("Note", "ninja-drive")} />
                        <Note.Text>
                            {__("Export your settings and widget widgets to backup or transfer to another site.", "ninja-drive")}
                        </Note.Text>
                    </Note.Normal>
                </Note>
            </SettingsField>

            <SettingsField
                title={__("Import Data", "ninja-drive")}
                description={__("Select the exported JSON file you would like to import. Please note that the import will replace the current data.", "ninja-drive")}
                secondaryAction={
                    <Button
                        variant="primary"
                        size="small"
                        startIcon="input_circle"
                        onClick={handleImport}
                    >
                        {__("Import", "ninja-drive")}
                    </Button>
                }
            />

            <SettingsField
                title={__("Reset Settings", "ninja-drive")}
                description={__("Reset all settings to the default values.", "ninja-drive")}
                secondaryAction={
                    <Button
                        variant="error"
                        size="small"
                        startIcon="autorenew"
                        onClick={handleReset}
                    >
                        {__("Reset", "ninja-drive")}
                    </Button>
                }
            />
        </PageContainer>
    );
};

export default Tools;

const EXPORT_OPTIONS: { name: string; value: string }[] = [
    {
        name: __("Export All", "ninja-drive"),
        value: "export_all",
    },
    {
        name: __("Settings", "ninja-drive"),
        value: "settings",
    },
    {
        name: __("Shortcode Widgets", "ninja-drive"),
        value: "shortcode_widgets",
    },
];
