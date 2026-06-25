import { SettingsData } from "~/features/settings";
import { File } from "~/features/file-browser";
import { Account } from "./Types";

export interface AuthState {
    login_accounts: Account[] | null;
    active_account: Account | null;
    loading: boolean;
}

export interface SettingState {
    data: SettingsData | null;
    draft?: SettingsData | null;
    default_data?: SettingsData | null;
    is_dirty?: boolean;
}

export interface FileBrowserState {
    is_file_selecting: boolean;
    suggested_files: File[];
    folder_view: "grid" | "list";
    active_file: File | null;
    is_uploading: boolean;
}

export interface MediaLibraryState {
    folders: File[];
    active_folder: File | null;
    selected_folders: File[];
    create_folder: boolean;
    rename_folder: string | null;
    bulk_select: boolean;
    loading: boolean;
    move_loading: {
        folder_key: string | null;
        loading: boolean;
    };
    query_args: {
        order_by: "name" | "size" | "created_at" | "updated_at";
        order: "ASC" | "DESC";
    };
}
