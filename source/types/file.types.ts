export type File<T = string> = {
    id?: string;
    fileKey: T;
    name: string;
    icon: string;
    description?: string;
    mimeType: string;
    parentId?: string;
    accountId?: string;
    previewLink?: string;
    size: number;
    thumbnail: string;
    extension: string | null;
    isDir: boolean;
    isShared: boolean;
    isStarred: boolean;
    updatedAt: string;
    createdAt: string;
    media?: MediaDetails;
    permissions?: Permissions;
    additionalData?: {
        baseName?: string;
        lastEdited?: string;
    };
    thumbnailData?: {
        fileKey: string;
        name: string;
        basename: string;
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
    fileKey: string;
    children?: FolderTree[];
    parent?: string;
};
