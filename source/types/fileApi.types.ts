import { Breadcrumb, OrderBy } from "./Types";
import { File } from "./file.types";

export interface BaseApiRequest {
    active_folder_key?: string;
}

export interface GetFilesRequest extends BaseApiRequest {
    file_key: string;
    types?: string;
    search?: string;
    refresh?: boolean;
    order_by?: OrderBy;
    order?: "ASC" | "DESC";
    page?: number;
    per_page?: number;
}

export interface GetFoldersRequest {
    file_key: string;
    type?: string;
    from?: string;
}

export interface GetFileRequest extends BaseApiRequest {
    file_key: string;
    from?: "cache" | "server";
}

export interface CreateFolderRequest extends BaseApiRequest {
    parent_key: string;
    folder_name: string;
    widget_id?: string;
}

export interface MoveFolderRequest extends BaseApiRequest {
    folder_id: string;
    new_parent_id: string;
}

export interface UploadFileRequest extends BaseApiRequest {
    parent_id: string;
    file: File;
    file_name?: string;
}

export interface DeleteFileRequest extends BaseApiRequest {
    file_keys: string[];
}

export interface RenameFileRequest extends BaseApiRequest {
    file_key: string;
    name: string;
}

export interface DownloadLinkRequest extends BaseApiRequest {
    file_key: string;
}

export interface PreviewLinkRequest extends BaseApiRequest {
    file_key: string;
}

export interface CopyMoveFileRequest extends BaseApiRequest {
    file_keys: string[];
    folder_key: string;
}

export interface UpdateDescriptionRequest extends BaseApiRequest {
    file_key: string;
    description: string;
}

export interface ImportToMLRequest extends BaseApiRequest {
    file_key: string;
    mime_type: string;
}

export interface UploadUrlRequest extends BaseApiRequest {
    name: string;
    type: string;
    folder_key: string;
    description?: string;
    page_secret?: string;
    queue_index?: number;
    extension?: string;
    size?: number;
}

export interface UploadedUrlRequest extends BaseApiRequest {
    id: string;
    account_key: string;
    upload_id: string;
    folder_key: string;
}

export interface SearchFilesRequest extends BaseApiRequest {
    folder_key: string;
    from: string;
    query: string;
    types: string[];
    scope: string;
}

export interface GetFilesResponse {
    breadcrumbs: Breadcrumb[];
    files: File[];
    has_more: boolean;
    next_page: number;
    total_files: number;
    total_pages: number;
    current_page: number;
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
    file_key: string;
    is_password_protected?: boolean;
    password?: string;
    lifetime?: number;
}

export const isCreateFolderRequest = (obj: any): obj is CreateFolderRequest => {
    return (
        obj &&
        typeof obj.parent_key === "string" &&
        typeof obj.folder_name === "string"
    );
};

export const isGetFilesRequest = (obj: any): obj is GetFilesRequest => {
    return (
        obj && obj.active_folder && typeof obj.active_folder.key === "string"
    );
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
