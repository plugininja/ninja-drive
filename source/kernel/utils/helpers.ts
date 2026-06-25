import { File } from "~features/file-browser/types/file.types";

export const checkSelectionFiles = (
    new_selected_files: File | File[],
    selected_files: File[],
) => {
    if (Array.isArray(new_selected_files)) {
        if (new_selected_files.length === 0) return [];
        const selectedKeys = new_selected_files.map((file) => file.file_key);
        const prevSelectedFiles = selected_files.filter(
            (file) => !selectedKeys.includes(file.file_key),
        );
        return [...prevSelectedFiles, ...new_selected_files];
    } else {
        const isAlreadySelected = selected_files.find(
            (file) => file.file_key === new_selected_files.file_key,
        );
        if (isAlreadySelected) {
            return selected_files.filter(
                (file) => file.file_key !== new_selected_files.file_key,
            );
        } else {
            return [...selected_files, new_selected_files];
        }
    }
};

export function isValidArray<T = unknown>(
    value: T[] | undefined | null,
): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function trimString(value: string): string {
    if (typeof value !== "string") return value;

    return value?.replace(/\s+/g, " ")?.trim();
}

export function formatRemainingTime(seconds: number): string {
    if (seconds <= 0) return "expired";

    const year = 365 * 24 * 60 * 60;
    const day = 24 * 60 * 60;
    const hour = 60 * 60;
    const minute = 60;

    const y = Math.floor(seconds / year);
    seconds %= year;

    const d = Math.floor(seconds / day);
    seconds %= day;

    const h = Math.floor(seconds / hour);
    seconds %= hour;

    const m = Math.floor(seconds / minute);

    const parts = [];

    if (y) parts.push(`${y}y`);
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);

    return parts.length ? parts.join(" ") : "expired";
}
