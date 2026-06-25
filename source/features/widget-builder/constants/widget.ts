import { ModuleKey } from "~features/widget-builder/types/widget.types";
import { StatusProps } from "~/ui/atoms/Status/Status.type";
import { __ } from "@wordpress/i18n";

export const MODULE_LISTS: {
    key:
        | "file_browser"
        | "file_list"
        | "media_player"
        | "gallery"
        | "slider_carousel"
        | "file_uploader"
        | "embed_documents"
        | "search_box";
    title: string;
    description: string;
    icon: string;
    statusProps?: StatusProps;
}[] = [
    {
        key: "file_browser",
        title: __("File Browser", "ninja-drive"),
        description: __(
            "Allow to browse selected Google Drive files and folders on your site.",
            "ninja-drive",
        ),
        icon: "folder",
    },
    {
        key: "gallery",
        title: __("Gallery", "ninja-drive"),
        description: __(
            "Showcase images from Google Drive in a appealing gallery format.",
            "ninja-drive",
        ),
        icon: "imagesmode",
    },
    {
        key: "embed_documents",
        title: __("Embed Documents", "ninja-drive"),
        description: __(
            "Easily embed Docs, Sheets, and Slides into your website securely.",
            "ninja-drive",
        ),
        icon: "text_compare",
    },
];

export const SORT_BY_OPTIONS: { name: string; value: string }[] = [
    { name: __("Name", "ninja-drive"), value: "name" },
    { name: __("Created At", "ninja-drive"), value: "created_at" },
    { name: __("Updated At", "ninja-drive"), value: "updated_at" },
    { name: __("Type", "ninja-drive"), value: "type" },
];

export const MODULE_LIST_HEADERS: {
    key:
        | "checkbox"
        | "id"
        | "title"
        | "item_type"
        | "status"
        | "widget"
        | "location"
        | "created_at"
        | "action";
    title: string;
}[] = [
    { key: "checkbox", title: "" },
    { key: "id", title: __("ID:", "ninja-drive") },
    { key: "title", title: __("Title:", "ninja-drive") },
    { key: "item_type", title: __("Item Type:", "ninja-drive") },
    { key: "status", title: __("Status:", "ninja-drive") },
    { key: "widget", title: __("Shortcode:", "ninja-drive") },
    { key: "location", title: __("Location:", "ninja-drive") },
    { key: "created_at", title: __("Created At:", "ninja-drive") },
    { key: "action", title: __("Action:", "ninja-drive") },
];

export const MODULE_MENUS: {
    key: "source" | "configuration" | "style" | "notifications" | "permissions";
    title: string;
    icon: string;
    excluded?: ModuleKey[];
    statusProps?: StatusProps;
}[] = [
    {
        key: "source",
        title: __("Source", "ninja-drive"),
        icon: "database_search",
    },
    {
        key: "configuration",
        title: __("Configuration", "ninja-drive"),
        icon: "filter_alt",
    },
    {
        key: "style",
        title: __("Style", "ninja-drive"),
        icon: "category_search",
    },
];

export const getModuleMenuItems = (type: ModuleKey) => {
    return MODULE_MENUS.filter((menu) => {
        if (!type) return true;
        if (menu.excluded?.includes(type)) return false;
        return true;
    });
};
