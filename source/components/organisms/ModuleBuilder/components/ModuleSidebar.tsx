import { useNavigate, useParams } from "react-router-dom";
import { getModuleMenuItems } from "~/constants/widget";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { ModuleKey } from "~/types/widget.types";
import { useAppSelector } from "~/store/hooks";
import Sidebar from "~/components/molecules/Sidebar";

const ModuleSidebar = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { widgetId, widgetMenu } = useParams();
    const navigate = useNavigate();

    const handleMenuClick = (menuId: string) => {
        navigate(`/widget-builder/${widgetId}/${menuId}`);
    };

    const menuItems = getModuleMenuItems(editData?.type as ModuleKey);

    const currentIndex = menuItems?.findIndex((menu) => menu?.key === widgetMenu);

    return (
        <Sidebar
            localStorageKey={STORAGE_KEYS?.widgetBuilderSidebar}
            defaultCollapsed
            style={{
                borderRadius: "10px 0 0 10px",
                zIndex: 9999,
            }}
        >
            <Sidebar.ModuleMenu
                style={{
                    marginBottom: "30px",
                }}
            >
                {menuItems?.map((menu, index) => (
                    <Sidebar.ModuleItem
                        key={menu?.key}
                        title={menu?.title}
                        icon={menu?.icon}
                        active={index <= currentIndex}
                        connectorActive={index < currentIndex}
                        onClick={() => handleMenuClick(menu?.key)}
                    />
                ))}
            </Sidebar.ModuleMenu>

            <Sidebar.Bottom helpCenter={false} />
        </Sidebar>
    );
};

export default ModuleSidebar;
