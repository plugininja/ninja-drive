import FileContextMenu from "~/shared/file-views/components/FilesViews/FileContextMenu";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { File } from "~features/file-browser/types/file.types";
import { STORAGE_KEYS } from "~kernel/constants/storageKeys";
import MediaSidebar from "./components/MediaSidebar";
import Menus, { MenuKey } from "./components/Menus";
import ContextMenu from "./components/ContextMenu";
import FolderTree from "./components/FolderTree";
import { MenuProvider } from "~/ui/molecules";
import Context from "./components/Context";

const App = () => {
    const [active, setActive] = useLocalStorage<MenuKey>(
        STORAGE_KEYS?.mediaLibraryActiveTab,
        "media_library",
    );

    const handleMenuClick = (id: string, file: File) => {
    };

    return (
        <MenuProvider>
            <MediaSidebar>
                <Menus setActive={setActive}>
                    <Menus.MediaLibrary active={active === "media_library"} />

                    <Menus.Account active={active === "account"} />

                    <Menus.TrashBin active={active === "trash_bin"} />

                    {active === "account" && <FolderTree activeMenu={active} />}
                </Menus>
            </MediaSidebar>

            <Context />

            <ContextMenu activeTab={active} />

            <FileContextMenu
                skipMenus={[
                    "open",
                    "view-details",
                    "download",
                    "downloadLink",
                    "hide",
                ]}
                onMenuClick={handleMenuClick}
            />
        </MenuProvider>
    );
};

export default App;
