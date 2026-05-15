export type Accounts = {
    connectionType: "automatic" | "manual";
    appClientId: string;
    appClientSecret: string;
    redirectUri: string;
};

export type Advanced = {
    googleWorkspaceDomain: string;
    sharingPermission: boolean;
    allowDotExtension: boolean;
    secureVideoPlayback: boolean;
    deleteDataOnUninstall: boolean;
};

export type Appearance = {
    preloader: number;
    primaryColor: string;
    customCSS: string;
};

export type UserAccess = {
    id: string;
    type: "role" | "user";
    value: string;
    folders: string[];
    pages: ("file_browser" | "settings" | "widget_builder" | "media_library")[];
};

export type Integrations = {
    activeIntegrations: string[];
    mediaLibrary: MediaLibrary;
};

export type MediaLibrary = {
    folders: string[];
    redirection: boolean;
    deleteCloudFile: boolean;
    mlHoverPreview: boolean;
};

export type Synchronization = {
    enableSync: boolean;
    folders: string[];
    timer: string;
    customTimer: number;
};

export type Tools = {
    autoSave: boolean;
};

export type SettingsData = {
    accounts: Accounts;
    advanced: Advanced;
    appearance: Appearance;
    userAccess: UserAccess[];
    integrations: Integrations;
    synchronization: Synchronization;
    tools: Tools;
};
