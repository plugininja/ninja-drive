import type { ReactNode } from "react";

export type Account = {
    accountKey: string;
    id: string;
    name: string;
    email: string;
    photo: string;
    storage: {
        limit: string;
        usage: string;
    };
    lost: number;
    active: number;
    user: {
        avatar: string;
        email: string;
        name: string;
        id: number;
        roles: string[];
    };
    syncing: boolean;
};

export type Breadcrumb = {
    fileKey: string;
    name: string;
};

export type Permissions = {
    canAdd: boolean;
    canChangeCopyRequiresWriterPermission: boolean;
    canDelete: boolean;
    canDownload: boolean;
    canMove: boolean;
    canPreview: boolean;
    canRename: boolean;
    canShare: boolean;
    canTrash: boolean;
    copyRequiresWriterPermission: boolean;
    users: {
        [key: string]: {
            type: "user" | "owner";
            role: "owner" | "writer" | "reader" | "anyone";
            domain: string | null;
        };
    };
};

export type Thumbnails = {
    thumbnail: string;
    medium: string;
    large: string;
    full: string;
};

export type OrderBy = "name" | "createdAt" | "updatedAt" | "size";

export type Order = "ASC" | "DESC";

export type ExtensionGroups = {
    all: string[];
    archive: string[];
    audio: string[];
    binary_executable: string[];
    code: string[];
    document: string[];
    folder: string[];
    image: string[];
    video: string[];
};

export type Preloader = {
    id: string;
    icon: ReactNode;
    title: string;
};

export const MENU_KEYS = [
    "home",
    "my-drive",
    "computers",
    "shared-drives",
    "shared",
    "starred",
] as const;

export type MenuKey = (typeof MENU_KEYS)[number];

export type ThemeType = "light" | "dark" | "system";

export type ServerResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};
