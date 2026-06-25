import { TBreadcrumb, TLayout } from "~features/file-browser/types/ui";
import { File } from "~features/file-browser/types/file.types";
import { createContext, useContext } from "@wordpress/element";
import { Order, OrderBy } from "~kernel/types/Types";
import FileContextMenu from "./FileContextMenu";
import { MenuProvider } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import BreadCrumbs from "./BreadCrumbs";
import ActionBar from "./ActionBar";
import Suggested from "./Suggested";
import Header from "./Header";
import Files from "./Files";

export interface FilesViewsProps {
    style?: React.CSSProperties;
    children: React.ReactNode;
    breadcrumbs: TBreadcrumb[];
    activeFolder: string;
    layout: TLayout;
    setLayout: (layout: TLayout) => void;
    isFileSelecting: boolean;
    setIsFileSelecting: (isFileSelecting: boolean) => void;
    activeFile?: File;
    setActiveFile?: (file: File | undefined) => void;
    files: File[];
    selected_files: File[];
    setSelectedFiles: (files: File | File[]) => void;
    filesStatus: {
        loading: boolean;
        loadingMore: boolean;
        has_more: boolean;
    };
    openFolder: (key: string) => void;
    showUploader: boolean;
    setShowUploader: React.Dispatch<React.SetStateAction<boolean>>;
    onFileClick: (file: File) => void;
    onFileDoubleClick: (file: File) => void;
    sorting: { order: Order; order_by: OrderBy };
    setSorting: (sorting: { order: Order; order_by: OrderBy }) => void;
    addSuggestedFile?: (file_key: string) => void;
    widget_id?: string;
    list_view_table_head?: {
        name: string;
        size: string;
        type: string;
        updated: string;
        action: string;
    };
    actionsHide?: boolean;
}

const FilesViewsContext = createContext<FilesViewsProps | undefined>(undefined);

export const useFilesContext = () => {
    const context = useContext(FilesViewsContext);
    if (!context) {
        throw new Error("useFilesContext must be used within a FilesView");
    }
    return context;
};

const FilesViews = (props: FilesViewsProps) => {
    const { children, style } = props;

    return (
        <FilesViewsContext.Provider value={props}>
            <MenuProvider>
                <BlockStack style={style} className="w-full h-full">
                    {children}
                </BlockStack>
            </MenuProvider>
        </FilesViewsContext.Provider>
    );
};

FilesViews.Actions = ActionBar;
FilesViews.Suggested = Suggested;
FilesViews.Breadcrumbs = BreadCrumbs;
FilesViews.Header = Header;
FilesViews.Files = Files;
FilesViews.FileContextMenu = FileContextMenu;

export default FilesViews;
