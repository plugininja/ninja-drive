import { MenuKey, Order, OrderBy } from "~/types/Types";
import { selectAuth } from "~/store/features/authSlice";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { FILES_MENUS } from "~/constants/fileBrowser";
import { useAppSelector } from "~/store/hooks";
import { useParams } from "react-router-dom";
import { FontSize } from "~/types/styles";
import Sidebar from "~/components/molecules/Sidebar";
import Storage from "~/components/molecules/Storage";
import FolderTree from "~/components/organisms/FolderTree";

const FileSidebar = ({
    openFolder,
    activeFolder,
    loading,
    sorting = { order: "ASC", orderBy: "name" },
}: {
    openFolder: (menuKey: string) => void;
    activeFolder: string;
    sorting?: {
        order: Order;
        orderBy: OrderBy;
    };
    loading: boolean;
}) => {
    const { activeAccount } = useAppSelector(selectAuth);
    const { menuKey } = useParams<{
        menuKey?: MenuKey;
    }>();

    return (
        <Sidebar localStorageKey={STORAGE_KEYS.fileBrowserSidebar}>
            <Sidebar.Menu>
                <Sidebar.DropdownItem
                    activeKey={menuKey}
                    childrenItems={[
                        ...(menuKey === "home"
                            ? [
                                  {
                                      key: "home",
                                      title: "Home",
                                      icon: "home",
                                      iconSize: "2xl" as FontSize,
                                      onClick: () => openFolder("home"),
                                  },
                              ]
                            : []),

                        ...FILES_MENUS.map((menu) => ({
                            key: menu.key,
                            title: menu.title,
                            svgIcon: menu.icon,
                            onClick: () => openFolder(menu.key),
                        })),
                    ]}
                />
            </Sidebar.Menu>

            {activeFolder !== "home" && (
                <FolderTree
                    openFolder={openFolder}
                    activeFolder={activeFolder}
                    sorting={sorting}
                    skip={loading || activeFolder === "home"}
                    className="pn-sidebar__fade"
                />
            )}

            <Sidebar.Bottom
                storage
                total={Number(activeAccount?.storage?.limit)}
                used={Number(activeAccount?.storage?.usage)}
            >
                <Storage
                    total={Number(activeAccount?.storage?.limit)}
                    used={Number(activeAccount?.storage?.usage)}
                />
                <Sidebar.HelpCenter />
            </Sidebar.Bottom>
        </Sidebar>
    );
};

export default FileSidebar;
