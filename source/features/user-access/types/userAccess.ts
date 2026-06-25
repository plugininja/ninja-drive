export type UserAccess = {
    id: number;
    type: "role" | "user";
    value: string;
    title: string;
    status: "active" | "inactive";
    folders: string[];
    pages: (
        | "file_manager"
        | "media_library"
        | "widget_builder"
        | "settings"
        | "user_access"
    )[];
    permissions: (
        | "files.view"
        | "files.upload"
        | "files.download"
        | "files.preview"
        | "files.rename"
        | "files.delete"
        | "files.copy"
        | "files.move"
        | "files.share"
        | "folders.view"
        | "folders.create"
        | "accounts.connect"
        | "accounts.manage"
        | "settings.view"
        | "settings.manage"
        | "widgets.manage"
        | "users.view"
        | "users.manage"
    )[];
};

export interface UserAccessState {
    edit_data: UserAccess | null;
    default_data: UserAccess | null;
    roles: string[];
    users: string[];
    is_edited: boolean;
}

export type UserAccessQueryArgs = {
    base: "all" | "role" | "user";
    search: string;
    order_by: "id" | "title" | "created_at" | "updated_at";
    status: "all" | "active" | "inactive";
    order: "asc" | "desc";
};
