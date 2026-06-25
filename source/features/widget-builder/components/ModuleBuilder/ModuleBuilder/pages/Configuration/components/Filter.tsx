import { updateFilter } from "~features/widget-builder/state/widgetBuilderSlice";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { getExtensions } from "~features/file-browser/utils/file";
import SettingsField from "~/shared/molecules/SettingsField";
import { ExtensionGroups } from "~kernel/types/Types";
import { toBoolean } from "~kernel/utils/functions";
import { PageContainer } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { GridStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Disabled } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { Switcher } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Status } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    MBFilter,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const Filter = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { type: widgetType, data } = edit_data ?? {};
    const { extension, name, upload } = data?.configuration?.filter ?? {};

    const dispatch = useAppDispatch();

    const widgetTypeToExtensionGroup: Record<string, keyof ExtensionGroups> = {
        gallery: "image",
        file_browser: "all",
        file_uploader: "all",
    };

    const extensionGroup =
        widgetTypeToExtensionGroup[widgetType ?? ""] ?? "all";

    const extensionList = getExtensions(extensionGroup);

    const extensionOptions = [
        ...new Set(extensionList.map((item) => item.trim())),
    ].map((item) => ({
        name: item,
        value: item,
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

    const handleApplyFiles = () => {
        if (!toBoolean(pnpnd?.is_pro)) return;

        updateName("apply_to", {
            ...name?.apply_to!,
            files: !name?.apply_to?.files,
        });
    };

    const handleApplyFolders = () => {
        if (!toBoolean(pnpnd?.is_pro)) return;

        updateName("apply_to", {
            ...name?.apply_to!,
            folders: !name?.apply_to?.folders,
        });
    };

    if (!extension && !name && !upload) return null;

    return (
        <PageContainer
            title={__("Filter Your Files", "ninja-drive")}
            docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
            compact
            style={{
                margin: "20px auto 0",
            }}
        >
            <SettingsField>
                {extension && (
                    <BlockStack gap={10}>
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Allowed Extensions", "ninja-drive")}
                            </Text>

                            <SelectBox
                                options={extensionOptions}
                                value={extension?.include || []}
                                multiple
                                searchable
                                size="small"
                                background="gray-50"
                                color="gray-200"
                                style={{
                                    minWidth: "200px",
                                }}
                                placeholder={__(
                                    "Select extensions to include",
                                    "ninja-drive",
                                )}
                                disabled={toBoolean(extension?.all!)}
                                onChange={(value) =>
                                    updateExtension(
                                        "include",
                                        value as string[],
                                    )
                                }
                            />
                        </InlineStack>

                        <Description
                            text={__(
                                "Select the extensions to allow in this widget.",
                                "ninja-drive",
                            )}
                        />

                        <Switcher
                            id="allowAllExtensions"
                            title={__("Allow all", "ninja-drive")}
                            titleSize="sm"
                            style={{
                                marginTop: "10px",
                            }}
                            checked={extension?.all}
                            onChange={(value) => updateExtension("all", value)}
                        />

                        <Disabled
                            gap={10}
                            depend={!extension?.all}
                            dependOn="allowAllExtensions"
                            dependOnExact={true}
                        >
                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Except", "ninja-drive")}
                                </Text>

                                <SelectBox
                                    options={extensionOptions}
                                    value={extension?.ignore || []}
                                    multiple
                                    searchable
                                    size="small"
                                    background="gray-50"
                                    color="gray-200"
                                    style={{
                                        minWidth: "200px",
                                    }}
                                    placeholder={__(
                                        "Select extensions to ignore",
                                        "ninja-drive",
                                    )}
                                    disabled={!toBoolean(extension?.all!)}
                                    onChange={(value) =>
                                        updateExtension(
                                            "ignore",
                                            value as string[],
                                        )
                                    }
                                />
                            </InlineStack>

                            <Description
                                text={__(
                                    "Select the extensions to ignore from this widget.",
                                    "ninja-drive",
                                )}
                            />
                        </Disabled>
                    </BlockStack>
                )}

                {upload && widgetType !== "file_browser" && (
                    <>
                        <Divider width="100%" height="1px" />

                        <BlockStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Uploader Configuration", "ninja-drive")}
                            </Text>

                            <Description
                                text={__(
                                    "Configure the maximum number of files that can be uploaded at once and the maximum and minimum file sizes.",
                                    "ninja-drive",
                                )}
                            />
                        </BlockStack>

                        <GridStack columns="auto-fit">
                            <Input
                                size="small"
                                type="number"
                                label={__("Max File Upload", "ninja-drive")}
                                labelColor="gray-700"
                                labelFontSize="sm"
                                background="gray-50"
                                color="gray-200"
                                value={upload?.max_files ?? ""}
                                onChange={(value) =>
                                    updateUpload("max_files", value as number)
                                }
                            />

                            <Input
                                size="small"
                                type="number"
                                label={__("Max File Size (MB)", "ninja-drive")}
                                labelColor="gray-700"
                                labelFontSize="sm"
                                background="gray-50"
                                color="gray-200"
                                value={upload?.max_size ?? ""}
                                onChange={(value) =>
                                    updateUpload("max_size", value as number)
                                }
                            />

                            <Input
                                size="small"
                                type="number"
                                label={__("Min File Size (MB)", "ninja-drive")}
                                labelColor="gray-700"
                                labelFontSize="sm"
                                background="gray-50"
                                color="gray-200"
                                value={upload?.min_size ?? ""}
                                onChange={(value) =>
                                    updateUpload("min_size", value as number)
                                }
                            />
                        </GridStack>
                    </>
                )}
            </SettingsField>
        </PageContainer>
    );
};

export default Filter;
