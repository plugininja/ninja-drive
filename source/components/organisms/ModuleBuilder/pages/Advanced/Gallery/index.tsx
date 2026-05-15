import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { AdvancedGallery } from "~/types/widget.types";
import SettingsField from "~/components/molecules/SettingsField";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Slider from "~/components/atoms/Slider";
import { toBoolean } from "~/utils/functions";
import Switcher from "~/components/atoms/Switcher";
import { __ } from "@wordpress/i18n";
import Layout from "./Layout";

const Gallery = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const gallery = editData?.data?.advanced?.gallery;

    const dispatch = useAppDispatch();

    if (!gallery) return null;

    const handleUpdate = (
        key: keyof AdvancedGallery,
        value: AdvancedGallery[keyof AdvancedGallery],
    ) => {
        if (!gallery) return;

        if (key === "layout" && value === "polaroid") {
            dispatch(
                updateAdvanced({
                    key: "gallery",
                    value: {
                        ...gallery,
                        [key]: value,
                        thumbnailSpacing: {
                            value: 3,
                            unit: "rem",
                        },
                        thumbnailRadius: {
                            value: 5,
                            unit: "px",
                        },
                    },
                }),
            );
        } else {
            dispatch(
                updateAdvanced({
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
            <Layout gallery={gallery} updateGallery={handleUpdate} />

            <SettingsField
                title={__("Thumbnail", "ninja-drive")}
                description={__(
                    "Configure the thumbnail settings for the gallery.",
                    "ninja-drive",
                )}
            >
                <SettingsField.SubField
                    title={__("Spacing", "ninja-drive")}
                    description={__(
                        "Adjust the spacing around the image caption",
                        "ninja-drive",
                    )}
                >
                    <Slider
                        min={0}
                        max={100}
                        value={gallery?.thumbnailSpacing?.value ?? 100}
                        onChange={(value, unit) => {
                            handleUpdate("thumbnailSpacing", {
                                value: value,
                                unit: unit as string,
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
                        unitValue={[gallery?.thumbnailSpacing?.unit || "rem"]}
                        defaultUnit="rem"
                        showMark
                        reset
                    />
                </SettingsField.SubField>

                <SettingsField.SubField
                    title={__("Radius", "ninja-drive")}
                    description={__(
                        "Adjust the spacing around the image caption",
                        "ninja-drive",
                    )}
                >
                    <Slider
                        min={0}
                        max={100}
                        value={gallery?.thumbnailRadius?.value ?? 1}
                        onChange={(value, unit) => {
                            handleUpdate("thumbnailRadius", {
                                value: value,
                                unit: unit as string,
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
                        unitValue={[gallery?.thumbnailRadius?.unit || "rem"]}
                        defaultUnit="rem"
                        showMark
                        reset
                    />
                </SettingsField.SubField>

                <SettingsField.SubField
                    title={__("Quality", "ninja-drive")}
                    description={__(
                        "Select the quality of the thumbnails.",
                        "ninja-drive",
                    )}
                >
                    <ButtonGroup
                        buttons={THUMBNAIL_QUALITY_BUTTONS}
                        selectedKey={gallery?.thumbnailQuality}
                        onChange={(value) =>
                            handleUpdate(
                                "thumbnailQuality",
                                value as AdvancedGallery["thumbnailQuality"],
                            )
                        }
                    />
                </SettingsField.SubField>

            </SettingsField>
        </>
    );
};

export default Gallery;

const THUMBNAIL_QUALITY_BUTTONS: {
    key: "original" | "large" | "medium" | "thumbnail";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "original",
        title: __("Original", "ninja-drive"),
        startIcon: "image",
    },
    {
        key: "large",
        title: __("Large", "ninja-drive"),
        startIcon: "imagesmode",
    },
    {
        key: "medium",
        title: __("Medium", "ninja-drive"),
        startIcon: "imagesmode",
    },
    {
        key: "thumbnail",
        title: __("Thumbnail", "ninja-drive"),
        startIcon: "gallery_thumbnail",
    },
];
