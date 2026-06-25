import { __ } from "@wordpress/i18n";

export const DASHBOARD_MENUS: {
    key: "overview" | "cached-files" | "share-links" | "download-links";
    title: string;
    icon: string;
}[] = [
    {
        key: "overview",
        title: __("Overview", "ninja-drive"),
        icon: "contacts_product",
    },
    {
        key: "cached-files",
        title: __("Cached Files", "ninja-drive"),
        icon: "category_search",
    },
    {
        key: "share-links",
        title: __("Share Links", "ninja-drive"),
        icon: "automation",
    },
    {
        key: "download-links",
        title: __("Download Links", "ninja-drive"),
        icon: "handyman",
    },
];
