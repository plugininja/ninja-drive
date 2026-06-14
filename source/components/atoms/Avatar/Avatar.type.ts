import { BackgroundColor, BorderRadius } from "~/types/styles";

export interface AvatarProps {
    id?: string;
    useKey?: boolean;
    style?: React.CSSProperties;
    className?: string;
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    compact?: boolean;
    rounded?: BorderRadius;
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
    fallback?: string | React.ReactNode;
    fallBackLimit?: number;
    fallBackBg?: BackgroundColor;
    userSelect?: boolean;
    showSpinner?: boolean;
    customSpinner?: React.ReactNode;
    spinnerColor?: string;
    spinnerSize?: number | string;
}
