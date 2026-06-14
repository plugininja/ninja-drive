import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { StyleSliderCarousel } from "~/types/widget.types";
import SelectBox from "~/components/molecules/SelectBox";
import Checkbox from "~/components/atoms/Checkbox";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Slider from "~/components/atoms/Slider";
import Radio from "~/components/atoms/Radio";
import Tabs from "~/components/atoms/Tabs";
import Text from "~/components/atoms/Text";
import Info from "~/components/atoms/Info";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import {
    updateEditData,
    updateStyle,
} from "~/store/features/widgetBuilderSlice";

const SliderCarousel = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { slider_carousel } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const {
        slide_to_show_display,
        slide_to_show,
        show_overlay,
        thumbnail_quality,
        item_gap,
        border_radius,
        slide_auto_play,
        auto_play_speed,
        infinite_loop,
        mouse_control,
        show_slider_caption,
    } = slider_carousel || {};

    const handleUpdate = (
        key: keyof StyleSliderCarousel,
        value: StyleSliderCarousel[keyof StyleSliderCarousel],
    ) => {
        if (!slider_carousel) return;

        if (
            (key === "slider_direction" && value == "vertical") ||
            key === "slider_effect"
        ) {
            if (!edit_data) return;
            dispatch(
                updateEditData({
                    key: "data",
                    value: {
                        ...edit_data.data,
                        style: {
                            ...edit_data.data.style,
                            height: {
                                unit: "px",
                                value: 600,
                            },
                            slider_carousel: {
                                ...edit_data.data.style.slider_carousel!,
                                [key]: value,
                            },
                        },
                    },
                }),
            );
            return;
        }

        dispatch(
            updateStyle({
                key: "slider_carousel",
                value: { ...slider_carousel, [key]: value },
            }),
        );
    };

    const SELECT_OPTIONS: {
        key: keyof StyleSliderCarousel;
        title: string;
        options: SelectOption[];
    }[] = [
        {
            key: "slider_direction",
            title: __("Slider Direction", "ninja-drive"),
            options: SLIDER_DIRECTION_OPTIONS,
        },
        {
            key: "slider_type",
            title: __("Slider Type", "ninja-drive"),
            options: SLIDER_TYPE_OPTIONS,
        },
        {
            key: "slider_effect",
            title: __("Slider Effect", "ninja-drive"),
            options: SLIDER_EFFECT_OPTIONS,
        },
        {
            key: "navigation_style",
            title: __("Navigation", "ninja-drive"),
            options: ADVANCED_SLIDER_NAVIGATION_STYLE,
        },
    ];

    return (
        <>
            <PageContainer
                compact
                style={{ margin: "0 auto" }}
                title={__("Carousel Settings", "ninja-drive")}
                docLink={DOCS?.MODULE_BUILDER?.style?.link}
            >
                <SettingsField>
                    <InlineStack gap={10} wrap={false}>
                        {SELECT_OPTIONS?.map(
                            ({ key, title, options }, index) => (
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

                                    <SelectBox
                                        size="small"
                                        background="gray-50"
                                        color="gray-200"
                                        style={{
                                            width: "100%",
                                            minWidth: 0,
                                        }}
                                        className="flex-1"
                                        options={options}
                                        value={[
                                            String(
                                                slider_carousel?.[key] || "",
                                            ),
                                        ]}
                                        onChange={(value) =>
                                            handleUpdate(
                                                key,
                                                value[0] as StyleSliderCarousel[keyof StyleSliderCarousel],
                                            )
                                        }
                                    />
                                </BlockStack>
                            ),
                        )}
                    </InlineStack>

                    <Divider width="100%" height="1px" />

                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Image Quality", "ninja-drive")}
                        </Text>

                        {ADVANCED_SLIDER_THUMBNAIL_QUALITY_OPTIONS?.map(
                            ({ key, title }, index) => (
                                <Radio
                                    key={key ?? index}
                                    title={title}
                                    checked={thumbnail_quality === key}
                                    onChange={() =>
                                        handleUpdate("thumbnail_quality", key)
                                    }
                                />
                            ),
                        )}
                    </InlineStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Show Overlay", "ninja-drive")}
                            titleSize="sm"
                            checked={show_overlay}
                            onChange={() =>
                                handleUpdate("show_overlay", !show_overlay)
                            }
                        />

                        <Description
                            text={__("Show overlay on hover.", "ninja-drive")}
                        />

                        {show_overlay && (
                            <InlineStack gap={10} style={{ marginTop: 5 }}>
                                <Checkbox
                                    rounded="sm"
                                    checked={show_slider_caption}
                                    onChange={() =>
                                        handleUpdate(
                                            "show_slider_caption",
                                            !show_slider_caption,
                                        )
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
                                        handleUpdate(
                                            "show_slider_caption",
                                            !show_slider_caption,
                                        )
                                    }
                                >
                                    {__("Show File Description", "ninja-drive")}
                                </Text>

                                <Info
                                    title={__(
                                        "Show File Description Info",
                                        "ninja-drive",
                                    )}
                                />
                            </InlineStack>
                        )}
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Loop Slides", "ninja-drive")}
                            titleSize="sm"
                            checked={infinite_loop}
                            onChange={() =>
                                handleUpdate("infinite_loop", !infinite_loop)
                            }
                        />

                        <Description
                            text={__(
                                "Loop slides continuously.",
                                "ninja-drive",
                            )}
                        />
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Mouse Control", "ninja-drive")}
                            titleSize="sm"
                            checked={mouse_control}
                            onChange={() =>
                                handleUpdate("mouse_control", !mouse_control)
                            }
                        />

                        <Description
                            text={__(
                                "Enable mouse control for slides.",
                                "ninja-drive",
                            )}
                        />
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Slide Auto Play", "ninja-drive")}
                            titleSize="sm"
                            checked={slide_auto_play}
                            onChange={() =>
                                handleUpdate(
                                    "slide_auto_play",
                                    !slide_auto_play,
                                )
                            }
                        />

                        <Description
                            text={__(
                                "Automatically play slides.",
                                "ninja-drive",
                            )}
                        />

                        {slide_auto_play && (
                            <InlineStack marginTop={5} gap={10} wrap={false}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Auto Play Speed", "ninja-drive")}
                                </Text>

                                <Slider
                                    onlyInput
                                    min={1000}
                                    max={100000}
                                    value={auto_play_speed || 3000}
                                    defaultValue={3000}
                                    onChange={(value) =>
                                        handleUpdate("auto_play_speed", value)
                                    }
                                    unit
                                    unitOptions={[
                                        {
                                            name: "SEC",
                                            value: "sec",
                                            defaultValue: 600,
                                        },
                                    ]}
                                    unitValue={["sec"]}
                                    defaultUnit="sec"
                                    reset
                                />
                            </InlineStack>
                        )}
                    </BlockStack>
                </SettingsField>
            </PageContainer>

            <PageContainer
                compact
                style={{ margin: "20px auto 0" }}
                title={__("Carousel Spacing & Item", "ninja-drive")}
                docLink={DOCS?.MODULE_BUILDER?.style?.link}
            >
                <SettingsField>
                    <Tabs
                        size="small"
                        rounded="md"
                        tabRounded="sm"
                        tabs={DEVICE_BUTTONS}
                        active={slide_to_show_display || "desktop"}
                        onTabClick={(value) =>
                            handleUpdate(
                                "slide_to_show_display",
                                value as
                                    | "desktop"
                                    | "laptop"
                                    | "tablet"
                                    | "mobile",
                            )
                        }
                    />

                    <Divider width="100%" height="1px" />

                    <InlineStack gap={50}>
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Slide To Show", "ninja-drive")}
                            </Text>

                            <Info
                                title={__("Slide To Show Info", "ninja-drive")}
                            />

                            <Slider
                                onlyInput
                                min={1}
                                max={10}
                                value={
                                    slide_to_show?.[
                                        slide_to_show_display as
                                            | "desktop"
                                            | "laptop"
                                            | "tablet"
                                            | "mobile"
                                    ] ?? 1
                                }
                                defaultValue={1}
                                onChange={(value) => {
                                    if (!slider_carousel) return;

                                    handleUpdate("slide_to_show", {
                                        ...slider_carousel?.slide_to_show,
                                        [slide_to_show_display as
                                            | "desktop"
                                            | "laptop"
                                            | "tablet"
                                            | "mobile"]: value,
                                    });
                                }}
                                reset
                            />
                        </InlineStack>

                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Spacing", "ninja-drive")}
                            </Text>

                            <Info title={__("Spacing Info", "ninja-drive")} />

                            <Slider
                                onlyInput
                                min={0}
                                max={100}
                                value={item_gap || 0}
                                defaultValue={0}
                                onChange={(value) =>
                                    handleUpdate("item_gap", value)
                                }
                                reset
                            />
                        </InlineStack>

                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Radius", "ninja-drive")}
                            </Text>

                            <Info title={__("Radius Info", "ninja-drive")} />

                            <Slider
                                onlyInput
                                min={0}
                                max={100}
                                value={border_radius || 0}
                                defaultValue={0}
                                onChange={(value) =>
                                    handleUpdate("border_radius", value)
                                }
                                reset
                            />
                        </InlineStack>
                    </InlineStack>
                </SettingsField>
            </PageContainer>
        </>
    );
};

export default SliderCarousel;

type SelectOption = {
    name: string;
    value:
        | ("horizontal" | "vertical")
        | ("normal" | "centered")
        | ("slide" | "flip" | "fade")
        | ("arrows-dots" | "arrows" | "dots" | "none");
};

const SLIDER_DIRECTION_OPTIONS: {
    name: string;
    value: "horizontal" | "vertical";
}[] = [
    {
        name: __("Horizontal", "ninja-drive"),
        value: "horizontal",
    },
    {
        name: __("Vertical", "ninja-drive"),
        value: "vertical",
    },
];

const SLIDER_TYPE_OPTIONS: { name: string; value: "normal" | "centered" }[] = [
    {
        name: __("Normal", "ninja-drive"),
        value: "normal",
    },
    {
        name: __("Centered", "ninja-drive"),
        value: "centered",
    },
];

const SLIDER_EFFECT_OPTIONS: {
    name: string;
    value: "slide" | "flip" | "fade";
}[] = [
    { name: __("Slide", "ninja-drive"), value: "slide" },
    { name: __("Flip", "ninja-drive"), value: "flip" },
    { name: __("Fade", "ninja-drive"), value: "fade" },
];

const ADVANCED_SLIDER_NAVIGATION_STYLE: {
    name: string;
    value: "arrows-dots" | "arrows" | "dots" | "none";
}[] = [
    {
        name: __("Arrows & Dots", "ninja-drive"),
        value: "arrows-dots",
    },
    {
        name: __("Arrows", "ninja-drive"),
        value: "arrows",
    },
    {
        name: __("Dots", "ninja-drive"),
        value: "dots",
    },
    {
        name: __("None", "ninja-drive"),
        value: "none",
    },
];

const ADVANCED_SLIDER_THUMBNAIL_QUALITY_OPTIONS: {
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

const DEVICE_BUTTONS: {
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
