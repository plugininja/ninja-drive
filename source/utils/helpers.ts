import { File } from "~/types/file.types";

export const checkSelectionFiles = (
    newSelectedFiles: File | File[],
    selectedFiles: File[],
) => {
    if (Array.isArray(newSelectedFiles)) {
        if (newSelectedFiles.length === 0) return [];
        const selectedKeys = newSelectedFiles.map((file) => file.fileKey);
        const prevSelectedFiles = selectedFiles.filter(
            (file) => !selectedKeys.includes(file.fileKey),
        );
        return [...prevSelectedFiles, ...newSelectedFiles];
    } else {
        const isAlreadySelected = selectedFiles.find(
            (file) => file.fileKey === newSelectedFiles.fileKey,
        );
        if (isAlreadySelected) {
            return selectedFiles.filter(
                (file) => file.fileKey !== newSelectedFiles.fileKey,
            );
        } else {
            return [...selectedFiles, newSelectedFiles];
        }
    }
};

export function isValidArray<T = unknown>(
    value: T[] | undefined | null,
): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

const getFileType = (file: File): string => {
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

const getInlineType = (file: File): string => {
    const mimeType = file.mimeType?.toLowerCase() || "";
    const extension = file.extension?.toLowerCase() || "";

    if (mimeType === "application/vnd.google-apps.document") {
        return "gdoc";
    }

    if (mimeType === "application/vnd.google-apps.spreadsheet") {
        return "gsheet";
    }

    if (mimeType === "application/vnd.google-apps.presentation") {
        return "gslides";
    }

    if (mimeType === "application/vnd.google-apps.folder") {
        return "folder";
    }

    return extension || "folder";
};
