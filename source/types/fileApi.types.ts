import { File } from "./file.types";
import { Breadcrumb, OrderBy } from "./Types";

export interface BaseApiRequest {
    activeFolderKey?: string;
}

export interface GetFilesRequest extends BaseApiRequest {
    fileKey: string;
    types?: string;
    search?: string;
    refresh?: boolean;
    orderBy?: OrderBy;
    order?: "ASC" | "DESC";
    page?: number;
    perPage?: number;
}

export interface GetFoldersRequest {
    fileKey: string;
    type?: string;
    from?: string;
}

export interface GetFileRequest extends BaseApiRequest {
    fileKey: string;
    from?: "cache" | "server";
}

export interface CreateFolderRequest extends BaseApiRequest {
    parentKey: string;
    folderName: string;
    widgetId?: string;
}

export interface MoveFolderRequest extends BaseApiRequest {
    folderId: string;
    newParentId: string;
}

export interface UploadFileRequest extends BaseApiRequest {
    parentId: string;
    file: File;
    fileName?: string;
}

export interface DeleteFileRequest extends BaseApiRequest {
    fileKeys: string[];
}

export interface RenameFileRequest extends BaseApiRequest {
    fileKey: string;
    name: string;
}

export interface DownloadLinkRequest extends BaseApiRequest {
    fileKey: string;
}

export interface PreviewLinkRequest extends BaseApiRequest {
    fileKey: string;
}

export interface CopyMoveFileRequest extends BaseApiRequest {
    fileKeys: string[];
    folderKey: string;
}

export interface UpdateDescriptionRequest extends BaseApiRequest {
    fileKey: string;
    description: string;
}

export interface ImportToMLRequest extends BaseApiRequest {
    fileKey: string;
    mimeType: string;
}

export interface UploadUrlRequest extends BaseApiRequest {
    name: string;
    type: string;
    folderKey: string;
    description?: string;
    page_secret?: string;
    queueIndex?: number;
    extension?: string;
    size?: number;
}

export interface UploadedUrlRequest extends BaseApiRequest {
    id: string;
    accountKey: string;
    uploadId: string;
    folderKey: string;
}

export interface SearchFilesRequest extends BaseApiRequest {
    folderKey: string;
    from: string;
    query: string;
    types: string[];
    scope: string;
}

export interface GetFilesResponse {
    breadcrumbs: Breadcrumb[];
    files: File[];
    hasMore: boolean;
    nextPage: number;
    totalFiles: number;
    totalPages: number;
    currentPage: number;
}

export interface GetFoldersResponse {
    folders: File[];
}

export interface GetFileResponse {
    file: File;
}

export interface CreateFolderResponse {
    folder: File;
}

export interface FileOperationResponse {
    file?: File;
    files?: File[];
}

export interface DownloadLinkResponse {
    download: string;
}

export interface PreviewLinkResponse {
    preview: string;
}

export interface UploadedResponse {
    file: File;
}

export interface ShareLinkRequest {
    fileKey: string;
    isPasswordProtected?: boolean;
    password?: string;
    lifetime?: number;
}

export const isCreateFolderRequest = (obj: any): obj is CreateFolderRequest => {
    return (
        obj &&
        typeof obj.parentKey === "string" &&
        typeof obj.folderName === "string"
    );
};

export const isGetFilesRequest = (obj: any): obj is GetFilesRequest => {
    return obj && obj.activeFolder && typeof obj.activeFolder.key === "string";
};

export const API_ENDPOINTS = {
    GET_FOLDER: "GetFolder",
    GET_FOLDERS: "GetFolders",
    GET_FILE: "GetFile",
    NEW_FOLDER: "NewFolder",
    UPLOAD_FILE: "UploadFile",
    DELETE_FILE: "DeleteFiles",
    MOVE_FILE: "MoveFile",
    COPY_FILE: "CopyFile",
    RENAME_FILE: "RenameFile",
    DOWNLOAD_FILE: "DownloadLink",
    PREVIEW_LINK: "PreviewLink",
    UPDATE_DESCRIPTION: "UpdateDescription",
    IMPORT_TO_ML: "ImportToMediaLibrary",
    GET_RESUME_UPLOAD_URL: "GetResumeUploadUrl",
    UPLOADED: "Uploaded",
    SEARCH_FILES: "SearchFiles",
    SHARE_LINK: "ShareLink",
    ML_GET_FOLDERS: "GetFolderForMediaLibrary",
    ML_DELETE_FILES: "DeleteMediaLibraryFiles",
} as const;

export const DEFAULT_CONFIG = {
    PER_PAGE_LIMIT: 24,
    CLEANUP_INTERVAL: 5 * 60 * 1000,
} as const;
