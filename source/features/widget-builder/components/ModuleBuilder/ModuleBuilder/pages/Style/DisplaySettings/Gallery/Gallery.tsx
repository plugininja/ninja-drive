import { updateStyle } from "~features/widget-builder/state/widgetBuilderSlice";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import SettingsField from "~/shared/molecules/SettingsField";
import { toBoolean } from "~kernel/utils/functions";
import { PageContainer } from "~/ui/molecules";
import { useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { Switcher } from "~/ui/atoms";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Status } from "~/ui/atoms";
import { Slider } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Tabs } from "~/ui/atoms";
import clsx from "clsx";
import {
    grid_presets,
    hover_reveal_presets,
    masonry_presets,
    mosaic_presets,
    polaroid_presets,
} from "~features/widget-builder/utils/presets-gallery";
import {
    ModuleKey,
    StyleGallery,
} from "~features/widget-builder/types/widget.types";

const Gallery = () => {
    const [columnType, setColumnType] = useState<
        "desktop" | "tablet" | "mobile"
    >("desktop");
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const gallery = edit_data?.data?.style?.gallery;

    const dispatch = useAppDispatch();

    if (!gallery) return null;

    const handleUpdate = (
        key: keyof StyleGallery,
        value: StyleGallery[keyof StyleGallery],
    ) => {
        if (!gallery) return;

        if (key === "layout" && value === "polaroid") {
            dispatch(
                updateStyle({
                    key: "gallery",
                    value: {
                        ...gallery,
                        [key]: value,
                        thumbnail_spacing: {
                            desktop: { value: 3, unit: "rem" },
                            laptop: { value: 3, unit: "rem" },
                            tablet: { value: 3, unit: "rem" },
                            mobile: { value: 3, unit: "rem" },
                        },
                        thumbnail_radius: {
                            desktop: { value: 5, unit: "px" },
                            laptop: { value: 5, unit: "px" },
                            tablet: { value: 5, unit: "px" },
                            mobile: { value: 5, unit: "px" },
                        },
                    },
                }),
            );
        } else {
            dispatch(
                updateStyle({
                    key: "gallery",
                    value: {
                        ...gallery,
                        [key]: value,
                    },
                }),
            );
        }
    };

    return (
        <>
            <PageContainer
                compact
                style={{ margin: "0 auto" }}
                title={__("Gallery Settings", "ninja-drive")}
                docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
            >
                <SettingsField>
                    <BlockStack gap={15}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Default View Style", "ninja-drive")}
                        </Text>

                        <InlineStack gap={10}>
                            {GALLERY_LAYOUT_BUTTONS?.map(
                                ({ key, title, image, isPro }, index) => (
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
                                            gallery?.layout === key &&
                                                "outline-active",
                                        )}
                                        onClick={() => {
                                            if (
                                                isPro &&
                                                !toBoolean(pnpnd?.is_pro)
                                            )
                                                return;

                                            handleUpdate(
                                                "layout",
                                                key as StyleGallery["layout"],
                                            );
                                        }}
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

                                        <InlineStack gap={10}>
                                            <Text
                                                color="gray-700"
                                                size="xs"
                                                weight="medium"
                                            >
                                                {title}
                                            </Text>

                                            {isPro && <Status.Pro />}
                                        </InlineStack>
                                    </Card>
                                ),
                            )}
                        </InlineStack>
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Image Quality", "ninja-drive")}
                        </Text>

                        {THUMBNAIL_QUALITY_BUTTONS?.map(
                            ({ key, title }, index) => (
                                <Checkbox
                                    key={key ?? index}
                                    rounded="sm"
                                    title={title}
                                    checked={gallery?.thumbnail_quality === key}
                                    onChange={() =>
                                        handleUpdate(
                                            "thumbnail_quality",
                                            key as StyleGallery["thumbnail_quality"],
                                        )
                                    }
                                />
                            ),
                        )}
                    </InlineStack>

                </SettingsField>
            </PageContainer>

            <PageContainer
                compact
                style={{ margin: "20px auto 0" }}
                title={__("Gallery Spacing & Item", "ninja-drive")}
                docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
            >
                <SettingsField>
                    <Tabs
                        size="small"
                        rounded="md"
                        tabRounded="sm"
                        tabs={DEVICE_BUTTONS}
                        active={columnType}
                        onTabClick={(value) =>
                            setColumnType(
                                value as "desktop" | "tablet" | "mobile",
                            )
                        }
                    />

                    <Divider width="100%" height="1px" />

                    <InlineStack gap={50}>
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Columns", "ninja-drive")}
                            </Text>

                            <Slider
                                onlyInput
                                min={1}
                                max={24}
                                defaultValue={1}
                                value={parseInt(
                                    gallery?.columns[columnType]?.toString() ??
                                        "1",
                                )}
                                onChange={(value) =>
                                    handleUpdate("columns", {
                                        ...gallery?.columns,
                                        [columnType]: value,
                                    })
                                }
                                reset
                            />
                        </InlineStack>

                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Spacing", "ninja-drive")}
                            </Text>

                            <Slider
                                onlyInput
                                min={0}
                                max={
                                    gallery?.thumbnail_spacing?.[columnType]
                                        ?.unit === "rem"
                                        ? 10
                                        : 100
                                }
                                defaultValue={1}
                                value={
                                    gallery?.thumbnail_spacing?.[columnType]
                                        ?.value ?? 1
                                }
                                onChange={(value, unit) => {
                                    handleUpdate("thumbnail_spacing", {
                                        ...gallery?.thumbnail_spacing,
                                        [columnType]: {
                                            value: value,
                                            unit: unit as string,
                                        },
                                    });
                                }}
                                unit
                                unitOptions={[
                                    {
                                        name: "rem",
                                        value: "rem",
                                        defaultValue: 1,
                                    },
                                    {
                                        name: "px",
                                        value: "px",
                                        defaultValue: 16,
                                    },
                                ]}
                                unitValue={[
                                    gallery?.thumbnail_spacing?.[columnType]
                                        ?.unit || "rem",
                                ]}
                                defaultUnit="rem"
                                showMark
                                reset
                            />
                        </InlineStack>

                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Radius", "ninja-drive")}
                            </Text>

                            <Slider
                                onlyInput
                                min={0}
                                max={
                                    gallery?.thumbnail_radius?.[columnType]
                                        ?.unit === "rem"
                                        ? 10
                                        : 100
                                }
                                defaultValue={1}
                                value={
                                    gallery?.thumbnail_radius?.[columnType]
                                        ?.value ?? 1
                                }
                                onChange={(value, unit) => {
                                    handleUpdate("thumbnail_radius", {
                                        ...gallery?.thumbnail_radius,
                                        [columnType]: {
                                            value: value,
                                            unit: unit as string,
                                        },
                                    });
                                }}
                                unit
                                unitOptions={[
                                    {
                                        name: "rem",
                                        value: "rem",
                                        defaultValue: 1,
                                    },
                                    {
                                        name: "px",
                                        value: "px",
                                        defaultValue: 16,
                                    },
                                ]}
                                unitValue={[
                                    gallery?.thumbnail_radius?.[columnType]
                                        ?.unit || "rem",
                                ]}
                                defaultUnit="rem"
                                showMark
                                reset
                            />
                        </InlineStack>
                    </InlineStack>
                </SettingsField>
            </PageContainer>
        </>
    );
};

export default Gallery;

const GALLERY_LAYOUT_BUTTONS: {
    key: StyleGallery["layout"];
    title: string;
    image?: string;
    isPro?: boolean;
}[] = [
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        image: grid_presets,
    },
];

const THUMBNAIL_QUALITY_BUTTONS: {
    key: "original" | "large" | "medium" | "thumbnail";
    title: string;
}[] = [
    {
        key: "original",
        title: __("Original", "ninja-drive"),
    },
    {
        key: "large",
        title: __("Large", "ninja-drive"),
    },
    {
        key: "medium",
        title: __("Medium", "ninja-drive"),
    },
    {
        key: "thumbnail",
        title: __("Thumbnail", "ninja-drive"),
    },
];

const OVERLAY_OPTIONS: {
    key:
        | "overlay_display_number"
        | "overlay_display_title"
        | "overlay_display_description";
    title: string;
}[] = [
    {
        key: "overlay_display_number",
        title: __("Show File Serial Number", "ninja-drive"),
    },
    {
        key: "overlay_display_title",
        title: __("Show File Name", "ninja-drive"),
    },
    {
        key: "overlay_display_description",
        title: __("Show File Description", "ninja-drive"),
    },
];

export const DEVICE_BUTTONS: {
    key: "desktop" | "laptop" | "tablet" | "mobile";
    title: string;
    icon: string;
}[] = [
    {
        key: "desktop",
        title: __("Desktop", "ninja-drive"),
        icon: "screenshot_monitor",
    },
    {
        key: "laptop",
        title: __("Laptop", "ninja-drive"),
        icon: "laptop_windows",
    },
    {
        key: "tablet",
        title: __("Tablet", "ninja-drive"),
        icon: "tablet_mac",
    },
    {
        key: "mobile",
        title: __("Mobile", "ninja-drive"),
        icon: "mobile_2",
    },
];
