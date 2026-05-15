import { FileSelectorContentProps } from "~/components/organisms/modals/FileSelector";
import { ModuleBuilderProps } from "~/components/organisms/modals/ModuleBuilder";
import { ExtensionGroups } from "./Types";
import { SettingsData } from "./settings";

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
        restUrl: string;
        isPlain: boolean;
        nonce: string;
        ajaxUrl: string;
        version: string;
        accounts: {
            [key: string]: ActiveAccount;
        };
        defaultSettings: SettingData;
        settings: SettingsData;
        isPro: "1" | "0";
        assetUrl: string;
        widgetData: ModuleConfig;
        extensionGroups: ExtensionGroups;
        currentUser: {
            id: number;
            name: string;
            roles: string[];
            can: {
                manageFileBrowser: boolean;
                manageMediaLibrary: boolean;
                manageModuleBuilder: boolean;
                manageSettings: boolean;
                hasFullAccess: boolean;
            };
        };
        siteUrl: string;
        adminPageUrl: string;
        upgradeUrl: string;
        widgetList: ModuleList[];
        userAccess:
            | "1"
            | {
                  folders: string[];
                  pages: ("file_browser" | "settings" | "widget_builder")[];
              };
        pagenow: string;
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
            fileKey: string,
            fileName: string,
            widgetId?: string,
            size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl",
            extension?: string | null,
        ) => string;
    };
}
