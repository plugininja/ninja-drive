export interface AssignFolderProps {
    title?: string;
    actionText?: string;
    description?: string;
    sync?: React.ReactNode;
    selected: string[];
    showNotExistMediaFolder?: boolean;
    showNotExistMediaFolderWarning?: boolean;
    mediaLibraryFolderKeys?: string[];
    onSelect: (folders: string[]) => void;
    onAssignFolder?: (keys: string[]) => void;
}
