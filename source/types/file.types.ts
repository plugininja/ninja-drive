export type File<T = string> = {
    id?: string;
    file_key: T;
    name: string;
    icon: string;
    description?: string;
    mime_type: string;
    parent_id?: string;
    account_id?: string;
    preview_link?: string;
    size: number;
    thumbnail: string;
    extension: string | null;
    is_dir: boolean;
    is_shared: boolean;
    is_starred: boolean;
    updated_at: string;
    created_at: string;
    media?: MediaDetails;
    permissions?: Permissions;
    additional_data?: {
        base_name?: string;
        last_edited?: string;
    };
    thumbnail_data?: {
        file_key: string;
        name: string;
        base_name: string;
        extension: string;
        thumbnail: string;
    };
};

export type MediaDetails = {
    width?: number;
    height?: number;
    duration?: string;
};

export type FileTypes =
    | "image"
    | "video"
    | "audio"
    | "document"
    | "archive"
    | "code"
    | "folder"
    | "binary_executable"
    | "downloadable"
    | "all";

export type FolderTree = {
    name: string;
    file_key: string;
    children?: FolderTree[];
    parent?: string;
    icon: string;
};
