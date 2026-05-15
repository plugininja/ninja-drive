import { updateFilter } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { MBFilter } from "~/types/widget.types";
import { ExtensionGroups } from "~/types/Types";
import SelectBox from "~/components/molecules/SelectBox";
import GridStack from "~/components/molecules/GridStack";
import { toBoolean } from "~/utils/functions";
import { getExtensions } from "~/utils/file";
import Switcher from "~/components/atoms/Switcher";
import Checkbox from "~/components/atoms/Checkbox";
import Note from "~/components/molecules/Note";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Card from "~/components/molecules/Card";
import DOCS from "~/utils/docs";

const Filter = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { type: widgetType, data } = editData ?? {};
    const { extension, name, upload } = data?.filter ?? {};

    const dispatch = useAppDispatch();

    const widgetTypeToExtensionGroup: Record<string, keyof ExtensionGroups> = {
        gallery: "image",
        "file-browser": "all",
        "file-uploader": "all",
    };

    const extensionGroup =
        widgetTypeToExtensionGroup[widgetType ?? ""] ?? "all";
    const extensionList = getExtensions(extensionGroup);
    const extensionOptions = extensionList?.map((item) => ({
        name: item.trim(),
        value: item.trim(),
    }));

    const updateExtension = (
        key: keyof MBFilter["extension"],
        value: MBFilter["extension"][keyof MBFilter["extension"]],
    ) => {
        if (!extension) return;

        dispatch(
            updateFilter({
                key: "extension",
                value: { ...extension, [key]: value },
            }),
        );
    };

    const updateName = (
        key: keyof MBFilter["name"],
        value: MBFilter["name"][keyof MBFilter["name"]],
    ) => {
        if (!name) return;

        dispatch(
            updateFilter({
                key: "name",
                value: { ...name, [key]: value },
            }),
        );
    };

    const updateUpload = (
        key: keyof MBFilter["upload"],
        value: MBFilter["upload"][keyof MBFilter["upload"]],
    ) => {
        if (!upload) return;

        dispatch(
            updateFilter({
                key: "upload",
                value: { ...upload, [key]: value },
            }),
        );
    };

    return (
        <PageContainer
            widget
            title={__("Filters", "ninja-drive")}
            description={__(
                "Show/ hide files and folders and filter them by extensions and names to not display in the file browser.",
                "ninja-drive",
            )}
            docLink={DOCS?.MODULE_BUILDER?.filter?.link}
        >
            {extension && (
                <SettingsField
                    title={__("Allowed Extensions", "ninja-drive")}
                    description={__(
                        "Select the extensions to allow in this widget.",
                        "ninja-drive",
                    )}
                    secondaryAction={
                        <SelectBox
                            options={extensionOptions}
                            value={extension?.include || []}
                            multiple
                            searchable
                            size="small"
                            style={{
                                minWidth: "200px",
                            }}
                            placeholder={__(
                                "Select extensions to include",
                                "ninja-drive",
                            )}
                            disabled={toBoolean(extension?.all!)}
                            onChange={(value) =>
                                updateExtension("include", value as string[])
                            }
                        />
                    }
                >
                    <SettingsField.SubField
                        action={
                            <Switcher
                                id="allowAllExtensions"
                                title={__(
                                    "Allow all",
                                    "ninja-drive",
                                )}
                                checked={extension?.all}
                                onChange={(value) =>
                                    updateExtension("all", value)
                                }
                            />
                        }
                        description={__(
                            "Allow all extensions in this widget.",
                            "ninja-drive",
                        )}
                    >
                        <SettingsField.SubField
                            title={__(
                                "Exclude Extensions",
                                "ninja-drive",
                            )}
                            description={__(
                                "Select the extensions to exclude from this widget.",
                                "ninja-drive",
                            )}
                            background="white"
                            secondaryAction={
                                <SelectBox
                                    options={extensionOptions}
                                    value={extension?.exclude || []}
                                    multiple
                                    searchable
                                    size="small"
                                    style={{
                                        minWidth: "200px",
                                    }}
                                    placeholder={__(
                                        "Select extensions to exclude",
                                        "ninja-drive",
                                    )}
                                    disabled={!toBoolean(extension?.all!)}
                                    onChange={(value) =>
                                        updateExtension(
                                            "exclude",
                                            value as string[],
                                        )
                                    }
                                />
                            }
                        />
                    </SettingsField.SubField>
                </SettingsField>
            )}

            {upload && widgetType !== "file-browser" && (
                <SettingsField
                    title={__(
                        "Uploader Configuration",
                        "ninja-drive",
                    )}
                    description={__(
                        "Configure the maximum number of files that can be uploaded at once and the maximum and minimum file sizes.",
                        "ninja-drive",
                    )}
                >
                    <SettingsField.SubField>
                        <GridStack columns={"auto-fit"}>
                            <Input
                                size="small"
                                type="number"
                                label="Max File Upload"
                                helperText={__(
                                    "Enter the max number of files to upload at once. Leave empty for no limit.",
                                    "ninja-drive",
                                )}
                                value={upload?.maxFiles ?? ""}
                                onChange={(value) =>
                                    updateUpload("maxFiles", value as number)
                                }
                            />

                            <Input
                                size="small"
                                type="number"
                                label="Max File Size (MB)"
                                helperText={__(
                                    "Enter the maximum upload file size (MB).",
                                    "ninja-drive",
                                )}
                                value={upload?.maxSize ?? ""}
                                onChange={(value) =>
                                    updateUpload("maxSize", value as number)
                                }
                            />

                            <Input
                                size="small"
                                type="number"
                                label="Min File Size (MB)"
                                helperText={__(
                                    "Enter the minimum upload file size (MB).",
                                    "ninja-drive",
                                )}
                                value={upload?.minSize ?? ""}
                                onChange={(value) =>
                                    updateUpload("minSize", value as number)
                                }
                            />
                        </GridStack>
                    </SettingsField.SubField>
                </SettingsField>
            )}
        </PageContainer>
    );
};

export default Filter;

const ALLOW_NOTES: { title: string; text: string }[] = [
    {
        title: __("report*, *.txt", "ninja-drive"),
        text: __(
            "will match all files that start with report and have the .txt extension.",
            "ninja-drive",
        ),
    },
    {
        title: __("file?, image_*", "ninja-drive"),
        text: __(
            'will match all files that start with file like "file1", "file2", and all files that start with image_.',
            "ninja-drive",
        ),
    },
];
