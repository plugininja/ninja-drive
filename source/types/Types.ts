import type { ReactNode } from "@wordpress/element";

export type Account = {
    account_key: string;
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
    file_key: string;
    name: string;
};

export type Permissions = {
    can_add: boolean;
    can_change_copy_requires_writer_permission: boolean;
    can_delete: boolean;
    can_download: boolean;
    can_move: boolean;
    can_preview: boolean;
    can_rename: boolean;
    can_share: boolean;
    can_trash: boolean;
    copy_requires_writer_permission: boolean;
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

export type OrderBy = "name" | "created_at" | "updated_at" | "size";

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
