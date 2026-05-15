import { __ } from "@wordpress/i18n";
import { StatusProps } from "~/components/atoms/Status/Status.type";
import { ModuleKey } from "~/types/widget.types";

export const MODULE_LISTS: {
    key:
        | "file-browser"
        | "file-uploader"
        | "media-player"
        | "gallery"
        | "slider-carousel"
        | "embed-documents"
        | "search-box"
        | "file-list";
    title: string;
    description: string;
    icon: string;
    statusProps?: StatusProps;
}[] = [
    {
        key: "file-browser",
        title: __("File Browser", "ninja-drive"),
        description: __(
            "Allow users to browse selected Google Drive files and folders directly on your site.",
            "ninja-drive",
        ),
        icon: "folder",
    },
    {
        key: "gallery",
        title: __("Gallery", "ninja-drive"),
        description: __(
            "Showcase images from Google Drive in a visually appealing gallery format.",
            "ninja-drive",
        ),
        icon: "imagesmode",
    },
    {
        key: "embed-documents",
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
    { name: __("Created At", "ninja-drive"), value: "createdAt" },
    { name: __("Updated At", "ninja-drive"), value: "updatedAt" },
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
        | "created_at";
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
];

export const MODULE_MENUS: {
    key: "source" | "filter" | "advanced" | "notifications" | "permissions";
    title: string;
    icon: string;
    excluded?: ModuleKey[];
}[] = [
    {
        key: "source",
        title: __("Source", "ninja-drive"),
        icon: "database_search",
    },
    {
        key: "filter",
        title: __("Filter", "ninja-drive"),
        icon: "filter_alt",
        excluded: ["media-player"],
    },
    {
        key: "advanced",
        title: __("Advanced", "ninja-drive"),
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

export const THEME_BUTTONS: {
    key: "light" | "dark";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "light",
        title: __("Light Mode", "ninja-drive"),
        startIcon: "light_mode",
    },
    {
        key: "dark",
        title: __("Dark Mode", "ninja-drive"),
        startIcon: "dark_mode",
    },
];

export const FILE_LOADING_TYPE_BUTTONS: {
    key: "load_more" | "infinite_scroll" | "pagination";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "load_more",
        title: __("Load More", "ninja-drive"),
        startIcon: "autorenew",
    },
    {
        key: "infinite_scroll",
        title: __("Infinite Scroll", "ninja-drive"),
        startIcon: "swap_vert",
    },
    {
        key: "pagination",
        title: __("Pagination", "ninja-drive"),
        startIcon: "page_control",
    },
];

export const ADVANCED_SORT_BY_BUTTONS: {
    key: "name" | "size" | "createdAt" | "updatedAt";
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
        key: "createdAt",
        title: __("Created At", "ninja-drive"),
        startIcon: "alarm",
    },
    {
        key: "updatedAt",
        title: __("Updated At", "ninja-drive"),
        startIcon: "edit_calendar",
    },
];

export const ADVANCED_SORT_ORDER_BUTTONS: {
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

export const VIEW_STYLE_BUTTONS: {
    key: "grid" | "list";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        startIcon: "grid_view",
    },
    {
        key: "list",
        title: __("List", "ninja-drive"),
        startIcon: "dehaze",
    },
];

export const DEVICE_BUTTONS: {
    key: "desktop" | "laptop" | "tablet" | "mobile";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "desktop",
        title: __("Desktop", "ninja-drive"),
        startIcon: "screenshot_monitor",
    },
    {
        key: "laptop",
        title: __("Laptop", "ninja-drive"),
        startIcon: "laptop_windows",
    },
    {
        key: "tablet",
        title: __("Tablet", "ninja-drive"),
        startIcon: "tablet_mac",
    },
    {
        key: "mobile",
        title: __("Mobile", "ninja-drive"),
        startIcon: "mobile_2",
    },
];

export const ADVANCED_SLIDE_TO_SHOW_DISPLAY_OPTIONS: {
    key: "desktop" | "tablet" | "mobile";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "desktop",
        title: __("Desktop", "ninja-drive"),
        startIcon: "computer",
    },
    {
        key: "tablet",
        title: __("Tablet", "ninja-drive"),
        startIcon: "tablet_android",
    },
    {
        key: "mobile",
        title: __("Mobile", "ninja-drive"),
        startIcon: "mobile",
    },
];

export const ADVANCED_SLIDER_THUMBNAIL_QUALITY_OPTIONS: {
    key: "original" | "large" | "medium" | "thumbnail";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "original",
        title: __("Original", "ninja-drive"),
        startIcon: "photo_size_select_actual",
    },
    {
        key: "large",
        title: __("Large", "ninja-drive"),
        startIcon: "image_aspect_ratio",
    },
    {
        key: "medium",
        title: __("Medium", "ninja-drive"),
        startIcon: "imagesmode",
    },
    {
        key: "thumbnail",
        title: __("Thumbnail", "ninja-drive"),
        startIcon: "image",
    },
];

export const ADVANCED_SLIDER_NAVIGATION_STYLE: {
    name: string;
    value: "arrows-dots" | "arrows" | "dots" | "none";
}[] = [
    {
        name: __("Arrows & Dots", "ninja-drive"),
        value: "arrows-dots",
    },
    {
        name: __("Arrows", "ninja-drive"),
        value: "arrows",
    },
    {
        name: __("Dots", "ninja-drive"),
        value: "dots",
    },
    {
        name: __("None", "ninja-drive"),
        value: "none",
    },
];
