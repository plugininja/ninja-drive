import { FILES_MENUS } from "~features/file-browser/constants/fileBrowser";
import FolderTree from "~/shared/file-views/components/FolderTree";
import { MenuKey, Order, OrderBy } from "~kernel/types/Types";
import { STORAGE_KEYS } from "~kernel/constants/storageKeys";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { FontSize } from "~kernel/types/styles";
import { useParams } from "react-router-dom";
import { Sidebar } from "~/ui/molecules";

const FileSidebar = ({
    style,
    className,
    border = true,
    openFolder,
    activeFolder,
    sorting = { order: "ASC", order_by: "name" },
    loading,
}: {
    style?: React.CSSProperties;
    className?: string;
    border?: boolean;
    activeFolder: string;
    sorting?: {
        order: Order;
        order_by: OrderBy;
    };
    loading: boolean;
    openFolder: (menuKey: string) => void;
}) => {
    const { menuKey } = useParams<{
        menuKey?: MenuKey;
    }>();

    const [collapsed] = useLocalStorage<boolean>(
        STORAGE_KEYS?.widgetFileSidebar,
        true,
    );

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
                            iconUrl: menu?.icon,
                            onClick: () => openFolder(menu?.key),
                        })),
                    ]}
                />
            </Sidebar.Menu>

            <FolderTree
                openFolder={openFolder}
                activeFolder={activeFolder}
                sorting={sorting}
                skip={loading || collapsed}
                style={{ maxHeight: "750px" }}
                className="pn-sidebar__fade"
            />
        </Sidebar>
    );
};

export default FileSidebar;
