import { updateStyle } from "~/store/features/widgetBuilderSlice";
import PageContainer from "~/components/molecules/PageContainer";
import SettingsField from "~/components/molecules/SettingsField";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { StyleFileList } from "~/types/widget.types";
import Checkbox from "~/components/atoms/Checkbox";
import Divider from "~/components/atoms/Divider";
import Card from "~/components/molecules/Card";
import Input from "~/components/atoms/Input";
import Info from "~/components/atoms/Info";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import clsx from "clsx";
import {
    compact_presets,
    gallery_presets,
    grid_presets,
    list_presets,
    table_presets,
    timeline_presets,
} from "~/utils/presets-file-list";

const FileList = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { file_list } = edit_data?.data?.style || {};
    const { active_view, list_display } = file_list || {};

    const dispatch = useAppDispatch();

    const handleUpdate = (
        key: keyof StyleFileList,
        value: StyleFileList[keyof StyleFileList],
    ) => {
        if (!file_list) return;

        dispatch(
            updateStyle({
                key: "file_list",
                value: { ...file_list, [key]: value },
            }),
        );
    };

    const INFO_DISPLAY_OPTIONS: {
        key: keyof StyleFileList["list_display"];
        title: string;
        show: boolean;
    }[] = [
        {
            key: "name",
            title: __("File Name", "ninja-drive"),
            show: ["list", "table"].includes(active_view || ""),
        },
        {
            key: "thumbnail",
            title: __("File Thumbnail", "ninja-drive"),
            show: true,
        },
        {
            key: "extension",
            title: __("File Extension", "ninja-drive"),
            show: !["grid", "gallery", "compact"].includes(active_view || ""),
        },
        {
            key: "size",
            title: __("File Size", "ninja-drive"),
            show: true,
        },
        {
            key: "date",
            title: __("File Date", "ninja-drive"),
            show: !["gallery", "compact"].includes(active_view || ""),
        },
        {
            key: "actions",
            title: __("File Actions", "ninja-drive"),
            show: !["gallery"].includes(active_view || ""),
        },
    ];

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("File List Settings", "ninja-drive")}
            docLink={DOCS?.MODULE_BUILDER?.style?.link}
        >
            <SettingsField>
                <BlockStack gap={15}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Default View Style", "ninja-drive")}
                    </Text>

                    <InlineStack gap={10}>
                        {FILE_LIST_VIEW_LIST?.map(
                            ({ key, title, image }, index) => (
                                <Card
                                    key={key ?? index}
                                    padding={10}
                                    background="gray-50"
                                    border="gray-200"
                                    flex
                                    direction="col"
                                    blockAlign="center"
                                    gap={10}
                                    style={{
                                        width: "140px",
                                        height: "100px",
                                        cursor: "pointer",
                                    }}
                                    className={clsx(
                                        active_view === key && "outline-active",
                                    )}
                                    onClick={() =>
                                        handleUpdate("active_view", key)
                                    }
                                >
                                    <div
                                        style={{
                                            height: "70%",
                                        }}
                                    >
                                        <img
                                            src={image}
                                            width="100%"
                                            height="100%"
                                        />
                                    </div>

                                    <Text
                                        color="gray-700"
                                        size="xs"
                                        weight="medium"
                                    >
                                        {title}
                                    </Text>
                                </Card>
                            ),
                        )}
                    </InlineStack>
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("File Info Display", "ninja-drive")}
                    </Text>

                    <Description
                        text={__(
                            "Configure how the file list is displayed.",
                            "ninja-drive",
                        )}
                    />

                    <BlockStack gap={15} margin={5}>
                        {INFO_DISPLAY_OPTIONS?.filter(
                            (option) => option.show,
                        )?.map(({ key, title }, index) => (
                            <InlineStack key={key ?? index} gap={10}>
                                <Checkbox
                                    key={key ?? index}
                                    rounded="sm"
                                    checked={list_display?.[key]?.enable}
                                    onChange={() =>
                                        handleUpdate("list_display", {
                                            ...list_display,
                                            [key]: {
                                                ...(list_display?.[key] || {}),
                                                enable: !list_display?.[key]
                                                    ?.enable,
                                            },
                                        } as StyleFileList["list_display"])
                                    }
                                />

                                <Text
                                    color="gray-700"
                                    size="sm"
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() =>
                                        handleUpdate("list_display", {
                                            ...list_display,
                                            [key]: {
                                                ...(list_display?.[key] || {}),
                                                enable: !list_display?.[key]
                                                    ?.enable,
                                            },
                                        } as StyleFileList["list_display"])
                                    }
                                >
                                    {title}
                                </Text>

                                <Info title={title} />
                            </InlineStack>
                        ))}
                    </BlockStack>
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Checkbox
                        rounded="sm"
                        title={__("Table Column Names", "ninja-drive")}
                    />

                    <Description
                        text={__(
                            "Configure the names of the table columns.",
                            "ninja-drive",
                        )}
                    />

                    <InlineStack gap={10} wrap={false}>
                        {INFO_DISPLAY_OPTIONS?.filter((option) =>
                            ["thumbnail"].includes(option.key)
                                ? false
                                : option.show,
                        )?.map(({ key, title }, index) => (
                            <BlockStack
                                key={key ?? index}
                                gap={10}
                                style={{ minWidth: 0 }}
                                className="flex-1"
                            >
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {title}
                                </Text>

                                <Input
                                    size="small"
                                    fullWidth={false}
                                    background="gray-50"
                                    color="gray-200"
                                    style={{
                                        width: "100%",
                                        minWidth: 0,
                                    }}
                                    className="flex-1"
                                    value={list_display?.[key]?.text || ""}
                                    onChange={(value) => {
                                        if (!list_display) return;
                                        handleUpdate("list_display", {
                                            ...list_display,
                                            [key]: {
                                                ...list_display?.[key],
                                                text: value as string,
                                            },
                                        });
                                    }}
                                    disabled={!list_display?.[key]?.enable}
                                />
                            </BlockStack>
                        ))}
                    </InlineStack>
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default FileList;

export const FILE_LIST_VIEW_LIST: {
    key: StyleFileList["active_view"];
    title: string;
    image: string;
}[] = [
    {
        key: "list",
        title: __("List", "ninja-drive"),
        image: list_presets,
    },
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        image: grid_presets,
    },
    {
        key: "compact",
        title: __("Compact", "ninja-drive"),
        image: compact_presets,
    },
    {
        key: "table",
        title: __("Table", "ninja-drive"),
        image: table_presets,
    },
    {
        key: "gallery",
        title: __("Gallery", "ninja-drive"),
        image: gallery_presets,
    },
    {
        key: "timeline",
        title: __("Timeline", "ninja-drive"),
        image: timeline_presets,
    },
];
