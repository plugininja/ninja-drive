import { updateStyle } from "~/store/features/widgetBuilderSlice";
import PageContainer from "~/components/molecules/PageContainer";
import SettingsField from "~/components/molecules/SettingsField";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import { StyleSearchBox } from "~/types/widget.types";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import Tabs from "~/components/atoms/Tabs";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";

const SearchBox = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { search_box } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const { browser_view, show_last_modified, search_box_text } =
        search_box || {};

    const handleUpdate = (
        key: keyof StyleSearchBox,
        value: StyleSearchBox[keyof StyleSearchBox],
    ) => {
        if (!search_box) return;

        dispatch(
            updateStyle({
                key: "search_box",
                value: { ...search_box, [key]: value },
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("Search Settings", "ninja-drive")}
            docLink={DOCS?.MODULE_BUILDER?.style?.link}
        >
            <SettingsField>
                <BlockStack gap={15}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Default View Style", "ninja-drive")}
                    </Text>

                    <Tabs
                        size="small"
                        rounded="md"
                        tabRounded="sm"
                        tabs={VIEW_STYLE_TABS}
                        active={browser_view || "grid"}
                        onTabClick={(value) =>
                            handleUpdate(
                                "browser_view",
                                value as "grid" | "list",
                            )
                        }
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Show Last Modified Field", "ninja-drive")}
                        titleSize="sm"
                        checked={show_last_modified}
                        onChange={(value) =>
                            handleUpdate("show_last_modified", value)
                        }
                    />

                    <Description
                        text={__(
                            "Show/ hide the file last modified date field in the list view.",
                            "ninja-drive",
                        )}
                    />
                </BlockStack>
                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Search Box Text", "ninja-drive")}
                    </Text>

                    <Input
                        size="small"
                        background="gray-50"
                        color="gray-200"
                        value={search_box_text ?? ""}
                        onChange={(value) =>
                            handleUpdate("search_box_text", String(value))
                        }
                    />
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default SearchBox;

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
