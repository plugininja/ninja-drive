import { StatusProps } from "~/ui/atoms/Status/Status.type";
import { __ } from "@wordpress/i18n";

export const SETTING_MENUS: {
    key:
        | "accounts"
        | "advanced"
        | "integrations"
        | "media-library"
        | "synchronization"
        | "caching"
        | "appearance"
        | "tools";
    title: string;
    icon: string;
    statusProps?: StatusProps;
}[] = [
    {
        key: "accounts",
        title: __("Accounts", "ninja-drive"),
        icon: "contacts_product",
    },
    {
        key: "advanced",
        title: __("Advanced", "ninja-drive"),
        icon: "category_search",
    },
    {
        key: "integrations",
        title: __("Integrations", "ninja-drive"),
        icon: "automation",
    },
    {
        key: "caching",
        title: __("Caching", "ninja-drive"),
        icon: "cached",
    },
    {
        key: "appearance",
        title: __("Appearance", "ninja-drive"),
        icon: "format_paint",
    },
    {
        key: "tools",
        title: __("Tools", "ninja-drive"),
        icon: "handyman",
    },
];
