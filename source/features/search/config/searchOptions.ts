import { __ } from "@wordpress/i18n";

export type SearchType =
    | "all"
    | "folder"
    | "document"
    | "code"
    | "image"
    | "audio"
    | "video"
    | "archive"
    | "binary_executable";

export type SearchScope = "current_folder" | "entire_drive";

export type SearchLocation = "server" | "cache";

export interface SearchOption<T extends string = string> {
    name: string;
    value: T;
}

export const TYPE_OPTIONS: SearchOption<SearchType>[] = [
    { name: __("All", "ninja-drive"), value: "all" },
    { name: __("Folder", "ninja-drive"), value: "folder" },
    { name: __("Documents", "ninja-drive"), value: "document" },
    { name: __("Code", "ninja-drive"), value: "code" },
    { name: __("Images", "ninja-drive"), value: "image" },
    { name: __("Audio", "ninja-drive"), value: "audio" },
    { name: __("Video", "ninja-drive"), value: "video" },
    { name: __("Archive", "ninja-drive"), value: "archive" },
    {
        name: __("Binary Executable", "ninja-drive"),
        value: "binary_executable",
    },
];

export const LOCATION_OPTIONS: SearchOption<SearchLocation>[] = [
    { name: __("Server", "ninja-drive"), value: "server" },
    { name: __("Cache", "ninja-drive"), value: "cache" },
];

export const SCOPE_OPTIONS: SearchOption<SearchScope>[] = [
    { name: __("Current Folder", "ninja-drive"), value: "current_folder" },
    { name: __("Entire Drive", "ninja-drive"), value: "entire_drive" },
];

export const SCOPE_TO_API: Record<SearchScope, string> = {
    current_folder: "folder",
    entire_drive: "global",
};

export const DEFAULT_DEBOUNCE_MS = 300;

export const MIN_QUERY_LENGTH = 2;
