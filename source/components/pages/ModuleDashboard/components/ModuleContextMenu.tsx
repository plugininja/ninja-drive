import { Item, Menu, Separator } from "~/components/molecules/ContextMenu";
import Status from "~/components/atoms/Status";
import { __ } from "@wordpress/i18n";
import Icon from "~/components/atoms/Icon";

const ModuleContextMenu = ({
    onMenuClick,
    isPro = false,
}: {
    onMenuClick: (key: string, id: string, title?: string) => void;
    isPro?: boolean;
}) => {
    return (
        <Menu
            id="widget-menu"
            style={{
                minWidth: "150px",
                maxWidth: "150px",
            }}
        >
            {({ props }) =>
                MODULE_ACTIONS.map(({ key, title, icon, className }, index) => {
                    const lastItem = index === MODULE_ACTIONS.length - 1;

                    return (
                        <Status
                            isPro={key === "delete" ? false : isPro}
                            size="extrasmall"
                            top={3}
                            right={3}
                        >
                            <Item
                                className={className || ""}
                                onClick={() =>
                                    onMenuClick(key, props.id, props.title)
                                }
                            >
                                <Icon
                                    name={icon}
                                    color={key === "delete" ? "error" : "black"}
                                    fontWeight="medium"
                                />

                                {title}
                            </Item>

                            {!lastItem && <Separator />}
                        </Status>
                    );
                })
            }
        </Menu>
    );
};

export default ModuleContextMenu;

export const MODULE_ACTIONS = [
    {
        key: "edit",
        title: __("Edit", "ninja-drive"),
        icon: "edit_square",
    },
    {
        key: "rename",
        title: __("Rename", "ninja-drive"),
        icon: "edit",
    },
    {
        key: "preview",
        title: __("Preview", "ninja-drive"),
        icon: "visibility",
    },
    {
        key: "duplicate",
        title: __("Duplicate", "ninja-drive"),
        icon: "control_point_duplicate",
    },
    {
        key: "delete",
        title: __("Delete", "ninja-drive"),
        icon: "delete",
        className: "destructive",
    },
];
