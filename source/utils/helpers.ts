import { File } from "~/types/file.types";

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
