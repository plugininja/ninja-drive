import { HOME_DIR_FILES } from "~/constants/fileBrowser";
import { ExtensionGroups } from "../types/Types";
import { saveAsList } from "~/constants/files";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return __("0 Bytes", "ninja-drive");
    const k = 1024;
    const sizes = [
        __("Bytes", "ninja-drive"),
        __("KB", "ninja-drive"),
        __("MB", "ninja-drive"),
        __("GB", "ninja-drive"),
        __("TB", "ninja-drive"),
        __("PB", "ninja-drive"),
        __("EB", "ninja-drive"),
        __("ZB", "ninja-drive"),
        __("YB", "ninja-drive"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const isFolder = (mimeType_ext: string) =>
    mimeType_ext === "application/vnd.google-apps.folder" ||
    mimeType_ext === "folder";

export const isImage = (ext: string) => getExtensions("image").includes(ext);

export const isVideo = (ext: string) => getExtensions("video").includes(ext);

export const isAudio = (ext: string) => getExtensions("audio").includes(ext);

export const isDocument = (file: File) =>
    [
        "document",
        "presentation",
        "spreadsheet",
        "drawing",
        "site",
        "script",
    ].includes(getFileType(file));

export const isExportDocument = (file: File) => {
    return [
        "document",
        "presentation",
        "spreadsheet",
        "drawing",
        "site",
        "script",
    ].includes(file?.extension?.toLowerCase() || "");
};

export const isAllDocument = (file: File) => {
    if (!file || !file.mime_type) return false;

    const mime = file.mime_type;

    return mime.startsWith("application/") || mime.startsWith("text/");
};

export const isShortcut = (extension: string) => {
    return extension === "shortcut";
};

export const checkFileMenuKey = (menu_key: string) =>
    HOME_DIR_FILES.find((m) => m.file_key === menu_key);

export const getDocumentExportTypes = (
    file: File,
): { label: string; extension: string }[] => {
    if (!isExportDocument(file)) return [];

    const file_type = file.extension?.toLowerCase();

    if (
        file_type === "document" ||
        file_type === "presentation" ||
        file_type === "spreadsheet" ||
        file_type === "drawing" ||
        file_type === "site" ||
        file_type === "script"
    ) {
        return saveAsList[file_type];
    }

    return [];
};

export const getExtensions = (type: keyof ExtensionGroups): string[] => {
    if (type === "all") {
        return Object.entries(pnpnd.extension_groups)
            .filter(([key]) => key !== "all")
            .flatMap(([, values]) => values);
    }

    return pnpnd.extension_groups[type];
};

export const getHomeDirFilesRes = () => {
    return Promise.resolve({
        success: true,
        data: {
            files: HOME_DIR_FILES,
            breadcrumbs: [
                { file_key: "home", name: __("Home", "ninja-drive") },
            ],
            has_more: false,
            next_page: 1,
            total_files: HOME_DIR_FILES.length,
            total_pages: 1,
            current_page: 1,
        },
        message: "",
    });
};

export const getFileType = (file: File): string => {
    const mime_type = file.mime_type?.toLowerCase() || "";
    const extension = file.extension?.toLowerCase() || "";

    const googleDocsMimeTypes = [
        "application/vnd.google-apps.document",
        "application/vnd.google-apps.kix",
        "application/vnd.google-apps.script",
        "application/vnd.google-apps.script+json",
    ];

    const googleSheetsMimeTypes = ["application/vnd.google-apps.spreadsheet"];

    const googleSlidesMimeTypes = ["application/vnd.google-apps.presentation"];

    const googleFormsMimeTypes = ["application/vnd.google-apps.form"];

    const googleDrawingsMimeTypes = ["application/vnd.google-apps.drawing"];

    const googleSitesMimeTypes = ["application/vnd.google-apps.site"];

    const googleAppsFolder = ["application/vnd.google-apps.folder"];

    const googleAppsShortcut = ["application/vnd.google-apps.shortcut"];

    const googleAppsAudio = ["application/vnd.google-apps.audio"];

    if (googleDocsMimeTypes.includes(mime_type)) {
        return "document";
    }

    if (googleSheetsMimeTypes.includes(mime_type)) {
        return "spreadsheet";
    }

    if (googleSlidesMimeTypes.includes(mime_type)) {
        return "presentation";
    }

    if (googleFormsMimeTypes.includes(mime_type)) {
        return "document";
    }

    if (googleDrawingsMimeTypes.includes(mime_type)) {
        return "image";
    }

    if (googleSitesMimeTypes.includes(mime_type)) {
        return "document";
    }

    if (googleAppsFolder.includes(mime_type)) {
        return "folder";
    }

    if (googleAppsShortcut.includes(mime_type)) {
        return "shortcut";
    }

    if (googleAppsAudio.includes(mime_type)) {
        return "audio";
    }

    if (mime_type.startsWith("image/")) {
        return "image";
    }

    if (mime_type.startsWith("video/")) {
        return "video";
    }

    if (mime_type.startsWith("audio/")) {
        return "audio";
    }

    if (mime_type === "application/pdf") {
        return "document";
    }

    if (
        mime_type.includes("word") ||
        mime_type.includes("officedocument.wordprocessing")
    ) {
        return "document";
    }

    if (
        mime_type.includes("excel") ||
        mime_type.includes("officedocument.spreadsheet")
    ) {
        return "spreadsheet";
    }

    if (
        mime_type.includes("powerpoint") ||
        mime_type.includes("officedocument.presentation")
    ) {
        return "document";
    }

    if (
        mime_type.includes("zip") ||
        mime_type.includes("rar") ||
        mime_type.includes("tar") ||
        mime_type.includes("compressed")
    ) {
        return "archive";
    }

    const codeExtensions = [
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "cpp",
        "c",
        "cs",
        "php",
        "rb",
        "go",
        "rs",
        "swift",
        "kt",
        "scala",
        "html",
        "css",
        "scss",
        "sass",
        "json",
        "xml",
        "yml",
        "yaml",
        "sql",
        "sh",
        "bash",
        "md",
    ];

    if (codeExtensions.includes(extension)) {
        return "code";
    }

    if (mime_type.startsWith("text/")) {
        return "document";
    }

    return "document";
};
