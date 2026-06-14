export type Accounts = {
    connection_type: "automatic" | "manual";
    app_client_id: string;
    app_client_secret: string;
    redirect_uri: string;
};

export type Advanced = {
    google_workspace_domain: string;
    sharing_permission: boolean;
    allow_dot_extension: boolean;
    redirection: boolean;
    delete_data_on_uninstall: boolean;
};

export type Appearance = {
    preloader: number;
    primary_color: string;
    custom_css: string;
};

export type Integrations = {
    active_integrations: string[];
    media_library: MediaLibrary;
};

export type MediaLibrary = {
    folders: string[];
    delete_cloud_file: boolean;
    ml_hover_preview: boolean;
};

export type Synchronization = {
    enable_sync: boolean;
    folders: string[];
    timer: string;
    custom_timer: number;
};

export type Tools = {
    auto_save: boolean;
};

export type SettingsData = {
    accounts: Accounts;
    advanced: Advanced;
    appearance: Appearance;
    integrations: Integrations;
    synchronization: Synchronization;
    tools: Tools;
};
