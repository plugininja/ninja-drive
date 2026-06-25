import { updateStyle } from "~features/widget-builder/state/widgetBuilderSlice";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import SettingsField from "~/shared/molecules/SettingsField";
import { toBoolean } from "~kernel/utils/functions";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Tabs } from "~/ui/atoms";
import {
    ModuleKey,
    StyleFileBrowser,
    TPreviewStyle,
} from "~features/widget-builder/types/widget.types";

const FileBrowser = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { file_browser } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const { folder_view, header_options, list_view_table_head } =
        file_browser || {};

    const handleUpdate = (
        key: keyof StyleFileBrowser,
        value: StyleFileBrowser[keyof StyleFileBrowser],
    ) => {
        dispatch(
            updateStyle({
                key: "file_browser",
                value: {
                    ...file_browser!,
                    [key]: value,
                },
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("Display Settings", "ninja-drive")}
            docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
        >
            <SettingsField>
                {folder_view && (
                    <BlockStack gap={15}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Default View Style", "ninja-drive")}
                        </Text>

                        <Tabs
                            size="small"
                            rounded="md"
                            tabRounded="sm"
                            tabs={VIEW_STYLE_TABS}
                            active={folder_view || "grid"}
                            onTabClick={(value) =>
                                handleUpdate(
                                    "folder_view",
                                    value as TPreviewStyle,
                                )
                            }
                        />
                    </BlockStack>
                )}

                <Divider width="100%" height="1px" />

                {folder_view === "list" && (
                    <>
                        <BlockStack gap={10}>
                            <Checkbox
                                rounded="sm"
                                title={__("Table Column Names", "ninja-drive")}
                                checked={list_view_table_head?.enable}
                                onChange={() =>
                                    handleUpdate("list_view_table_head", {
                                        ...list_view_table_head!,
                                        enable: !list_view_table_head?.enable,
                                    })
                                }
                            />

                            <Description
                                text={__(
                                    "Enable or disable table column names.",
                                    "ninja-drive",
                                )}
                            />

                            {file_browser?.list_view_table_head?.enable && (
                                <InlineStack
                                    gap={10}
                                    wrap={false}
                                    marginTop={5}
                                >
                                    {[
                                        "name",
                                        "type",
                                        "size",
                                        "updated",
                                        "action",
                                    ]?.map((key) => (
                                        <BlockStack key={key} gap={10}>
                                            <Text
                                                color="gray-700"
                                                size="sm"
                                                weight="medium"
                                                textTransform="capitalize"
                                            >
                                                {`File ${key} column`}
                                            </Text>

                                            <Input
                                                size="small"
                                                background="gray-50"
                                                color="gray-200"
                                                fullWidth={false}
                                                className="flex-1"
                                                value={
                                                    list_view_table_head?.[
                                                        key as
                                                            | "name"
                                                            | "type"
                                                            | "size"
                                                            | "updated"
                                                            | "action"
                                                    ] || ""
                                                }
                                                onChange={(value) =>
                                                    handleUpdate(
                                                        "list_view_table_head",
                                                        {
                                                            ...list_view_table_head!,
                                                            [key]: value as string,
                                                        },
                                                    )
                                                }
                                            />
                                        </BlockStack>
                                    ))}
                                </InlineStack>
                            )}
                        </BlockStack>

                        <Divider width="100%" height="1px" />
                    </>
                )}

            </SettingsField>
        </PageContainer>
    );
};

export default FileBrowser;

const VIEW_STYLE_TABS: {
    key: "grid" | "list";
    title: string;
    icon: string;
}[] = [
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        icon: "grid_view",
    },
    {
        key: "list",
        title: __("List", "ninja-drive"),
        icon: "dehaze",
    },
];

const HEADER_OPTIONS: {
    key: "breadcrumb" | "refresh" | "sorting" | "root_upload";
    title: string;
}[] = [
    {
        key: "breadcrumb",
        title: __("Breadcrumbs", "ninja-drive"),
    },
    {
        key: "refresh",
        title: __("Refresh Button", "ninja-drive"),
    },
    {
        key: "sorting",
        title: __("Sorting", "ninja-drive"),
    },
    {
        key: "root_upload",
        title: __("Enable Root Upload and Create New Folder", "ninja-drive"),
    },
];
