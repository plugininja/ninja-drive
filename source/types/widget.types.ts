import { Order, OrderBy, ThemeType } from "./Types";
import { File, FileTypes } from "./file.types";
import { TBreadcrumb } from "./ui";

export type ModuleKey =
    | "file-browser"
    | "file-uploader"
    | "media-player"
    | "gallery"
    | "slider-carousel"
    | "embed-documents"
    | "search-box"
    | "file-list";

export type ModuleStatus = "active" | "inactive";

export interface MBFilter {
    extension: {
        include: string[];
        all: boolean;
        exclude: string[];
    };
    name: {
        include: string;
        all: boolean;
        exclude: string;
        applyTo: {
            files: boolean;
            folders: boolean;
        };
    };
    upload: {
        maxSize: number | null;
        minSize: number | null;
        maxFiles: number | null;
    };
}

export type TPreviewStyle = "grid" | "list";

export interface AdvancedFileBrowser {
    folderView: "grid" | "list";
    headerOptions: {
        status: boolean;
        breadcrumb: boolean;
        refresh: boolean;
        sorting: boolean;
        rootUpload: boolean;
    };
    listViewTableHead: {
        enable: boolean;
        name: string;
        type: string;
        size: string;
        updated: string;
        action: string;
    };
    secureVideoPlayback: boolean;
}

export interface UploadPreview {
    enable: boolean;
    previewStyle: "grid" | "list";
    showHeader: {
        enable: boolean;
        breadcrumb: boolean;
        sorting: boolean;
    };
    listViewTableHead: {
        enable: boolean;
        name: string;
        type: string;
        size: string;
        updated: string;
        action: string;
    };
}

export interface AdvancedFileUploader {
    folderUpload: boolean;
    multipleUpload: boolean;
    uploadPreview: UploadPreview;
    showBoxLabel: boolean;
    labelText: string;
    renameFile: string;
    uploadImmediately: boolean;
    showUploadConfirmation: boolean;
    confirmationMessage: string;
    secureVideoPlayback: boolean;
}

export interface AdvancedMediaPlayer {
    showNextPrevious: boolean;
    showAndHidePlaylist: boolean;
    openedPlaylist: boolean;
    showNumberPrefix: boolean;
    showThumbnail: boolean;
    playlistTitle: string;
    playlistPosition: "left" | "right" | "bottom";
    playlistLayout: "list" | "grid";
    columns: 1 | 2 | 3;
    videoRatio: string;
    secureVideoPlayback: boolean;
}

export interface AdvancedGallery {
    layout:
        | "grid"
        | "masonry"
        | "mosaic"
        | "hover-reveal"
        | "polaroid"
        | "showcase";

    columnsDevice: "desktop" | "laptop" | "tablet" | "mobile";
    columns: {
        desktop: number;
        laptop: number;
        tablet: number;
        mobile: number;
    };
    thumbnailSpacing: {
        value: number;
        unit: string;
    };
    thumbnailRadius: {
        value: number;
        unit: string;
    };
    thumbnailQuality: "thumbnail" | "medium" | "large" | "original";
    showOverlay: boolean;
    overlayDisplayNumber: boolean;
    overlayDisplayTitle: boolean;
    overlayDisplayDescription: boolean;
    rowHeight: number;
    overlayDisplayType: "hover" | "always";
    aspectRatio: "1:1" | "3:2" | "4:3" | "9:16" | "16:9" | "21:9";
}

export interface AdvancedSliderCarousel {
    sliderDirection: "horizontal" | "vertical";
    sliderType: "normal" | "centered";
    sliderEffect:
        | "slide"
        | "flip"
        | "fade"
        | "cube"
        | "coverflow"
        | "cards"
        | "creative";
    showNavigation: boolean;
    navigationStyle: "arrows-dots" | "arrows" | "dots" | "none";
    slideToShowDisplay: "desktop" | "tablet" | "mobile";
    slideToShow: {
        desktop: number;
        tablet: number;
        mobile: number;
    };
    thumbnailQuality: "thumbnail" | "medium" | "large" | "original";
    showOverlay: boolean;
    itemGap: number;
    borderRadius: number;
    lazyLoad: boolean;
    slideAutoPlay: boolean;
    autoPlaySpeed: number;
    infiniteLoop: boolean;
    pauseOnInteraction: boolean;
    mouseControl: boolean;
    showSliderCaption: boolean;
}

export interface AdvancedEmbedDocuments {
    showFileName: boolean;
    width: {
        value: number;
        unit: string;
    };
    height: {
        value: number;
        unit: string;
    };
    allowPopOut: boolean;
}

export interface AdvancedSearchBox {
    browserView: "grid" | "list";
    showLastModified: boolean;
    searchBoxText: string;
    secureVideoPlayback: boolean;
}

export interface AdvancedFileList {
    activeView: "list" | "grid" | "compact" | "table" | "gallery" | "timeline";
    listDisplay: {
        name: {
            enable: boolean;
            text: string;
        };
        thumbnail: {
            enable: boolean;
        };
        extension: {
            enable: boolean;
            text: string;
        };
        size: {
            enable: boolean;
            text: string;
        };
        date: {
            enable: boolean;
            text: string;
        };
        actions: {
            enable: boolean;
            text: string;
        };
    };
    viewButtonText: string;
    viewBackgroundColor: string;
    viewTextColor: string;
    viewBorderRadius: number;
    viewButtonSize: "large" | "medium" | "small";
    downloadButton: boolean;
    downloadButtonText: string;
    downloadBackgroundColor: string;
    downloadTextColor: string;
    downloadBorderRadius: number;
    downloadButtonSize: "large" | "medium" | "small";
    columnsDevice: "desktop" | "tablet" | "mobile";
    columns: {
        desktop: number;
        tablet: number;
        mobile: number;
    };
    openInNewTab: boolean;
    showFileSize: boolean;
    showFileExtension: boolean;
    showTimeStamp: boolean;
    secureVideoPlayback: boolean;
}

export interface MBAdvanced {
    width: {
        value: number;
        unit: string;
    };
    height: {
        value: number;
        unit: string;
    };
    theme: ThemeType;
    borderBoxVisibility: boolean;
    files: {
        loadingType: "load_more" | "infinite_scroll" | "pagination";
        perPage: number;
    };
    autoFetch: {
        status: boolean;
        interval: number;
    };
    sort: {
        orderBy: OrderBy;
        order: Order;
    };
    fileBrowser?: AdvancedFileBrowser;
    fileUploader?: AdvancedFileUploader;
    mediaPlayer?: AdvancedMediaPlayer;
    gallery?: AdvancedGallery;
    sliderCarousel?: AdvancedSliderCarousel;
    embedDocuments?: AdvancedEmbedDocuments;
    searchBox?: AdvancedSearchBox;
    fileList?: AdvancedFileList;
}

export interface MBNotifications {
    enable: ("dashboard" | "email")[];
    newFolder: boolean;
    upload: boolean;
    preview: boolean;
    openInGoogleDrive: boolean;
    rename: boolean;
    download: boolean;
    copy: boolean;
    move: boolean;
    share: boolean;
    viewShareLink: boolean;
    delete: boolean;
    emailRecipients: string;
    skipCurrentUser: boolean;
}

export type UserAccessType = "everyone" | "logged";

export type LoggedInUserType = "users" | "roles";

export interface BasePermission {
    enable: boolean;
    userAccess: UserAccessType;
    loggedInUserType: LoggedInUserType;
    displayFor: string[];
}

export interface UploadPermission extends BasePermission {
    folderUpload: boolean;
}

export interface PreviewPermission extends BasePermission {
    inline: boolean;
    popOut: boolean;
    previewThumbnail: boolean;
}

export interface DownloadPermission extends BasePermission {
    folderDownload: boolean;
    multipleDownload: boolean;
}

export interface SearchPermission extends BasePermission {
    searchLocation: {
        cache: boolean;
        server: boolean;
    };

    searchScope: {
        current: boolean;
        global: boolean;
    };
}

export interface DeletePermission extends BasePermission {
    isMigrateAttachment: boolean;
}

export interface PasswordProtectPermission {
    enable: boolean;
    password: string;
}

interface DisplayForPermission {
    whoCanViewModule: UserAccessType;
    loggedInUserType: LoggedInUserType;
    displayFor: string[];
    showAccessDeniedMessage: boolean;
    accessDeniedMessage: string;
}

export interface MBPermissions {
    newFolder: BasePermission;
    upload: UploadPermission;
    preview: PreviewPermission;
    rename: BasePermission;
    download: DownloadPermission;
    copy: BasePermission;
    move: BasePermission;
    share: BasePermission;
    search: SearchPermission;
    delete: DeletePermission;
    passwordProtect: PasswordProtectPermission;
    displayFor: DisplayForPermission;
}
export interface MBSource {
    fileKeys: { fileKey: string; thumbnailKey: string }[];
    files: File[];
    privateFolder?: boolean;
    breadcrumbs: TBreadcrumb[];
    selectedFiles?: File[];
    currentPage?: number;
    hasMore?: boolean;
    totalCount?: number;
    totalPages?: number;
    nextPage?: number | null;
    perPage?: number;
}

export interface ModuleData {
    source: MBSource;
    filter: MBFilter;
    advanced: MBAdvanced;
    notifications: MBNotifications;
    permissions: MBPermissions;
    error_type?: "password-protected";
    message?: string;
}

export interface ShortCodeLocation {
    type: string;
    post_id: number;
    shortcode_id: number;
    title: string;
    status: string;
    url: string;
}
export interface ModuleConfig {
    id: string;
    type: ModuleKey;
    title: string;
    status: ModuleStatus;
    createdAt: string;
    updatedAt: string;
    integration: string | null;
    locations: ShortCodeLocation[];
    data: ModuleData;
}

export interface MBIState {
    editData: ModuleConfig | null;
    defaultData: ModuleConfig | null;
    isEdited: boolean;
}

export const API_ENDPOINTS = {
    GET_SHORTCODES: "GetShortcodes",
    GET_SHORTCODE: "GetShortcode",
    ADD_SHORTCODE: "AddShortcode",
    UPDATE_SHORTCODE: "UpdateShortcode",
    DELETE_SHORTCODE: "DeleteShortcode",
    NEW_FOLDER: "NewFolderByShortcode",
    DELETE_FILES: "DeleteFilesByShortcode",
    GET_RESUME_UPLOAD_URL: "GetResumeUploadUrlByShortcode",
    UPLOADED: "Uploaded",
    RENAME_FILE: "RenameFileByShortcode",
    GET_FOLDERS: "GetFoldersByShortcode",
    COPY_FILE: "CopyFileByShortcode",
    MOVE_FILE: "MoveFileByShortcode",
    SHARE_LINK: "ShareLink",
} as const;

export interface GetShortcodesRequest {
    order?: Order;
    orderBy?: OrderBy;
    type?: ModuleKey | "all";
    search?: string;
    page?: number;
    perPage?: number;
    status?: "all" | ModuleStatus;
}

export interface GetShortcodeRequest {
    id: string | number;
    config: {
        page?: number;
        fileKey?: string;
        order?: Order;
        orderBy?: OrderBy;
        search?: string;
        from?: "server" | "cache";
        searchScope?: "folder" | "global";
        password?: string;
    };
}

export interface AddShortcodeRequest {
    data: ModuleConfig;
}

export interface GetShortcodesResponse {
    widgets: ModuleConfig[];
    pagination: {
        page: number;
        perPage: number;
        totalPages: number;
    };
    total: number;
}

export interface GetShortcodeResponse {
    widget: ModuleConfig;
}

export interface NewFolderRequest {
    id: string;
    folderName: string;
    parentKey: string;
}

export interface NewFolderResponse {
    folder: File;
}

export interface DeleteFolderRequest {
    id: number;
    fileKeys: string[];
    currentFolderKey: string;
}

export interface DeleteFolderRequest {
    id: number;
}

export interface UploadUrlRequest {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    folderKey: string;
}

export interface UploadedResponse {
    file: File;
}

export interface UploadedUrlRequest {
    id: string;
    uploadId: string;
    folderKey: string;
    widgetId: string;
}

export interface RenameFileRequest {
    id: string;
    fileKey: string;
    name: string;
}

export interface GetFoldersByShortcode {
    id: string;
    folderKey?: string;
}

export interface CopyFileRequest {
    id: string;
    fileKeys: string[];
    folderKey: string;
}

export interface MoveFileRequest extends CopyFileRequest {
    currentFolderKey: string;
}

export interface ShareLinkRequest {
    widgetId: string;
    fileKey: string;
    isPasswordProtected?: boolean;
    password?: string;
    lifetime?: number;
}

export type ModuleBottomProps = {
    fileLoadingType: string;
    loadMore: (pageOverride?: number) => void;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    loadMoreFileRef: React.RefObject<HTMLDivElement>;
};

export type QueryArgs = {
    activeFolder: string;
    page: number;
    perPage: number;
    order: Order;
    orderBy: OrderBy;
    search?: string | null;
    searchScope: "folder" | "global";
    types: FileTypes[];
    autoFetch?: boolean;
    searchLocation: "cache" | "server";
};
