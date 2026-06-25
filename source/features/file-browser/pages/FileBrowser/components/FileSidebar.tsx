import { FILES_MENUS } from "~features/file-browser/constants/fileBrowser";
import FolderTree from "~/shared/file-views/components/FolderTree";
import { MenuKey, Order, OrderBy } from "~kernel/types/Types";
import { STORAGE_KEYS } from "~kernel/constants/storageKeys";
import { selectAuth } from "~features/auth/state/authSlice";
import { useAppSelector } from "~kernel/store/hooks";
import { FontSize } from "~kernel/types/styles";
import { useParams } from "react-router-dom";
import { Storage } from "~/ui/molecules";
import { Sidebar } from "~/ui/molecules";
import { Card } from "~/ui/molecules";

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
                storage={!!active_account}
                total={Number(active_account?.storage?.limit)}
                used={Number(active_account?.storage?.usage)}
            >
                {active_account && (
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
                )}

                <Sidebar.HelpCenter />
            </Sidebar.Bottom>
        </Sidebar>
    );
};

export default FileSidebar;
