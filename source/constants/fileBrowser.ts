import { __ } from "@wordpress/i18n";
import SharedWithMe from "~/assets/icons/SharedWithMe";
import SharedDrive from "~/assets/icons/SharedDrive";
import Computers from "~/assets/icons/Computers";
import Starred from "~/assets/icons/Starred";
import MyDrive from "~/assets/icons/MyDrive";
import { File } from "~/types/file.types";
import { MenuKey } from "~/types/Types";
import {
    computersIcon,
    myDriveIcon,
    sharedDrivesIcon,
    sharedIcon,
    starredIcon,
} from "~/assets/icons";

export const HOME_DIR_FILES: File<MenuKey>[] = [
    {
        fileKey: "my-drive",
        name: __("My Drive", "ninja-drive"),
        icon: myDriveIcon,
        count: "0",
        extension: "folder",
        mimeType: "application/vnd.google-apps.folder",
        baseName: __("My Drive", "ninja-drive"),
    },
    {
        fileKey: "computers",
        name: __("Computers", "ninja-drive"),
        icon: computersIcon,
        count: "0",
        extension: "folder",
        mimeType: "application/vnd.google-apps.folder",
        baseName: __("Computers", "ninja-drive"),
    },
    {
        fileKey: "shared-drives",
        name: __("Shared Drives", "ninja-drive"),
        icon: sharedDrivesIcon,
        count: "0",
        extension: "folder",
        mimeType: "application/vnd.google-apps.folder",
        baseName: __("Shared Drives", "ninja-drive"),
    },
    {
        fileKey: "shared",
        name: __("Shared with me", "ninja-drive"),
        icon: sharedIcon,
        count: "0",
        extension: "folder",
        mimeType: "application/vnd.google-apps.folder",
        baseName: __("Shared with me", "ninja-drive"),
    },
    {
        fileKey: "starred",
        name: __("Starred", "ninja-drive"),
        icon: starredIcon,
        count: "0",
        extension: "folder",
        mimeType: "application/vnd.google-apps.folder",
        baseName: __("Starred", "ninja-drive"),
    },
];

export const FILES_MENUS: {
    key: MenuKey;
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
    {
        key: "my-drive",
        title: __("My Drive", "ninja-drive"),
        icon: MyDrive,
    },
    {
        key: "computers",
        title: __("Computers", "ninja-drive"),
        icon: Computers,
    },
    {
        key: "shared-drives",
        title: __("Shared Drives", "ninja-drive"),
        icon: SharedDrive,
    },
    {
        key: "shared",
        title: __("Shared with me", "ninja-drive"),
        icon: SharedWithMe,
    },
    {
        key: "starred",
        title: __("Starred", "ninja-drive"),
        icon: Starred,
    },
];
