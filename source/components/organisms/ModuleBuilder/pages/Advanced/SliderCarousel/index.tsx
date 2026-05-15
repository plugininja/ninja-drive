import {
    updateAdvanced,
    updateEditData,
} from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { AdvancedSliderCarousel } from "~/types/widget.types";
import Description from "~/components/molecules/Description";
import SettingsField from "~/components/molecules/SettingsField";
import Disabled from "~/components/molecules/Disabled";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import BlockStack from "~/components/molecules/BlockStack";
import Slider from "~/components/atoms/Slider";
import SelectBox from "~/components/molecules/SelectBox";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import {
    ADVANCED_SLIDE_TO_SHOW_DISPLAY_OPTIONS,
    ADVANCED_SLIDER_NAVIGATION_STYLE,
    ADVANCED_SLIDER_THUMBNAIL_QUALITY_OPTIONS,
} from "~/constants/widget";
import Note from "~/components/molecules/Note";

const SliderCarousel = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { sliderCarousel } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const {
        sliderDirection,
        sliderType,
        sliderEffect,
        showNavigation,
        navigationStyle,
        slideToShowDisplay,
        slideToShow,
        showOverlay,
        thumbnailQuality,
        itemGap,
        borderRadius,
        slideAutoPlay,
        autoPlaySpeed,
        infiniteLoop,
        mouseControl,
        showSliderCaption,
    } = sliderCarousel || {};

    const handleUpdate = (
        key: keyof AdvancedSliderCarousel,
        value: AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
    ) => {
        if (!sliderCarousel) return;

        if (
            (key === "sliderDirection" && value == "vertical") ||
            key === "sliderEffect"
        ) {
            if (!editData) return;
            dispatch(
                updateEditData({
                    key: "data",
                    value: {
                        ...editData.data,
                        advanced: {
                            ...editData.data.advanced,
                            height: {
                                unit: "px",
                                value: 600,
                            },
                            sliderCarousel: {
                                ...editData.data.advanced.sliderCarousel,
                                [key]: value,
                            },
                        },
                    },
                }),
            );
            return;
        }

        dispatch(
            updateAdvanced({
                key: "sliderCarousel",
                value: { ...sliderCarousel, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                title="Slider Direction"
                description="Select the direction of the slider."
                secondaryAction={
                    <SelectBox
                        size="small"
                        options={SLIDER_DIRECTION_OPTIONS}
                        value={[sliderDirection || "horizontal"]}
                        onChange={(value) =>
                            handleUpdate(
                                "sliderDirection",
                                value[0] as AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
                            )
                        }
                    />
                }
            >
                {sliderCarousel?.sliderDirection === "vertical" && (
                    <Note type="warning">
                        <Note.Title title=" Note:" />
                        <Note.Text>
                            For vertical slider, please set a fixed container
                            height to ensure proper display.
                        </Note.Text>
                    </Note>
                )}
            </SettingsField>

            <SettingsField
                title="Slider Type"
                description="Select the type of the slider."
                secondaryAction={
                    <SelectBox
                        size="small"
                        options={SLIDER_TYPE_OPTIONS}
                        value={[sliderType || "normal"]}
                        onChange={(value) =>
                            handleUpdate(
                                "sliderType",
                                value[0] as AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
                            )
                        }
                    />
                }
            />

            <SettingsField
                title="Slider Effect"
                description="Select the transition effect for the slider."
                secondaryAction={
                    <SelectBox
                        size="small"
                        options={SLIDER_EFFECT_OPTIONS}
                        value={[sliderEffect || "slide"]}
                        onChange={(value) =>
                            handleUpdate(
                                "sliderEffect",
                                value[0] as AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
                            )
                        }
                    />
                }
            />

            <SettingsField
                description={__(
                    "Show navigation arrows and dots.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        id="ShowNavigation"
                        title={__(
                            "Show Navigation",
                            "ninja-drive",
                        )}
                        checked={showNavigation}
                        onChange={(value) =>
                            handleUpdate("showNavigation", value)
                        }
                    />
                }
            >
                <Disabled depend={!showNavigation} dependOn="ShowNavigation">
                    <SettingsField.SubField
                        title={__(
                            "Select Navigation Style",
                            "ninja-drive",
                        )}
                        secondaryAction={
                            <SelectBox
                                size="small"
                                style={{
                                    width: "160px",
                                }}
                                options={ADVANCED_SLIDER_NAVIGATION_STYLE}
                                value={[navigationStyle || "arrows-dots"]}
                                onChange={(value) =>
                                    handleUpdate(
                                        "navigationStyle",
                                        value[0] as AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
                                    )
                                }
                            />
                        }
                    />
                </Disabled>
            </SettingsField>

            <SettingsField
                description={__("Show overlay on hover.", "ninja-drive")}
                action={
                    <Switcher
                        title={__("Show Overlay", "ninja-drive")}
                        checked={showOverlay}
                        onChange={() =>
                            handleUpdate("showOverlay", !showOverlay)
                        }
                    />
                }
            >
                {showOverlay && (
                    <SettingsField.SubField
                        description={__(
                            "Enable or disable slider caption.",
                            "ninja-drive",
                        )}
                        action={
                            <Switcher
                                title={__(
                                    "Show Slider Caption",
                                    "ninja-drive",
                                )}
                                checked={showSliderCaption}
                                onChange={(value) =>
                                    handleUpdate("showSliderCaption", value)
                                }
                            />
                        }
                    />
                )}
            </SettingsField>

            <SettingsField
                title={__("Slide To Show Display", "ninja-drive")}
            >
                <BlockStack gap={10}>
                    <ButtonGroup
                        buttons={ADVANCED_SLIDE_TO_SHOW_DISPLAY_OPTIONS}
                        background="primary-extralight"
                        selectedKey={slideToShowDisplay || "desktop"}
                        onChange={(value) =>
                            handleUpdate(
                                "slideToShowDisplay",
                                value as AdvancedSliderCarousel[keyof AdvancedSliderCarousel],
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Select the device to show slide to show display.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>

                <BlockStack gap={10}>
                    <Text size="md" weight="medium">
                        {__("Slide To Show", "ninja-drive")}
                    </Text>

                    <Slider
                        min={1}
                        max={10}
                        value={
                            slideToShow?.[
                                slideToShowDisplay as
                                    | "desktop"
                                    | "tablet"
                                    | "mobile"
                            ] ?? 1
                        }
                        defaultValue={1}
                        onChange={(value) => {
                            if (!sliderCarousel) return;

                            handleUpdate("slideToShow", {
                                ...sliderCarousel?.slideToShow,
                                [slideToShowDisplay as
                                    | "desktop"
                                    | "tablet"
                                    | "mobile"]: value,
                            });
                        }}
                        reset
                    />
                </BlockStack>
            </SettingsField>

            <SettingsField
                title={__("Thumbnail Quality", "ninja-drive")}
                description={__("Select the thumbnail quality.", "ninja-drive")}
            >
                <ButtonGroup
                    background="primary-extralight"
                    buttons={ADVANCED_SLIDER_THUMBNAIL_QUALITY_OPTIONS}
                    selectedKey={thumbnailQuality || "thumbnail"}
                    onChange={(value) =>
                        handleUpdate(
                            "thumbnailQuality",
                            value as AdvancedSliderCarousel["thumbnailQuality"],
                        )
                    }
                />
            </SettingsField>

            <SettingsField
                title={__("Item Gap", "ninja-drive")}
                description={__("Set the gap between items.", "ninja-drive")}
            >
                <Slider
                    min={0}
                    max={100}
                    value={itemGap || 0}
                    defaultValue={0}
                    onChange={(value) => handleUpdate("itemGap", value)}
                    reset
                />
            </SettingsField>

            <SettingsField
                title={__("Item Border Radius", "ninja-drive")}
                description={__("Set the border radius of items.", "ninja-drive")}
            >
                <Slider
                    min={0}
                    max={100}
                    value={borderRadius || 0}
                    defaultValue={0}
                    onChange={(value) => handleUpdate("borderRadius", value)}
                    reset
                />
            </SettingsField>

            <SettingsField
                description={__("Enable or disable auto play.", "ninja-drive")}
                action={
                    <Switcher
                        id="SlideAutoPlay"
                        title={__(
                            "Slide Auto Play",
                            "ninja-drive",
                        )}
                        checked={slideAutoPlay}
                        onChange={(value) =>
                            handleUpdate("slideAutoPlay", value)
                        }
                    />
                }
            >
                <Disabled depend={!slideAutoPlay} dependOn="SlideAutoPlay">
                    <Input
                        size="small"
                        type="number"
                        label={__(
                            "Auto Play Speed",
                            "ninja-drive",
                        )}
                        helperText={__(
                            "Set the auto play speed.",
                            "ninja-drive",
                        )}
                        value={autoPlaySpeed || 3000}
                        onChange={(value) =>
                            handleUpdate("autoPlaySpeed", Number(value))
                        }
                    />
                </Disabled>
            </SettingsField>

            <SettingsField
                description={__(
                    "Enable or disable infinite loop.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Loop Slides", "ninja-drive")}
                        checked={infiniteLoop}
                        onChange={(value) =>
                            handleUpdate("infiniteLoop", value)
                        }
                    />
                }
            />

            <SettingsField
                description={__(
                    "Enable or disable mouse control.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Mouse Control", "ninja-drive")}
                        checked={mouseControl}
                        onChange={(value) =>
                            handleUpdate("mouseControl", value)
                        }
                    />
                }
            />
        </>
    );
};

export default SliderCarousel;

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
