import FolderTree from "~/components/organisms/FolderTree";
import { MenuKey, Order, OrderBy } from "~/types/Types";
import { selectAuth } from "~/store/features/authSlice";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { FILES_MENUS } from "~/constants/fileBrowser";
import Storage from "~/components/molecules/Storage";
import Sidebar from "~/components/molecules/Sidebar";
import Card from "~/components/molecules/Card";
import { useAppSelector } from "~/store/hooks";
import { useParams } from "react-router-dom";
import { FontSize } from "~/types/styles";

const FileSidebar = ({
    openFolder,
    activeFolder,
    loading,
    sorting = { order: "ASC", order_by: "name" },
}: {
    openFolder: (menuKey: string) => void;
    activeFolder: string;
    sorting?: {
        order: Order;
        order_by: OrderBy;
    };
    loading: boolean;
}) => {
    const { active_account } = useAppSelector(selectAuth);
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
                            iconUrl: menu.icon,
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
                total={Number(active_account?.storage?.limit)}
                used={Number(active_account?.storage?.usage)}
            >
                <Card
                    padding={15}
                    background="white"
                    border="gray-200"
                    borderStyle="solid"
                >
                    <Storage
                        total={Number(active_account?.storage?.limit)}
                        used={Number(active_account?.storage?.usage)}
                    />
                </Card>

                <Sidebar.HelpCenter />
            </Sidebar.Bottom>
        </Sidebar>
    );
};

export default FileSidebar;
