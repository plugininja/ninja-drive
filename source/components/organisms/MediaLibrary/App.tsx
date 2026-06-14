import FileContextMenu from "~/components/organisms/FilesViews/FileContextMenu";
import { MenuProvider } from "~/components/molecules/ContextMenu";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useFileActions } from "~/hooks/useFileActions";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import MediaSidebar from "./components/MediaSidebar";
import Menus, { MenuKey } from "./components/Menus";
import ContextMenu from "./components/ContextMenu";
import FolderTree from "./components/FolderTree";
import { useEffect } from "@wordpress/element";
import Context from "./components/Context";
import { File } from "~/types/file.types";
import {
    addFolders,
    selectMediaLibrary,
    setActiveFolder,
    setRenameFolder,
} from "~/store/features/mediaLibrarySlice";

const App = () => {
    const [active, setActive] = useLocalStorage<MenuKey>(
        STORAGE_KEYS?.mediaLibraryActiveTab,
        "media_library",
    );

    const { active_folder } = useAppSelector(selectMediaLibrary);

    const { share, move } = useFileActions();

    const dispatch = useAppDispatch();

    useEffect(() => {
        window.pnpndMedia
            .getFrame()
            .find("#pnpnd-media-folder-filter")
            .val(
                active === "media_library"
                    ? "all"
                    : active === "account"
                    ? active_folder?.file_key || "pnpnd"
                    : "trash",
            )
            .trigger("change");

        if (active !== "account") {
            dispatch(addFolders([]));
        }
    }, [active]);

    const handleMenuClick = (id: string, file: File) => {
        PNPNDHelper.openUpgradePopUp();
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
