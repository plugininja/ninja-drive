export type CanPermission =
    | "files_view"
    | "files_upload"
    | "files_download"
    | "files_preview"
    | "files_rename"
    | "files_delete"
    | "files_copy"
    | "files_move"
    | "files_share"
    | "folders_view"
    | "folders_create"
    | "accounts_connect"
    | "accounts_manage"
    | "settings_view"
    | "settings_manage"
    | "widgets_manage"
    | "users_view"
    | "users_manage"
    | "has_full_access";

export type ViewPage =
    | "file_manager"
    | "media_library"
    | "widget_builder"
    | "settings"
    | "user_access";

export function userCan(permission: CanPermission): boolean {
    if (pnpnd.is_pro !== "1") return true;
    if (!pnpnd?.current_user?.can) return true;
    return !!pnpnd.current_user.can[permission];
}

export function userCanViewPage(page: ViewPage): boolean {
    if (pnpnd.is_pro !== "1") return true;
    if (!pnpnd?.current_user?.can?.view_pages) return true;
    return !!pnpnd.current_user.can.view_pages[page];
}
