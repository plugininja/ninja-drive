import { Item, Menu } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import {
    Icon,
} from "~/ui/atoms";

const ModuleContextMenu = ({
    onMenuClick,
}: {
    onMenuClick: (key: string, id: string, title?: string) => void;
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

                    return (
                        <BlockStack key={key ?? index}>
                            <Item
                                className={className || ""}
                                onClick={() => {
                                    onMenuClick(key, props.id, props.title);
                                }}
                            >
                                <Icon
                                    name={icon}
                                    color={key === "delete" ? "error" : "black"}
                                    fontWeight="medium"
                                />

                                {title}

                            </Item>
                        </BlockStack>
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
