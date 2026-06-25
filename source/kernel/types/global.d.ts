import { ModuleBuilderProps } from "~features/widget-builder/components/modals/ModuleBuilder";
import { FileSelectorContentProps } from "~/shared/file-picker/components/FileSelector";
import { SettingsData } from "~/features/settings";
import { ExtensionGroups } from "./Types";

export {};
declare global {
    const lgAutoplay: any;
    const lgFullscreen: any;
    const lightGallery: any;
    const lgZoom: any;
    const lgThumbnail: any;
    const lgVideo: any;
    const plupload: any;
    const mOxie: any;
    const pnpndMedia: any;
    const jQuery: any;
    const pnpnd: {
        rest_url: string;
        asset_url: string;
        is_plain: boolean;
        nonce: string;
        ajax_url: string;
        version: string;
        accounts: {
            [key: string]: ActiveAccount;
        };
        default_settings: SettingsData;
        settings: SettingsData;
        is_pro: "1" | "0";
        asset_url: string;
        widget_data: ModuleConfig;
        extension_groups: ExtensionGroups;
        current_user: {
            id: number;
            name: string;
            username: string;
            roles: string[];
            can: {
                files_view: boolean;
                files_upload: boolean;
                files_download: boolean;
                files_preview: boolean;
                files_rename: boolean;
                files_delete: boolean;
                files_copy: boolean;
                files_move: boolean;
                files_share: boolean;
                folders_view: boolean;
                folders_create: boolean;
                accounts_connect: boolean;
                accounts_manage: boolean;
                settings_view: boolean;
                settings_manage: boolean;
                widgets_manage: boolean;
                users_view: boolean;
                users_manage: boolean;
                has_full_access: boolean;
                view_pages: {
                    file_manager: boolean;
                    media_library: boolean;
                    widget_builder: boolean;
                    settings: boolean;
                    user_access: boolean;
                };
            };
        };
        site_url: string;
        admin_page_url: string;
        upgrade_url: string;
        widget_list: ModuleList[];
        user_access:
            | "1"
            | {
                  folders: string[];
                  pages: ("file_browser" | "settings" | "widget_builder")[];
              };
        pagenow: string;
        onboarding: boolean;
    };
    interface Window {
        pnpndRenderModules: () => void;
        pnpnd: typeof pnpnd;
        pnpndMedia: any;
        wp: any;
        PNPNDHelper: typeof PNPNDHelper;
    }
    const PNPNDHelper: {
        openFileSelector: (props: FileSelectorContentProps) => void;
        openModuleBuilder: (props: ModuleBuilderProps) => void;
        getUrl: (
            action: "preview" | "thumbnail" | "download" | "attachment",
            file_key: string,
            file_name: string,
            widget_id?: string,
            size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl",
            extension?: string | null,
        ) => string;
    };
}
