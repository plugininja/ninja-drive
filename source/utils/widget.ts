import { ModuleKey } from "~/types/widget.types";
import { File } from "~/types/file.types";
import { toBoolean } from "./functions";
import { __ } from "@wordpress/i18n";
import {
    isAllDocument,
    isAudio,
    isDocument,
    isFolder,
    isImage,
    isVideo,
} from "./file";

export const isAllowed = (widget_type: ModuleKey, file: File) => {
    const mime_type = file?.mime_type;
    const extension = file?.extension || "";

    switch (widget_type) {
        case "file_browser":
            return true;
        case "file_uploader":
            return isFolder(mime_type);
        case "media_player":
            return (
                (isVideo(extension) || isAudio(extension)) &&
                !isFolder(mime_type)
            );
        case "gallery":
            return isImage(extension) && !isFolder(mime_type);
        case "slider_carousel":
            return (
                (isImage(extension) || isVideo(extension)) &&
                !isFolder(mime_type)
            );
        case "embed_documents":
            return (
                isFolder(mime_type) ||
                (isAllDocument(file) &&
                    !isImage(extension) &&
                    !isVideo(extension))
            );
        case "search_box":
            return true;
        case "file_list":
            return (
                (isVideo(extension) ||
                    isAllDocument(file) ||
                    isImage(extension)) &&
                !isFolder(mime_type)
            );
        default:
            return isFolder(mime_type) || isDocument(file);
    }
};

export const isSelectAble = (
    widgetType: ModuleKey,
    file: File,
    selectFolder: boolean,
) => {
    const isFolderSelecting = selectFolder;
    const isFileSelecting = true;

    const isFolderType = isFolder(file.mime_type);

    const selectAble = isFolderSelecting
        ? isFolderType
        : !isFolderType && isFileSelecting;

    return selectAble;
};

const contentHiddenMap: Record<ModuleKey, string[]> = {
    file_browser: [],
    file_uploader: [
        "filter_allowed_names",
        "advanced_file_loading_type",
        "advanced_auto_fetch",
        "advanced_sorting",
    ],
    media_player: ["configuration"],
    gallery: ["notifications"],
    slider_carousel: ["notifications", "filter_allowed_names"],
    embed_documents: ["notifications"],
    search_box: ["advanced_auto_fetch"],
    file_list: [],
};

const contentVisibleMap: Record<ModuleKey, string[]> = {
    file_browser: [
        "filter_max_file_upload",
        "permission_upload",
        "upload_options",
        "permission_preview",
        "permission_new_folder",
        "permission_delete_folder",
        "permission_search",
        "permission_download",
        "permission_rename",
        "permission_allow_share",
        "permission_copy_move",
        "download_notification",
        "upload_notification",
        "delete_notification",
        "new_folder_notification",
        "rename_notification",
        "create_share_link_notification",
        "view_share_file_notification",
        "move_notification",
        "copy_notification",
    ],
    file_uploader: ["upload_notification"],
    media_player: [
        "permission_download",
        "download_notification",
        "notification_download_note",
    ],
    gallery: ["permission_preview", "download_notification"],
    slider_carousel: ["filter_max_file_numbers"],
    embed_documents: [],
    search_box: [
        "permission_preview",
        "permission_download",
        "download_notification",
        "notification_download_note",
        "notification_preview_note",
    ],
    file_list: [
        "permission_download",
        "download_notification",
        "notification_download_note",
    ],
};

export const checkContentVisibility = (
    widget_type: ModuleKey | null,
    content_name: string,
    hide_condition?: boolean,
    custom_condition = true,
) => {
    if (!custom_condition || !widget_type) return false;

    const condition = hide_condition ?? true;

    if (condition) {
        return !contentHiddenMap[widget_type]?.includes(content_name);
    } else {
        return contentVisibleMap[widget_type]?.includes(content_name) ?? false;
    }
};

export const checkPermission = (type: string, config: any): boolean => {
    if (!config) {
        return false;
    }

    switch (type) {
        case "preview":
            return config.enable && currentUserCan(config);
        case "createDocument":
        case "editDocument":
        case "directLink":
        default:
            return false;
    }
};

export const currentUserCan = (config: any): boolean => {
    const user_access = config?.user_access;

    if (user_access === "everyone") {
        return true;
    } else if (user_access === "logged") {
        if (pnpnd.current_user?.roles.includes("administrator")) {
            return true;
        }
        const logged_in_user_type = config?.logged_in_user_type;
        const display_for = config?.display_for || [];

        if (logged_in_user_type === "users") {
            const user_name = pnpnd.current_user?.username;
            return !!user_name && display_for.includes(user_name);
        } else if (logged_in_user_type === "roles") {
            const user_roles: string[] = pnpnd.current_user?.roles || [];
            return user_roles.some((role) => display_for.includes(role));
        }
    }

    return false;
};

export const validatePassword = (value: string): string | null => {
    if (!value || value.trim().length === 0)
        return __("Password is required.", "ninja-drive");
    if (/\s/.test(value))
        return __("Password must not contain spaces.", "ninja-drive");
    if (value.length < 8)
        return __("Use at least 8 characters.", "ninja-drive");
    if (!/[a-z]/.test(value))
        return __("Add at least one lowercase letter.", "ninja-drive");
    if (!/[A-Z]/.test(value))
        return __("Add at least one uppercase letter.", "ninja-drive");
    if (!/[0-9]/.test(value))
        return __("Add at least one number.", "ninja-drive");
    if (!/[^\w\s]/.test(value))
        return __("Add at least one symbol (e.g. !@#$%).", "ninja-drive");
    if (value.length > 128) return __("Password is too long.", "ninja-drive");
    return null;
};

export const MODULE_MENU: Array<{
    id: string;
    title: string;
    icon: string;
    excluded_modules?: ModuleKey[];
}> = [
    {
        id: "source",
        title: __("Source", "ninja-drive"),
        icon: "database_search",
    },
    {
        id: "configuration",
        title: __("Configuration", "ninja-drive"),
        icon: "filter_alt",
        excluded_modules: ["media_player"],
    },
    {
        id: "style",
        title: __("Style", "ninja-drive"),
        icon: "category_search",
    },
    {
        id: "notifications",
        title: __("Notifications", "ninja-drive"),
        icon: "notifications_active",
        excluded_modules: ["gallery", "slider_carousel", "embed_documents"],
    },
    {
        id: "permissions",
        title: __("Permissions", "ninja-drive"),
        icon: "visibility_lock",
    },
] as const;

export const getModuleMenuList = (widget_type: ModuleKey) => {
    return MODULE_MENU.filter((menu) => {
        if (menu.excluded_modules?.includes(widget_type)) return false;
        return true;
    });
};
