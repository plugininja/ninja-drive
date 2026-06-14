import { BackgroundColor, BorderRadius } from "~/types/styles";

export interface TabsProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    background?: BackgroundColor;
    size?: "small" | "medium" | "large";
    rounded?: BorderRadius;
    tabRounded?: BorderRadius;
    tabs: {
        key: string;
        title: string;
        icon?: string;
    }[];
    active?: string;
    onTabClick?: (key: string) => void;
}
