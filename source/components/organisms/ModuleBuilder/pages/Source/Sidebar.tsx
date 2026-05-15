import { MenuKey, Order, OrderBy } from "~/types/Types";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { FILES_MENUS } from "~/constants/fileBrowser";
import { useParams } from "react-router-dom";
import Sidebar from "~/components/molecules/Sidebar";
import { FontSize } from "~/types/styles";
import FolderTree from "~/components/organisms/FolderTree";

const FileSidebar = ({
    style,
    className,
    border = true,
    openFolder,
    activeFolder,
    sorting = { order: "ASC", orderBy: "name" },
    loading,
}: {
    style?: React.CSSProperties;
    className?: string;
    border?: boolean;
    activeFolder: string;
    sorting?: {
        order: Order;
        orderBy: OrderBy;
    };
    loading: boolean;
    openFolder: (menuKey: string) => void;
}) => {
    const { menuKey } = useParams<{
        menuKey?: MenuKey;
    }>();

    return (
        <Sidebar
            style={style}
            className={className}
            border={border}
            defaultCollapsed
            localStorageKey={STORAGE_KEYS?.widgetFileSidebar}
        >
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
                            key: menu?.key,
                            title: menu?.title,
                            svgIcon: menu?.icon,
                            onClick: () => openFolder(menu?.key),
                        })),
                    ]}
                />
            </Sidebar.Menu>

            <FolderTree
                openFolder={openFolder}
                activeFolder={activeFolder}
                sorting={sorting}
                skip={loading}
                style={{ maxHeight: "750px" }}
                className="pn-sidebar__fade"
            />
        </Sidebar>
    );
};

export default FileSidebar;
