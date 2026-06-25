import { Order, OrderBy, ThemeType } from "~/kernel/types/Types";
import { TBreadcrumb } from "~/features/file-browser/types/ui";
import { File, FileTypes } from "~/features/file-browser";

export interface MBSource {
    file_keys: { file_key: string; thumbnail_key: string }[];
    files: File[];
    private_folder?: boolean;
    breadcrumbs: TBreadcrumb[];
    selected_files?: File[];
    current_page?: number;
    has_more?: boolean;
    total_pages?: number;
    per_page?: number;
}

export interface MBConfiguration {
    advanced: {
        auto_fetch: {
            status: boolean;
            interval: number;
        };
        sort: {
            order_by: OrderBy;
            order: Order;
        };
        secure_video_playback: boolean;
    };
    security: {
        password_protect: {
            enable: boolean;
            password: string;
        };
        display_for: {
            who_can_view_module: UserAccessType;
            logged_in_user_type: LoggedInUserType;
            display_for: string[];
            show_access_denied_message: boolean;
            access_denied_message: string;
        };
    };
    filter: MBFilter;
}

export interface MBFilter {
    extension: {
        include: string[];
        all: boolean;
        ignore: string[];
    };
    name: {
        include: string;
        all: boolean;
        ignore: string;
        apply_to: {
            files: boolean;
            folders: boolean;
        };
    };
    upload: {
        max_size: number | null;
        min_size: number | null;
        max_files: number | null;
    };
}

export type TPreviewStyle = "grid" | "list";

export interface StyleFileBrowser {
    folder_view: "grid" | "list";
    header_options: {
        breadcrumb: boolean;
        refresh: boolean;
        sorting: boolean;
        root_upload: boolean;
    };
    list_view_table_head: {
        enable: boolean;
        name: string;
        type: string;
        size: string;
        updated: string;
        action: string;
    };
}

export interface UploadPreview {
    enable: boolean;
    preview_style: "grid" | "list";
    show_header: {
        enable: boolean;
        breadcrumb: boolean;
        sorting: boolean;
    };
    list_view_table_head: {
        enable: boolean;
        name: string;
        type: string;
        size: string;
        updated: string;
        action: string;
    };
}

export interface StyleFileUploader {
    folder_upload: boolean;
    multiple_upload: boolean;
    upload_preview: UploadPreview;
    show_box_label: boolean;
    label_text: string;
    rename_file: string;
    upload_immediately: boolean;
    show_upload_confirmation: boolean;
    confirmation_message: string;
    secure_video_playback: boolean;
}

export interface StyleMediaPlayer {
    show_next_previous: boolean;
    show_and_hide_playlist: boolean;
    opened_playlist: boolean;
    show_number_prefix: boolean;
    show_thumbnail: boolean;
    playlist_title: string;
    playlist_position: "left" | "right" | "bottom";
    playlist_layout: "list" | "grid";
    columns: 1 | 2 | 3;
    video_ratio: string;
    secure_video_playback: boolean;
}

export interface StyleGallery {
    layout:
        | "grid"
        | "masonry"
        | "mosaic"
        | "hover-reveal"
        | "polaroid"
        | "showcase";

    columns_device: "desktop" | "laptop" | "tablet" | "mobile";
    columns: {
        desktop: number;
        laptop: number;
        tablet: number;
        mobile: number;
    };
    thumbnail_spacing: {
        desktop: { value: number; unit: string; };
        laptop: { value: number; unit: string; };
        tablet: { value: number; unit: string; };
        mobile: { value: number; unit: string; };
    };
    thumbnail_radius: {
        desktop: { value: number; unit: string; };
        laptop: { value: number; unit: string; };
        tablet: { value: number; unit: string; };
        mobile: { value: number; unit: string; };
    };
    thumbnail_quality: "thumbnail" | "medium" | "large" | "original";
    show_overlay: boolean;
    overlay_display_number: boolean;
    overlay_display_title: boolean;
    overlay_display_description: boolean;
}

export interface StyleSliderCarousel {
    slider_direction: "horizontal" | "vertical";
    slider_type: "normal" | "centered";
    slider_effect:
        | "slide"
        | "flip"
        | "fade"
        | "cube"
        | "coverflow"
        | "cards"
        | "creative";

    navigation_style: "arrows-dots" | "arrows" | "dots" | "none";
    slide_to_show_display: "desktop" | "laptop" | "tablet" | "mobile";
    slide_to_show: {
        desktop: number;
        laptop: number;
        tablet: number;
        mobile: number;
    };
    thumbnail_quality: "thumbnail" | "medium" | "large" | "original";
    show_overlay: boolean;
    item_gap: number;
    border_radius: number;
    slide_auto_play: boolean;
    auto_play_speed: number;
    infinite_loop: boolean;
    mouse_control: boolean;
    show_slider_caption: boolean;
}

export interface StyleEmbedDocuments {
    show_file_name: boolean;
    width: {
        value: number;
        unit: string;
    };
    height: {
        value: number;
        unit: string;
    };
    allow_pop_out: boolean;
}

export interface StyleSearchBox {
    browser_view: "grid" | "list";
    show_last_modified: boolean;
    search_box_text: string;
    secure_video_playback: boolean;
}

export interface StyleFileList {
    active_view: "list" | "grid" | "compact" | "table" | "gallery" | "timeline";
    list_display: {
        name: {
            enable: boolean;
            text: string;
        };
        thumbnail: {
            enable: boolean;
            text: string;
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
    secure_video_playback: boolean;
}

export interface MBStyle {
    width: {
        value: number;
        unit: string;
    };
    height: {
        value: number;
        unit: string;
    };
    theme: ThemeType;
    border_box_visibility: boolean;
    files: {
        loading_type: "load_more" | "infinite_scroll" | "pagination";
        per_page: number;
    };

    file_browser?: StyleFileBrowser;
    file_uploader?: StyleFileUploader;
    media_player?: StyleMediaPlayer;
    gallery?: StyleGallery;
    slider_carousel?: StyleSliderCarousel;
    embed_documents?: StyleEmbedDocuments;
    search_box?: StyleSearchBox;
    file_list?: StyleFileList;
}

export interface MBNotifications {
    enable: ("dashboard" | "email")[];
    new_folder: boolean;
    upload: boolean;
    preview: boolean;
    rename: boolean;
    download: boolean;
    copy: boolean;
    move: boolean;
    share: boolean;
    view_share_link: boolean;
    delete: boolean;
    email_recipients: string;
    skip_current_user: boolean;
}

export type UserAccessType = "everyone" | "logged";

export type LoggedInUserType = "users" | "roles";

export interface BasePermission {
    enable: boolean;
    user_access: UserAccessType;
    logged_in_user_type: LoggedInUserType;
    display_for: string[];
}

export interface UploadPermission extends BasePermission {
    folder_upload: boolean;
}

export interface PreviewPermission extends BasePermission {
    inline: boolean;
    pop_out: boolean;
    preview_thumbnail: boolean;
}

export interface DownloadPermission extends BasePermission {
    folder_download: boolean;
    multiple_download: boolean;
}

export interface SearchPermission extends BasePermission {
    search_location: {
        cache: boolean;
        server: boolean;
    };

    search_scope: {
        current: boolean;
        global: boolean;
    };
}

export interface DeletePermission extends BasePermission {
    is_migrate_attachment?: boolean;
}

export interface MBPermissions {
    new_folder: BasePermission;
    upload: UploadPermission;
    preview: PreviewPermission;
    rename: BasePermission;
    download: DownloadPermission;
    copy: BasePermission;
    move: BasePermission;
    share: BasePermission;
    search: SearchPermission;
    delete: DeletePermission;
}

export interface ModuleData {
    source: MBSource;
    configuration: MBConfiguration;
    style: MBStyle;
    notifications: MBNotifications;
    permissions: MBPermissions;
}

export type ModuleKey =
    | "file_browser"
    | "file_uploader"
    | "media_player"
    | "gallery"
    | "slider_carousel"
    | "embed_documents"
    | "search_box"
    | "file_list";

export type ModuleStatus = "active" | "inactive";

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
    created_at: string;
    updated_at: string;
    integration: string | null;
    locations: ShortCodeLocation[];
    data: ModuleData;
    error_type?: "password-protected";
    message?: string;
}

export interface MBIState {
    edit_data: ModuleConfig | null;
    default_data: ModuleConfig | null;
    is_edited: boolean;
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
    order_by?: OrderBy;
    type?: ModuleKey | "all";
    search?: string;
    page?: number;
    per_page?: number;
    status?: "all" | ModuleStatus;
}

export interface GetShortcodeRequest {
    id: string | number;
    config: {
        page?: number;
        file_key?: string;
        order?: Order;
        order_by?: OrderBy;
        search?: string;
        from?: "server" | "cache";
        search_scope?: "folder" | "global";
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
        per_page: number;
        total_pages: number;
    };
    total: number;
}

export interface GetShortcodeResponse {
    widget: ModuleConfig;
}

export interface NewFolderRequest {
    id: string;
    folder_name: string;
    parent_key: string;
}

export interface NewFolderResponse {
    folder: File;
}

export interface DeleteFolderRequest {
    id: number;
    file_keys: string[];
    current_folder_key: string;
}

export interface UploadUrlRequest {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    folder_key: string;
}

export interface UploadedResponse {
    file: File;
}

export interface UploadedUrlRequest {
    id: string;
    upload_id: string;
    folder_key: string;
    widget_id: string;
}

export interface RenameFileRequest {
    id: string;
    file_key: string;
    name: string;
}

export interface GetFoldersByShortcode {
    id: string;
    folder_key?: string;
}

export interface CopyFileRequest {
    id: string;
    file_keys: string[];
    folder_key: string;
}

export interface MoveFileRequest extends CopyFileRequest {
    current_folder_key: string;
}

export interface ShareLinkRequest {
    widget_id: string;
    file_key: string;
    is_password_protected?: boolean;
    password?: string;
    lifetime?: number;
}

export type ModuleBottomProps = {
    file_loading_type: string;
    loadMore: (pageOverride?: number) => void;
    has_more: boolean;
    total_pages: number;
    current_page: number;
    is_loading: boolean;
    load_more_file_ref: React.RefObject<HTMLDivElement>;
};

export type QueryArgs = {
    active_folder: string;
    page: number;
    per_page: number;
    order: Order;
    order_by: OrderBy;
    search?: string | null;
    search_scope: "folder" | "global";
    types: FileTypes[];
    auto_fetch?: boolean;
    search_location: "cache" | "server";
};
