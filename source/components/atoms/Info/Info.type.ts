import {
    BackgroundColor,
    BorderColor,
    FontSize,
    FontWeight,
    TextColor,
} from "~/types/styles";

export interface InfoProps {
    title?: string;
    style?: React.CSSProperties;
    className?: string;
    color?: TextColor;
    fontSize?: FontSize;
    fontWeight?: FontWeight;
    placement?: "top" | "bottom" | "left" | "right" | "auto";
    arrow?: boolean;
    arrowSize?: number;
    trigger?: "hover" | "click";
    width?: string;
    maxWidth?: string;
    wrap?: "wrap" | "no-wrap" | "max-width-wrap";
    textColor?: TextColor;
    background?: BackgroundColor;
    border?: BorderColor;
    shadow?: boolean;
    visible?: boolean;
    disabled?: boolean;
}
