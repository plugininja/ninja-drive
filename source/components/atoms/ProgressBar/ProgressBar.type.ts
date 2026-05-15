import { BackgroundColor, TextColor } from "~/types/styles";

export interface ProgressBarProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    progress: number;
    height?: number | string;
    background?: BackgroundColor;
    fillColor?: TextColor;
}
