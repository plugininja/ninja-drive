import { updateStyle } from "~features/widget-builder/state/widgetBuilderSlice";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import SettingsField from "~/shared/molecules/SettingsField";
import { ThemeType } from "~kernel/types/Types";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Slider } from "~/ui/atoms";
import { Status } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Tabs } from "~/ui/atoms";
import {
    MBStyle,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const Layout = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const dispatch = useAppDispatch();

    const { type: widgetType } = edit_data ?? {};

    const { width, height, theme, files, border_box_visibility } =
        edit_data?.data?.style || {};

    const handleUpdateLayout = (
        key: keyof MBStyle,
        value: MBStyle[keyof MBStyle],
    ) => {
        dispatch(
            updateStyle({
                key,
                value,
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "20px auto 0" }}
            title={__("Layout", "ninja-drive")}
            docLink={getModuleDocLink(widgetType as ModuleKey)}
        >
            <SettingsField>
                {(height || width) && (
                    <>
                        <InlineStack gap={50}>
                            {width && (
                                <InlineStack gap={10}>
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {__("Width", "ninja-drive")}
                                    </Text>

                                    <Slider
                                        onlyInput
                                        min={width?.unit === "px" ? 300 : 30}
                                        max={width?.unit === "px" ? 1920 : 100}
                                        defaultValue={
                                            width?.unit === "px" ? 1024 : 100
                                        }
                                        value={width?.value ?? 100}
                                        onChange={(value, unit) => {
                                            handleUpdateLayout("width", {
                                                value: value,
                                                unit: unit as string,
                                            });
                                        }}
                                        unit
                                        unitOptions={[
                                            {
                                                name: "px",
                                                value: "px",
                                                defaultValue: 1024,
                                            },
                                            {
                                                name: "%",
                                                value: "%",
                                                defaultValue: 100,
                                            },
                                            {
                                                name: "vw",
                                                value: "vw",
                                                defaultValue: 100,
                                            },
                                            {
                                                name: "auto",
                                                value: "auto",
                                                defaultValue: 0,
                                            },
                                        ]}
                                        unitValue={[width?.unit || "%"]}
                                        defaultUnit="%"
                                        reset
                                    />
                                </InlineStack>
                            )}

                            {height && (
                                <InlineStack gap={10}>
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {__("Height", "ninja-drive")}
                                    </Text>

                                    <Slider
                                        onlyInput
                                        min={height?.unit === "px" ? 300 : 30}
                                        max={height?.unit === "px" ? 1080 : 100}
                                        defaultValue={
                                            height?.unit === "px" ? 600 : 100
                                        }
                                        value={height?.value ?? 100}
                                        onChange={(value, unit) => {
                                            handleUpdateLayout("height", {
                                                value: value,
                                                unit: unit as string,
                                            });
                                        }}
                                        unit
                                        unitOptions={[
                                            {
                                                name: "px",
                                                value: "px",
                                                defaultValue: 600,
                                            },
                                            {
                                                name: "%",
                                                value: "%",
                                                defaultValue: 100,
                                            },
                                            {
                                                name: "vw",
                                                value: "vw",
                                                defaultValue: 100,
                                            },
                                            {
                                                name: "auto",
                                                value: "auto",
                                                defaultValue: 0,
                                            },
                                        ]}
                                        unitValue={[height?.unit || "%"]}
                                        defaultUnit="%"
                                        reset
                                    />
                                </InlineStack>
                            )}
                        </InlineStack>

                        <Divider width="100%" height="1px" />
                    </>
                )}

                {theme && (
                    <>
                        <BlockStack gap={10}>
                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Theme Style", "ninja-drive")}
                                </Text>

                                <Status
                                    isBeta
                                    size="small"
                                    widthFull={false}
                                    top="-15px"
                                    right="-15px"
                                >
                                    <Tabs
                                        size="small"
                                        rounded="md"
                                        tabRounded="sm"
                                        tabs={THEME_BUTTONS}
                                        active={theme || "light"}
                                        onTabClick={(value) =>
                                            handleUpdateLayout(
                                                "theme",
                                                value as ThemeType,
                                            )
                                        }
                                    />
                                </Status>
                            </InlineStack>

                            <Description
                                text={__(
                                    "Choose a theme for the widget.",
                                    "ninja-drive",
                                )}
                            />
                        </BlockStack>

                        <Divider width="100%" height="1px" />
                    </>
                )}

                {files && !["file_uploader"].includes(widgetType!) && (
                    <>
                        <BlockStack gap={15} marginTop={5}>
                            {files.hasOwnProperty("loading_type") && (
                                <InlineStack gap={10}>
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {__("File Loading Type", "ninja-drive")}
                                    </Text>

                                    <Tabs
                                        size="small"
                                        rounded="md"
                                        tabRounded="sm"
                                        tabs={FILE_LOADING_TYPE_BUTTONS}
                                        active={
                                            files?.loading_type || "load_more"
                                        }
                                        onTabClick={(value) =>
                                            handleUpdateLayout("files", {
                                                ...files,
                                                loading_type:
                                                    value as MBStyle["files"]["loading_type"],
                                            })
                                        }
                                    />
                                </InlineStack>
                            )}

                            {files.hasOwnProperty("per_page") && (
                                <InlineStack gap={10}>
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {__(
                                            "Files in First Render",
                                            "ninja-drive",
                                        )}
                                    </Text>

                                    <Slider
                                        onlyInput
                                        min={2}
                                        max={50}
                                        defaultValue={20}
                                        value={files?.per_page || 0}
                                        onChange={(value) =>
                                            handleUpdateLayout("files", {
                                                ...files,
                                                per_page: value,
                                            })
                                        }
                                        reset
                                    />
                                </InlineStack>
                            )}
                        </BlockStack>

                        <Divider width="100%" height="1px" />
                    </>
                )}

                <BlockStack gap={10}>
                    <Checkbox
                        rounded="sm"
                        title={__("Border & Box Visibility", "ninja-drive")}
                        checked={border_box_visibility}
                        onChange={() =>
                            handleUpdateLayout(
                                "border_box_visibility",
                                !border_box_visibility,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Turn on this option to show the border and box.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default Layout;

const THEME_BUTTONS: {
    key: "light" | "dark";
    title: string;
    icon: string;
}[] = [
    {
        key: "light",
        title: __("Light Mode", "ninja-drive"),
        icon: "light_mode",
    },
    {
        key: "dark",
        title: __("Dark Mode", "ninja-drive"),
        icon: "dark_mode",
    },
];

const FILE_LOADING_TYPE_BUTTONS: {
    key: "load_more" | "infinite_scroll" | "pagination";
    title: string;
    icon: string;
}[] = [
    {
        key: "load_more",
        title: __("Load More", "ninja-drive"),
        icon: "autorenew",
    },
    {
        key: "infinite_scroll",
        title: __("Infinite Scroll", "ninja-drive"),
        icon: "swap_vert",
    },
    {
        key: "pagination",
        title: __("Pagination", "ninja-drive"),
        icon: "page_control",
    },
];
