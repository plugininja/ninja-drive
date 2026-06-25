import { Item, Menu } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Icon } from "~/ui/atoms";

const CachedContext = ({
    onMenuClick,
}: {
    onMenuClick: (
        key: "delete",
        action?: "total" | "5xl" | "4xl" | "xl" | "lg" | "md",
    ) => void;
}) => {
    return (
        <Menu id="cached-file-menu">
            {({ props }) => {
                return CACHED_CONTEXT_MENU_ITEMS?.map(
                    ({ key, title, icon, className }, index) => {
                        return (
                            <Item
                                key={key ?? index}
                                className={className}
                                onClick={() => onMenuClick(key, props?.action)}
                            >
                                <Icon name={icon} color="error" />

                                {title}
                            </Item>
                        );
                    },
                );
            }}
        </Menu>
    );
};

export default CachedContext;

export const CACHED_CONTEXT_MENU_ITEMS: {
    key: "delete";
    title: string;
    icon: string;
    className?: string;
}[] = [
    {
        key: "delete",
        title: __("Delete", "ninja-drive"),
        icon: "delete",
        className: "destructive",
    },
];
