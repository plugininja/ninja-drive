import { BackgroundColor, BorderRadius } from "~kernel/types/styles";

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
    pro?: string[];
    active?: string;
    disabled?: boolean;
    onTabClick?: (key: string) => void;
}
