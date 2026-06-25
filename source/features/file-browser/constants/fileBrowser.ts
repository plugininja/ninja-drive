import { MenuKey } from "~kernel/types/Types";
import { __ } from "@wordpress/i18n";
import {
    computersIcon,
    myDriveIcon,
    sharedDrivesIcon,
    sharedIcon,
    starredIcon,
    computersSvg,
    myDriveSvg,
    sharedDriveIcon,
    sharedWithMeIcon,
    starredSvg,
} from "~kernel/utils/icons";

export const HOME_DIR_FILES = [
    {
        file_key: "my-drive",
        name: __("My Drive", "ninja-drive"),
        icon: myDriveIcon,
        count: "0",
        extension: "folder",
        mime_type: "application/vnd.google-apps.folder",
        base_name: __("My Drive", "ninja-drive"),
    },
    {
        file_key: "computers",
        name: __("Computers", "ninja-drive"),
        icon: computersIcon,
        count: "0",
        extension: "folder",
        mime_type: "application/vnd.google-apps.folder",
        base_name: __("Computers", "ninja-drive"),
    },
    {
        file_key: "shared-drives",
        name: __("Shared Drives", "ninja-drive"),
        icon: sharedDrivesIcon,
        count: "0",
        extension: "folder",
        mime_type: "application/vnd.google-apps.folder",
        base_name: __("Shared Drives", "ninja-drive"),
    },
    {
        file_key: "shared",
        name: __("Shared with me", "ninja-drive"),
        icon: sharedIcon,
        count: "0",
        extension: "folder",
        mime_type: "application/vnd.google-apps.folder",
        base_name: __("Shared with me", "ninja-drive"),
    },
    {
        file_key: "starred",
        name: __("Starred", "ninja-drive"),
        icon: starredIcon,
        count: "0",
        extension: "folder",
        mime_type: "application/vnd.google-apps.folder",
        base_name: __("Starred", "ninja-drive"),
    },
];

export const FILES_MENUS: {
    key: MenuKey;
    title: string;
    icon: string;
}[] = [
    {
        key: "my-drive",
        title: __("My Drive", "ninja-drive"),
        icon: myDriveSvg,
    },
    {
        key: "computers",
        title: __("Computers", "ninja-drive"),
        icon: computersSvg,
    },
    {
        key: "shared-drives",
        title: __("Shared Drives", "ninja-drive"),
        icon: sharedDriveIcon,
    },
    {
        key: "shared",
        title: __("Shared with me", "ninja-drive"),
        icon: sharedWithMeIcon,
    },
    {
        key: "starred",
        title: __("Starred", "ninja-drive"),
        icon: starredSvg,
    },
];
