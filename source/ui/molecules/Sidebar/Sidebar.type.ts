import { ButtonVariant } from "../IconButton/IconButton.type";
import { StatusProps } from "~/ui/atoms/Status/Status.type";
import {
    BackgroundColor,
    BorderColor,
    BorderRadius,
    BorderStyle,
    FontSize,
} from "~kernel/types/styles";

export interface SidebarContextType {
    collapsed: boolean;
}

export interface SidebarProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    border?: boolean;
    children: React.ReactNode;
    defaultCollapsed?: boolean;
    localStorageKey?: string;
}

export interface SidebarMenuProps {
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export interface SidebarItemProps {
    key?: string;
    title: React.ReactNode;
    icon?: string;
    iconUrl?: string;
    iconSize?: FontSize;
    active?: boolean;
    background?: BackgroundColor;
    border?: BorderColor;
    borderStyle?: BorderStyle;
    size?: "small" | "large";
    rounded?: BorderRadius;
    iconButtonVariant?: ButtonVariant;
    iconRounded?: BorderRadius;
    iconBorderColor?: BorderColor;
    iconBorderStyle?: BorderStyle;
    connectorActive?: boolean;
    statusProps?: StatusProps;
    isDropdown?: boolean;
    onClick?: () => void;
}

export interface SidebarDropdownItemProps {
    childrenItems?: SidebarItemProps[];
    activeKey?: string;
    disabled?: boolean;
}

export interface SidebarBottomProps {
    children?: React.ReactNode;
    helpCenter?: boolean;
    storage?: boolean;
    total?: number;
    used?: number;
}

export interface StorageInfo {
    used: number;
    all: number;
}
