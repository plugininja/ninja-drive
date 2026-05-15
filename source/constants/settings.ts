import { StatusProps } from "~/components/atoms/Status/Status.type";
import { __ } from "@wordpress/i18n";

export const SETTING_MENUS: {
    key:
        | "accounts"
        | "advanced"
        | "appearance"
        | "user-access"
        | "integrations"
        | "media-library"
        | "synchronization"
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
        key: "appearance",
        title: __("Appearance", "ninja-drive"),
        icon: "format_paint",
    },
    {
        key: "integrations",
        title: __("Integrations", "ninja-drive"),
        icon: "automation",
    },
    {
        key: "tools",
        title: __("Tools", "ninja-drive"),
        icon: "handyman",
    },
];
