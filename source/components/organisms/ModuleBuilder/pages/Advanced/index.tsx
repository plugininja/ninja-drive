import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import { MBAdvanced } from "~/types/widget.types";
import Slider from "~/components/atoms/Slider";
import EmbedDocuments from "./EmbedDocuments";
import SliderCarousel from "./SliderCarousel";
import Switcher from "~/components/atoms/Switcher";
import FileUploader from "./FileUploader";
import { ThemeType } from "~/types/Types";
import FileBrowser from "./FileBrowser";
import MediaPlayer from "./MediaPlayer";
import { __ } from "@wordpress/i18n";
import SearchBox from "./SearchBox";
import Text from "~/components/atoms/Text";
import FileList from "./FileList";
import Gallery from "./Gallery";
import DOCS from "~/utils/docs";
import {
    ADVANCED_SORT_BY_BUTTONS,
    ADVANCED_SORT_ORDER_BUTTONS,
    FILE_LOADING_TYPE_BUTTONS,
    THEME_BUTTONS,
} from "~/constants/widget";

const Advanced = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { type: widgetType, data } = editData ?? {};

    const dispatch = useAppDispatch();

    const {
        height,
        width,
        theme,
        files,
        borderBoxVisibility,
        autoFetch,
        sort,
    } = data?.advanced || {};

    const handleUpdate = (
        key: keyof MBAdvanced,
        value: MBAdvanced[keyof MBAdvanced],
    ) => {
        dispatch(
            updateAdvanced({
                key,
                value,
            }),
        );
    };

    return (
        <PageContainer
            widget
            title={__("Advanced Options", "ninja-drive")}
            description={__(
                "Advanced options to customize the widget.",
                "ninja-drive",
            )}
            docLink={DOCS?.MODULE_BUILDER?.advanced?.link}
        >
            <SettingsField
                title={__("Widget Settings", "ninja-drive")}
                description={__(
                    "Configure advanced settings for the widget.",
                    "ninja-drive",
                )}
            >
                {(width || height) && (
                    <SettingsField.SubField
                        title={__("Container Size", "ninja-drive")}
                        description={__(
                            "Set the widget container width and height (e.g. '360px', '80%'). Leave blank for default.",
                            "ninja-drive",
                        )}
                    >
                        {width && (
                            <>
                                <Text weight="medium">
                                    {__(
                                        "Container Width",
                                        "ninja-drive",
                                    )}
                                </Text>

                                <Slider
                                    min={width?.unit === "px" ? 300 : 30}
                                    max={width?.unit === "px" ? 1920 : 100}
                                    defaultValue={
                                        width?.unit === "px" ? 1024 : 100
                                    }
                                    value={width?.value ?? 100}
                                    onChange={(value, unit) => {
                                        handleUpdate("width", {
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
                                    showMark
                                    marks={
                                        width?.unit === "px"
                                            ? [
                                                  { name: "300", value: 300 },
                                                  { name: "768", value: 768 },
                                                  { name: "1024", value: 1024 },
                                                  { name: "1440", value: 1440 },
                                                  { name: "1920", value: 1920 },
                                              ]
                                            : [
                                                  { name: "30", value: 30 },
                                                  { name: "40", value: 40 },
                                                  { name: "80", value: 80 },
                                                  { name: "100", value: 100 },
                                              ]
                                    }
                                    reset
                                    trackDisabled={width?.unit === "auto"}
                                />
                            </>
                        )}

                        {height && (
                            <>
                                <Text weight="medium">
                                    {__(
                                        "Container Height",
                                        "ninja-drive",
                                    )}
                                </Text>

                                <Slider
                                    min={height?.unit === "px" ? 300 : 30}
                                    max={height?.unit === "px" ? 1080 : 100}
                                    defaultValue={
                                        height?.unit === "px" ? 600 : 100
                                    }
                                    value={height?.value ?? 100}
                                    onChange={(value, unit) => {
                                        handleUpdate("height", {
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
                                    showMark
                                    marks={
                                        height?.unit === "px"
                                            ? [
                                                  { name: "300", value: 300 },
                                                  { name: "600", value: 600 },
                                                  { name: "800", value: 800 },
                                                  { name: "1080", value: 1080 },
                                              ]
                                            : [
                                                  { name: "30", value: 30 },
                                                  { name: "40", value: 40 },
                                                  { name: "80", value: 80 },
                                                  { name: "100", value: 100 },
                                              ]
                                    }
                                    reset
                                    trackDisabled={height?.unit === "auto"}
                                />
                            </>
                        )}
                    </SettingsField.SubField>
                )}

                {theme && (
                    <SettingsField.SubField
                        title={__("Widget Theme", "ninja-drive")}
                        description={__(
                            "Choose a theme for the widget.",
                            "ninja-drive",
                        )}
                        statusProps={{
                            isBeta: true,
                        }}
                    >
                        <ButtonGroup
                            buttons={THEME_BUTTONS}
                            selectedKey={theme || "light"}
                            onChange={(value) =>
                                handleUpdate("theme", value as ThemeType)
                            }
                        />
                    </SettingsField.SubField>
                )}

                {files && !["file-uploader"].includes(widgetType!) && (
                    <SettingsField.SubField
                        title={__(
                            "File Loading Type",
                            "ninja-drive",
                        )}
                        description={__(
                            "Choose how files are loaded in the widget.",
                            "ninja-drive",
                        )}
                    >
                        {files.hasOwnProperty("loadingType") && (
                            <ButtonGroup
                                buttons={FILE_LOADING_TYPE_BUTTONS}
                                selectedKey={files?.loadingType || "load_more"}
                                onChange={(value) =>
                                    handleUpdate("files", {
                                        ...files,
                                        loadingType:
                                            value as MBAdvanced["files"]["loadingType"],
                                    })
                                }
                            />
                        )}

                        {files.hasOwnProperty("perPage") && (
                            <SettingsField.SubField
                                title={__(
                                    "Files in First Render",
                                    "ninja-drive",
                                )}
                                description={__(
                                    "How many files to display initially.",
                                    "ninja-drive",
                                )}
                                background="white"
                            >
                                <Slider
                                    min={2}
                                    max={50}
                                    value={files?.perPage || 0}
                                    onChange={(value) =>
                                        handleUpdate("files", {
                                            ...files,
                                            perPage: value,
                                        })
                                    }
                                />
                            </SettingsField.SubField>
                        )}
                    </SettingsField.SubField>
                )}

                {borderBoxVisibility && (
                    <SettingsField.SubField
                        title={__(
                            "Border & Box Visibility",
                            "ninja-drive",
                        )}
                        description={__(
                            "Turn on this option to hide the border and box.",
                            "ninja-drive",
                        )}
                    >
                        <Switcher
                            id="hideBorderBox"
                            title={__(
                                "Hide Border & Box",
                                "ninja-drive",
                            )}
                            checked={borderBoxVisibility}
                            onChange={() =>
                                handleUpdate(
                                    "borderBoxVisibility",
                                    !borderBoxVisibility,
                                )
                            }
                        />
                    </SettingsField.SubField>
                )}
            </SettingsField>

            {widgetType === "file-browser" &&
                data?.advanced.hasOwnProperty("fileBrowser") && <FileBrowser />}

            {widgetType === "file-uploader" &&
                data?.advanced.hasOwnProperty("fileUploader") && (
                    <FileUploader />
                )}

            {widgetType === "media-player" &&
                data?.advanced.hasOwnProperty("mediaPlayer") && <MediaPlayer />}

            {widgetType === "gallery" &&
                data?.advanced.hasOwnProperty("gallery") && <Gallery />}

            {widgetType === "slider-carousel" &&
                data?.advanced.hasOwnProperty("sliderCarousel") && (
                    <SliderCarousel />
                )}

            {widgetType === "embed-documents" &&
                data?.advanced.hasOwnProperty("embedDocuments") && (
                    <EmbedDocuments />
                )}

            {widgetType === "search-box" &&
                data?.advanced.hasOwnProperty("searchBox") && <SearchBox />}

            {widgetType === "file-list" &&
                data?.advanced.hasOwnProperty("fileList") && <FileList />}

            {sort && !["file-uploader"].includes(widgetType!) && (
                <SettingsField
                    title={__("Sorting", "ninja-drive")}
                    description={__(
                        "Configure how files are sorted in the widget.",
                        "ninja-drive",
                    )}
                >
                    <SettingsField.SubField
                        title={__("Sort By", "ninja-drive")}
                        description={__(
                            "Choose the criteria for sorting files.",
                            "ninja-drive",
                        )}
                    >
                        <ButtonGroup
                            buttons={ADVANCED_SORT_BY_BUTTONS}
                            selectedKey={sort?.orderBy || "createdAt"}
                            onChange={(value) =>
                                handleUpdate("sort", {
                                    ...sort,
                                    orderBy:
                                        value as MBAdvanced["sort"]["orderBy"],
                                })
                            }
                        />
                    </SettingsField.SubField>

                    <SettingsField.SubField
                        title={__("Sort Order", "ninja-drive")}
                        description={__(
                            "Choose the order of sorting files.",
                            "ninja-drive",
                        )}
                    >
                        <ButtonGroup
                            buttons={ADVANCED_SORT_ORDER_BUTTONS}
                            selectedKey={sort?.order || "DESC"}
                            onChange={(value) =>
                                handleUpdate("sort", {
                                    ...sort,
                                    order: value as MBAdvanced["sort"]["order"],
                                })
                            }
                        />
                    </SettingsField.SubField>
                </SettingsField>
            )}
        </PageContainer>
    );
};

export default Advanced;
