import { __, sprintf } from "@wordpress/i18n";
import { HOME_DIR_FILES } from "~/constants/fileBrowser";
import { ExtensionGroups } from "../types/Types";
import { saveAsList } from "~/constants/files";
import { File } from "~/types/file.types";

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
    if (!file || !file.mimeType) return false;

    const mime = file.mimeType;

    return mime.startsWith("application/") || mime.startsWith("text/");
};

export const isShortcut = (extension: string) => {
    return extension === "shortcut";
};

export const checkFileMenuKey = (menuKey: string) =>
    HOME_DIR_FILES.find((m) => m.fileKey === menuKey);

export const getDocumentExportTypes = (
    file: File,
): { label: string; extension: string }[] => {
    if (!isExportDocument(file)) return [];

    const fileType = file.extension?.toLowerCase();

    if (
        fileType === "document" ||
        fileType === "presentation" ||
        fileType === "spreadsheet" ||
        fileType === "drawing" ||
        fileType === "site" ||
        fileType === "script"
    ) {
        return saveAsList[fileType];
    }

    return [];
};

export const getExtensions = (type: keyof ExtensionGroups): string[] => {
    if (type === "all") {
        return Object.entries(pnpnd.extensionGroups)
            .filter(([key]) => key !== "all")
            .flatMap(([, values]) => values);
    }

    return pnpnd.extensionGroups[type];
};

export const getHomeDirFilesRes = () => {
    return Promise.resolve({
        success: true,
        data: {
            files: HOME_DIR_FILES,
            breadcrumbs: [{ fileKey: "home", name: __("Home", "ninja-drive") }],
            hasMore: false,
            nextPage: 1,
            totalFiles: HOME_DIR_FILES.length,
            totalPages: 1,
            currentPage: 1,
        },
        message: "",
    });
};

export const getFileType = (file: File): string => {
    const mimeType = file.mimeType?.toLowerCase() || "";
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

    if (googleDocsMimeTypes.includes(mimeType)) {
        return "document";
    }

    if (googleSheetsMimeTypes.includes(mimeType)) {
        return "spreadsheet";
    }

    if (googleSlidesMimeTypes.includes(mimeType)) {
        return "document";
    }

    if (googleFormsMimeTypes.includes(mimeType)) {
        return "document";
    }

    if (googleDrawingsMimeTypes.includes(mimeType)) {
        return "image";
    }

    if (googleSitesMimeTypes.includes(mimeType)) {
        return "document";
    }

    if (googleAppsFolder.includes(mimeType)) {
        return "folder";
    }

    if (googleAppsShortcut.includes(mimeType)) {
        return "shortcut";
    }

    if (googleAppsAudio.includes(mimeType)) {
        return "audio";
    }

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    if (mimeType.startsWith("audio/")) {
        return "audio";
    }

    if (mimeType === "application/pdf") {
        return "document";
    }

    if (
        mimeType.includes("word") ||
        mimeType.includes("officedocument.wordprocessing")
    ) {
        return "document";
    }

    if (
        mimeType.includes("excel") ||
        mimeType.includes("officedocument.spreadsheet")
    ) {
        return "spreadsheet";
    }

    if (
        mimeType.includes("powerpoint") ||
        mimeType.includes("officedocument.presentation")
    ) {
        return "document";
    }

    if (
        mimeType.includes("zip") ||
        mimeType.includes("rar") ||
        mimeType.includes("tar") ||
        mimeType.includes("compressed")
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

    if (mimeType.startsWith("text/")) {
        return "document";
    }

    return "document";
};
