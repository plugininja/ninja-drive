import { AdvancedGallery } from "~/types/widget.types";
import SettingsField from "~/components/molecules/SettingsField";
import { DEVICE_BUTTONS } from "~/constants/widget";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Slider from "~/components/atoms/Slider";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { ButtonStatusProps } from "~/components/atoms/Button/Button.type";

const Layout = ({
    gallery,
    updateGallery,
}: {
    gallery: AdvancedGallery;
    updateGallery: (
        key: keyof AdvancedGallery,
        value: AdvancedGallery[keyof AdvancedGallery],
    ) => void;
}) => {
    const [columnType, setColumnType] = useState<
        "desktop" | "tablet" | "mobile"
    >("desktop");

    return (
        <SettingsField
            title={__("Gallery Layout", "ninja-drive")}
            description={__(
                "Select the layout for the gallery.",
                "ninja-drive",
            )}
        >
            <ButtonGroup
                background="primary-extralight"
                buttons={GALLERY_LAYOUT_BUTTONS}
                selectedKey={gallery?.layout}
                onChange={(key) =>
                    updateGallery("layout", key as AdvancedGallery["layout"])
                }
            />

            {["grid", "masonry", "hover-reveal", "polaroid", "mosaic"].includes(
                gallery?.layout,
            ) && (
                <SettingsField.SubField
                    title={__("Columns", "ninja-drive")}
                    description={__(
                        "Set the number of columns for the selected device type.",
                        "ninja-drive",
                    )}
                >
                    <ButtonGroup
                        buttons={DEVICE_BUTTONS}
                        selectedKey={columnType}
                        onChange={(value) =>
                            setColumnType(
                                value as "desktop" | "tablet" | "mobile",
                            )
                        }
                    />

                    <Slider
                        min={1}
                        max={24}
                        value={parseInt(
                            gallery?.columns[columnType]?.toString(),
                        )}
                        onChange={(value) =>
                            updateGallery("columns", {
                                ...gallery?.columns,
                                [columnType]: value,
                            })
                        }
                    />
                </SettingsField.SubField>
            )}
        </SettingsField>
    );
};

export default Layout;

const GALLERY_LAYOUT_BUTTONS: {
    key: AdvancedGallery["layout"];
    title: string;
    startIcon: string;
    statusProps?: ButtonStatusProps;
}[] = [
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        startIcon: "grid_view",
    },
    // {
    //     key: "showcase",
    //     title: __("Showcase", "ninja-drive"),
    //     startIcon: "table_rows",
    // },
];

export const ASPECT_RATIO: {
    key: "1:1" | "3:2" | "4:3" | "9:16" | "16:9" | "21:9";
    title: string;
    startIcon: string;
}[] = [
    { key: "1:1", title: "1:1", startIcon: "aspect_ratio" },
    { key: "3:2", title: "3:2", startIcon: "aspect_ratio" },
    { key: "4:3", title: "4:3", startIcon: "aspect_ratio" },
    { key: "9:16", title: "9:16", startIcon: "aspect_ratio" },
    { key: "16:9", title: "16:9", startIcon: "aspect_ratio" },
    { key: "21:9", title: "21:9", startIcon: "aspect_ratio" },
];
