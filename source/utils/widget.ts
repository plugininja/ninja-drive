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

export const isAllowed = (widgetType: ModuleKey, file: File) => {
    const mimeType = file?.mimeType;
    const extension = file?.extension || "";

    switch (widgetType) {
        case "file-browser":
            return true;
        case "file-uploader":
            return isFolder(mimeType);
        case "media-player":
            return (
                (isVideo(extension) || isAudio(extension)) &&
                !isFolder(mimeType)
            );
        case "gallery":
            return (
                (isImage(extension)) &&
                !isFolder(mimeType)
            );
        case "slider-carousel":
            return (
                (isImage(extension) || isVideo(extension)) &&
                !isFolder(mimeType)
            );
        case "embed-documents":
            return (
                isFolder(mimeType) ||
                (isAllDocument(file) &&
                    !isImage(extension) &&
                    !isVideo(extension))
            );
        case "search-box":
            return true;
        case "file-list":
            return (
                (isVideo(extension) ||
                    isAllDocument(file) ||
                    isImage(extension)) &&
                !isFolder(mimeType)
            );
        default:
            return isFolder(mimeType) || isDocument(file);
    }
};

export const isSelectAble = (
    widgetType: ModuleKey,
    file: File,
    selectFolder: boolean,
) => {
    const isFolderSelecting = selectFolder;
    const isFileSelecting = true;

    const isFolderType = isFolder(file.mimeType);

    const selectAble = isFolderSelecting
        ? isFolderType
        : !isFolderType && isFileSelecting;

    return selectAble;
};

const contentHiddenMap: Record<ModuleKey, string[]> = {
    "file-browser": [],
    "file-uploader": [
        "filterAllowedNames",
        "advancedFileLoadingType",
        "advancedAutoFetch",
        "advancedSorting",
    ],
    "media-player": ["filter"],
    gallery: ["notifications"],
    "slider-carousel": ["notifications", "filterAllowedNames"],
    "embed-documents": ["notifications"],
    "search-box": ["advancedAutoFetch"],
    "file-list": [],
};

const contentVisibleMap: Record<ModuleKey, string[]> = {
    "file-browser": [
        "filterMaxFileUpload",
        "permissionUpload",
        "uploadOptions",
        "permissionPreview",
        "permissionNewFolder",
        "permissionDeleteFolder",
        "permissionSearch",
        "permissionDownload",
        "permissionRename",
        "permissionAllowShare",
        "permissionCopyMove",
        "downloadNotification",
        "uploadNotification",
        "deleteNotification",
        "newFolderNotification",
        "renameNotification",
        "createShareLinkNotification",
        "viewShareFileNotification",
        "moveNotification",
        "copyNotification",
    ],
    "file-uploader": ["uploadNotification"],
    "media-player": [
        "permissionDownload",
        "downloadNotification",
        "notificationDownloadNote",
    ],
    gallery: ["permissionPreview", "downloadNotification"],
    "slider-carousel": ["filterMaxFileNumbers"],
    "embed-documents": [],
    "search-box": [
        "permissionPreview",
        "permissionDownload",
        "downloadNotification",
        "notificationDownloadNote",
        "notificationPreviewNote",
    ],
    "file-list": [
        "permissionDownload",
        "downloadNotification",
        "notificationDownloadNote",
    ],
};

export const checkContentVisibility = (
    widgetType: ModuleKey | null,
    contentName: string,
    hideCondition?: boolean,
    customCondition = true,
) => {
    if (!customCondition || !widgetType) return false;

    const condition = hideCondition ?? true;

    if (condition) {
        return !contentHiddenMap[widgetType]?.includes(contentName);
    } else {
        return contentVisibleMap[widgetType]?.includes(contentName) ?? false;
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
    const userAccess = config?.userAccess;

    if (userAccess === "everyone") {
        return true;
    } else if (userAccess === "logged") {
        if (pnpnd.currentUser?.roles.includes("administrator")) {
            return true;
        }
        const loggedInUserType = config?.loggedInUserType;
        const displayFor = config?.displayFor || [];

        if (loggedInUserType === "users") {
            const userId = pnpnd.currentUser?.id;
            return !!userId && displayFor.includes(userId);
        } else if (loggedInUserType === "roles") {
            const userRoles: string[] = pnpnd.currentUser?.roles || [];
            return userRoles.some((role) => displayFor.includes(role));
        }
    }

    return false;
};

export const validatePassword = (value: string): string | null => {
    if (!value || value.trim().length === 0) return __("Password is required.", "ninja-drive");
    if (/\s/.test(value)) return __("Password must not contain spaces.", "ninja-drive");
    if (value.length < 8) return __("Use at least 8 characters.", "ninja-drive");
    if (!/[a-z]/.test(value)) return __("Add at least one lowercase letter.", "ninja-drive");
    if (!/[A-Z]/.test(value)) return __("Add at least one uppercase letter.", "ninja-drive");
    if (!/[0-9]/.test(value)) return __("Add at least one number.", "ninja-drive");
    if (!/[^\w\s]/.test(value)) return __("Add at least one symbol (e.g. !@#$%).", "ninja-drive");
    if (value.length > 128) return __("Password is too long.", "ninja-drive");
    return null;
};

export const MODULE_MENU: Array<{
    id: string;
    title: string;
    icon: string;
    excludedModules?: ModuleKey[];
}> = [
    {
        id: "source",
        title: __("Source", "ninja-drive"),
        icon: "database_search",
    },
    {
        id: "filter",
        title: __("Filter", "ninja-drive"),
        icon: "filter_alt",
        excludedModules: ["media-player"],
    },
    {
        id: "advanced",
        title: __("Advanced", "ninja-drive"),
        icon: "category_search",
    },
    {
        id: "notifications",
        title: __("Notifications", "ninja-drive"),
        icon: "notifications_active",
        excludedModules: ["gallery", "slider-carousel", "embed-documents"],
    },
    {
        id: "permissions",
        title: __("Permissions", "ninja-drive"),
        icon: "visibility_lock",
    },
] as const;

export const getModuleMenuList = (widgetType: ModuleKey) => {
    return MODULE_MENU.filter((menu) => {
        if (menu.excludedModules?.includes(widgetType)) return false;
        return true;
    });
};
