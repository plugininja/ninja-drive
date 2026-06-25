import { updateConfiguration } from "~features/widget-builder/state/widgetBuilderSlice";
import { getModuleDocLink } from "~/features/widget-builder/utils/widget";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import SettingsField from "~/shared/molecules/SettingsField";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Radio } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    MBConfiguration,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const Advanced = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const dispatch = useAppDispatch();

    const { advanced } = edit_data?.data.configuration || {};

    const { secure_video_playback, auto_fetch, sort } = advanced || {};

    const handleUpdateAdvanced = (
        key: keyof MBConfiguration["advanced"],
        value: MBConfiguration["advanced"][keyof MBConfiguration["advanced"]],
    ) => {
        dispatch(
            updateConfiguration({
                key: "advanced",
                value: {
                    ...advanced!,
                    [key]: value,
                },
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("Advanced Settings", "ninja-drive")}
            docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
        >
            <SettingsField>

                {sort && (
                    <>
                        <BlockStack gap={20}>
                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Sort By", "ninja-drive")}
                                </Text>

                                {ADVANCED_SORT_BY_BUTTONS?.map(
                                    ({ key, title }) => (
                                        <Radio
                                            key={key}
                                            title={title}
                                            checked={
                                                sort?.order_by ===
                                                (key as
                                                    | "name"
                                                    | "size"
                                                    | "created_at"
                                                    | "updated_at")
                                            }
                                            onChange={() =>
                                                handleUpdateAdvanced("sort", {
                                                    ...sort,
                                                    order_by: key,
                                                })
                                            }
                                        />
                                    ),
                                )}
                            </InlineStack>

                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Sort Order", "ninja-drive")}
                                </Text>

                                {ADVANCED_SORT_ORDER_BUTTONS?.map(
                                    ({ key, title }) => (
                                        <Radio
                                            key={key}
                                            title={title}
                                            checked={
                                                sort?.order ===
                                                (key as "ASC" | "DESC")
                                            }
                                            onChange={() =>
                                                handleUpdateAdvanced("sort", {
                                                    ...sort,
                                                    order: key,
                                                })
                                            }
                                        />
                                    ),
                                )}
                            </InlineStack>
                        </BlockStack>
                    </>
                )}
            </SettingsField>
        </PageContainer>
    );
};

export default Advanced;

const ADVANCED_SORT_BY_BUTTONS: {
    key: "name" | "size" | "created_at" | "updated_at";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "name",
        title: __("Name", "ninja-drive"),
        startIcon: "id_card",
    },
    {
        key: "size",
        title: __("Size", "ninja-drive"),
        startIcon: "60fps_select",
    },
    {
        key: "created_at",
        title: __("Created At", "ninja-drive"),
        startIcon: "alarm",
    },
    {
        key: "updated_at",
        title: __("Updated At", "ninja-drive"),
        startIcon: "edit_calendar",
    },
];

const ADVANCED_SORT_ORDER_BUTTONS: {
    key: "ASC" | "DESC";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "ASC",
        title: __("Ascending", "ninja-drive"),
        startIcon: "uppercase",
    },
    {
        key: "DESC",
        title: __("Descending", "ninja-drive"),
        startIcon: "arrow_cool_down",
    },
];
