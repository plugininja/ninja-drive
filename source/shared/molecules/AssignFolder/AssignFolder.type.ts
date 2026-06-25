export interface AssignFolderProps {
    title?: string;
    actionText?: string;
    description?: string;
    sync?: React.ReactNode;
    selected: string[];
    enable?: boolean;
    showNotExistMediaFolder?: boolean;
    showNotExistMediaFolderWarning?: boolean;
    mediaLibraryFolderKeys?: string[];
    extraContent?: React.ReactNode;
    onSelect: (folders: string[]) => void;
    onAssignFolder?: (keys: string[]) => void;
}
