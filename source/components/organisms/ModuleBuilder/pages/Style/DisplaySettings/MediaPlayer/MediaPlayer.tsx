import { updateStyle } from "~/store/features/widgetBuilderSlice";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import { StyleMediaPlayer } from "~/types/widget.types";
import Switcher from "~/components/atoms/Switcher";
import Checkbox from "~/components/atoms/Checkbox";
import Divider from "~/components/atoms/Divider";
import Slider from "~/components/atoms/Slider";
import Card from "~/components/molecules/Card";
import Input from "~/components/atoms/Input";
import Radio from "~/components/atoms/Radio";
import Text from "~/components/atoms/Text";
import Tabs from "~/components/atoms/Tabs";
import Info from "~/components/atoms/Info";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import clsx from "clsx";
import {
    ratio_16_9_preset,
    ratio_1_1_preset,
    ratio_21_9_preset,
    ratio_2_1_preset,
    ratio_3_2_preset,
    ratio_4_3_preset,
    ratio_9_16_preset,
} from "~/utils/presets-ratio";

const MediaPlayer = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { media_player } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const {
        show_next_previous,
        show_and_hide_playlist,
        playlist_title,
        playlist_position,
        playlist_layout,
        columns,
        video_ratio,
    } = media_player || {};

    const handleUpdate = (
        key: keyof StyleMediaPlayer,
        value: StyleMediaPlayer[keyof StyleMediaPlayer],
    ) => {
        if (!media_player) return;

        dispatch(
            updateStyle({
                key: "media_player",
                value: { ...media_player, [key]: value },
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("Playlist Settings", "ninja-drive")}
            docLink={DOCS?.MODULE_BUILDER?.style?.link}
        >
            <SettingsField
                description={__(
                    "Show/hide the playlist in the player.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Show Playlist", "ninja-drive")}
                        titleSize="sm"
                        checked={show_and_hide_playlist}
                        onChange={() =>
                            handleUpdate(
                                "show_and_hide_playlist",
                                !show_and_hide_playlist,
                            )
                        }
                    />
                }
            >
                {show_and_hide_playlist && (
                    <BlockStack gap={15}>
                        {PLAY_LIST_OPTIONS?.map(({ key, title }, index) => (
                            <InlineStack key={key ?? index} gap={10}>
                                <Checkbox
                                    key={key ?? index}
                                    rounded="sm"
                                    checked={media_player?.[key]}
                                    onChange={() =>
                                        handleUpdate(
                                            key as keyof StyleMediaPlayer,
                                            !media_player?.[key],
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
                                            key as keyof StyleMediaPlayer,
                                            !media_player?.[key],
                                        )
                                    }
                                >
                                    {title}
                                </Text>

                                <Info title={title} />
                            </InlineStack>
                        ))}
                    </BlockStack>
                )}

                <Divider width="100%" height="1px" />

                <BlockStack gap={15}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Playlist Title", "ninja-drive")}
                    </Text>

                    <Input
                        size="small"
                        background="gray-50"
                        color="gray-200"
                        placeholder={__("All Content", "ninja-drive")}
                        fullWidth={false}
                        value={playlist_title || "All Content"}
                        onChange={(value) =>
                            handleUpdate("playlist_title", value as string)
                        }
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Show Next & Previous Button", "ninja-drive")}
                        titleSize="sm"
                        checked={show_next_previous}
                        onChange={() =>
                            handleUpdate(
                                "show_next_previous",
                                !show_next_previous,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Show/hide the next & previous buttons in the player. Enables navigation between media items in the playlist.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <InlineStack gap={10}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Playlist Position", "ninja-drive")}
                    </Text>

                    <InlineStack gap={10}>
                        {PLAY_LIST_POSITION?.map(({ key, title }, index) => (
                            <Radio
                                key={key ?? index}
                                title={title}
                                checked={playlist_position === key}
                                onChange={() =>
                                    handleUpdate("playlist_position", key)
                                }
                            />
                        ))}
                    </InlineStack>
                </InlineStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={15}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Select Video Ratio", "ninja-drive")}
                    </Text>

                    <InlineStack gap={10}>
                        {VIDEO_RATIOS?.map(({ key, title, image }, index) => (
                            <Card
                                key={key ?? index}
                                padding={10}
                                background="gray-50"
                                border="gray-200"
                                flex
                                direction="col"
                                blockAlign="center"
                                gap={7}
                                style={{
                                    width: "115px",
                                    height: "80px",
                                    cursor: "pointer",
                                }}
                                className={clsx(
                                    video_ratio === key && "outline-active",
                                )}
                                onClick={() => handleUpdate("video_ratio", key)}
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
                        ))}
                    </InlineStack>
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={15}>
                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Playlist Layout", "ninja-drive")}
                        </Text>
                    </InlineStack>

                    <Tabs
                        size="small"
                        rounded="md"
                        tabRounded="sm"
                        tabs={VIEW_STYLE_TABS}
                        active={playlist_layout}
                        onTabClick={(value) =>
                            handleUpdate("playlist_layout", value)
                        }
                    />

                    {playlist_layout === "grid" && (
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Columns", "ninja-drive")}
                            </Text>

                            <Slider
                                onlyInput
                                min={1}
                                max={3}
                                defaultValue={1}
                                value={columns ?? 1}
                                onChange={(value) =>
                                    handleUpdate("columns", value as 1 | 2 | 3)
                                }
                                reset
                            />
                        </InlineStack>
                    )}
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default MediaPlayer;

const PLAY_LIST_OPTIONS: {
    key: "opened_playlist" | "show_number_prefix" | "show_thumbnail";
    title: string;
}[] = [
    {
        key: "opened_playlist",
        title: __("Opened Playlist", "ninja-drive"),
    },
    {
        key: "show_number_prefix",
        title: __("Show Number Prefix", "ninja-drive"),
    },
    {
        key: "show_thumbnail",
        title: __("Show Thumbnail", "ninja-drive"),
    },
];

const PLAY_LIST_POSITION: {
    key: "left" | "right" | "bottom";
    title: string;
}[] = [
    {
        title: __("Left", "ninja-drive"),
        key: "left",
    },
    {
        key: "right",
        title: __("Right", "ninja-drive"),
    },
    {
        key: "bottom",
        title: __("Bottom", "ninja-drive"),
    },
];

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

const VIDEO_RATIOS: {
    key: "16/9" | "4/3" | "3/2" | "2/1" | "1/1" | "21/9" | "9/16";
    title: string;
    image: string;
}[] = [
    { key: "16/9", title: "16:9", image: ratio_16_9_preset },
    { key: "4/3", title: "4:3", image: ratio_4_3_preset },
    { key: "3/2", title: "3:2", image: ratio_3_2_preset },
    { key: "2/1", title: "2:1", image: ratio_2_1_preset },
    { key: "1/1", title: "1:1", image: ratio_1_1_preset },
    { key: "21/9", title: "21:9", image: ratio_21_9_preset },
    { key: "9/16", title: "9:16", image: ratio_9_16_preset },
];
