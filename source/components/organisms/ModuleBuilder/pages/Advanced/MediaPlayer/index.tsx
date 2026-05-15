import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import { AdvancedMediaPlayer } from "~/types/widget.types";
import { VIEW_STYLE_BUTTONS } from "~/constants/widget";
import SettingsField from "~/components/molecules/SettingsField";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Slider from "~/components/atoms/Slider";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Note from "~/components/molecules/Note";

const MediaPlayer = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { mediaPlayer } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const {
        showNextPrevious,
        showAndHidePlaylist,
        playlistTitle,
        playlistPosition,
        playlistLayout,
        columns,
        videoRatio,
        secureVideoPlayback,
    } = mediaPlayer || {};

    const handleUpdate = (
        key: keyof AdvancedMediaPlayer,
        value: AdvancedMediaPlayer[keyof AdvancedMediaPlayer],
    ) => {
        if (!mediaPlayer) return;

        dispatch(
            updateAdvanced({
                key: "mediaPlayer",
                value: { ...mediaPlayer, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                description={__(
                    "Show/hide the next & previous buttons in the player. Enables navigation between media items in the playlist.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__(
                            "Show Next & Previous",
                            "ninja-drive",
                        )}
                        checked={showNextPrevious}
                        onChange={() =>
                            handleUpdate("showNextPrevious", !showNextPrevious)
                        }
                    />
                }
            />

            <SettingsField
                description={__(
                    "Show/hide the playlist in the player.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        id="showAndHidePlaylist"
                        title={__(
                            "Show/hide Playlist",
                            "ninja-drive",
                        )}
                        checked={showAndHidePlaylist}
                        onChange={() =>
                            handleUpdate(
                                "showAndHidePlaylist",
                                !showAndHidePlaylist,
                            )
                        }
                    />
                }
            >
                {PLAY_LIST_OPTIONS.map(({ key, title, description }) => (
                    <SettingsField.SubField
                        key={key}
                        depend={!showAndHidePlaylist}
                        dependOn="showAndHidePlaylist"
                        description={description}
                        action={
                            <Switcher
                                title={title}
                                checked={mediaPlayer?.[key]}
                                onChange={() =>
                                    handleUpdate(
                                        key as keyof AdvancedMediaPlayer,
                                        !mediaPlayer?.[key],
                                    )
                                }
                            />
                        }
                    />
                ))}

                <SettingsField.SubField
                    title={__("Playlist Title", "ninja-drive")}
                    description={__(
                        "Set the title for the playlist.",
                        "ninja-drive",
                    )}
                    depend={!showAndHidePlaylist}
                    dependOn="showAndHidePlaylist"
                    secondaryAction={
                        <Input
                            size="small"
                            placeholder={__(
                                "All Content",
                                "ninja-drive",
                            )}
                            fullWidth={false}
                            value={playlistTitle || "All Content"}
                            onChange={(value) =>
                                handleUpdate("playlistTitle", value as string)
                            }
                        />
                    }
                />

                <SettingsField.SubField
                    depend={!showAndHidePlaylist}
                    dependOn="showAndHidePlaylist"
                    title={__("Playlist Position", "ninja-drive")}
                >
                    <ButtonGroup
                        buttons={PLAY_LIST_POSITION}
                        selectedKey={playlistPosition || "right"}
                        onChange={(value) =>
                            handleUpdate(
                                "playlistPosition",
                                value as "left" | "right" | "bottom",
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Select the playlist position in the player.",
                            "ninja-drive",
                        )}
                    />
                </SettingsField.SubField>
            </SettingsField>

            <SettingsField
                title={__("Playlist Layout", "ninja-drive")}
                description={__(
                    "Playlist layout in the media player.",
                    "ninja-drive",
                )}
            >
                <ButtonGroup
                    background="primary-extralight"
                    buttons={VIEW_STYLE_BUTTONS}
                    selectedKey={playlistLayout || "list"}
                    onChange={(value) =>
                        handleUpdate("playlistLayout", value as "list" | "grid")
                    }
                />

                {playlistLayout === "grid" && (
                    <SettingsField.SubField
                        title={__("Columns", "ninja-drive")}
                        description={__(
                            "Set the number of columns for the playlist grid.",
                            "ninja-drive",
                        )}
                    >
                        <Slider
                            min={1}
                            max={3}
                            defaultValue={1}
                            value={columns ?? 1}
                            onChange={(value) =>
                                handleUpdate("columns", value as 1 | 2 | 3)
                            }
                            reset
                        />
                    </SettingsField.SubField>
                )}
            </SettingsField>

            <SettingsField
                title={__("Select Video Ratio", "ninja-drive")}
            >
                <ButtonGroup
                    background="primary-extralight"
                    buttons={VIDEO_RATIOS}
                    selectedKey={videoRatio || "16/9"}
                    onChange={(value) =>
                        handleUpdate(
                            "videoRatio",
                            value as AdvancedMediaPlayer["videoRatio"],
                        )
                    }
                />
            </SettingsField>

        </>
    );
};

export default MediaPlayer;

const PLAY_LIST_OPTIONS: {
    key: "openedPlaylist" | "showNumberPrefix" | "showThumbnail";
    title: string;
    description: string;
}[] = [
    {
        key: "openedPlaylist",
        title: __("Opened Playlist", "ninja-drive"),
        description: __(
            "Should be the playlist opened by default.",
            "ninja-drive",
        ),
    },
    {
        key: "showNumberPrefix",
        title: __("Show Number Prefix", "ninja-drive"),
        description: __(
            "Should show the next prefix of the media item.",
            "ninja-drive",
        ),
    },
    {
        key: "showThumbnail",
        title: __("Show Thumbnail", "ninja-drive"),
        description: __(
            "Should show the thumbnail of the media item.",
            "ninja-drive",
        ),
    },
];

const PLAY_LIST_POSITION: {
    key: "left" | "right" | "bottom";
    title: string;
    startIcon: string;
}[] = [
    {
        title: __("Left", "ninja-drive"),
        key: "left",
        startIcon: "align_horizontal_left",
    },
    {
        key: "right",
        title: __("Right", "ninja-drive"),
        startIcon: "align_horizontal_right",
    },
    {
        key: "bottom",
        title: __("Bottom", "ninja-drive"),
        startIcon: "align_flex_end",
    },
];

const VIDEO_RATIOS: {
    key: "16/9" | "4/3" | "3/2" | "2/1" | "1/1" | "21/9" | "9/16";
    title: string;
    startIcon: string;
}[] = [
    { key: "16/9", title: "16:9", startIcon: "aspect_ratio" },
    { key: "4/3", title: "4:3", startIcon: "aspect_ratio" },
    { key: "3/2", title: "3:2", startIcon: "aspect_ratio" },
    { key: "2/1", title: "2:1", startIcon: "aspect_ratio" },
    { key: "1/1", title: "1:1", startIcon: "aspect_ratio" },
    { key: "21/9", title: "21:9", startIcon: "aspect_ratio" },
    { key: "9/16", title: "9:16", startIcon: "aspect_ratio" },
];
