export interface AssignFolderProps {
    title?: string;
    actionText?: string;
    description?: string;
    selected: string[];
    showNotExistMediaFolder?: boolean;
    showNotExistMediaFolderWarning?: boolean;
    mediaLibraryFolderKeys?: string[];
    onSelect: (folders: string[]) => void;
    onAssignFolder?: (keys: string[]) => void;
}
