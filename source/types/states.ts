import { SettingsData, UserAccess } from "./settings";
import { File } from "./file.types";
import { Account } from "./Types";

export interface AuthState {
    loginAccounts: Account[] | null;
    activeAccount: Account | null;
    loading: boolean;
}

export interface SettingState {
    data: SettingsData | null;
    draft?: SettingsData | null;
    defaultData?: SettingsData | null;
    isDirty?: boolean;
}

export interface UserAccessState {
    userAccessList: UserAccess[];
    userAccessListDraft: UserAccess[];
}

export interface FileBrowserState {
    isFileSelecting: boolean;
    suggestedFiles: File[];
    folderView: "grid" | "list";
    activeFile: File | null;
    isUploading: boolean;
}

export interface MediaLibraryState {
    folders: File[];
    activeFolder: File | null;
    selectedFolders: File[];
    createFolder: boolean;
    renameFolder: string | null;
    bulkSelect: boolean;
    loading: boolean;
    moveLoading: {
        folderKey: string | null;
        loading: boolean;
    };
    queryArgs: {
        orderBy: "name" | "size" | "createdAt" | "updatedAt";
        order: "ASC" | "DESC";
    };
}
