import { BorderRadius } from "~/types/styles";

export interface SkeletonLoaderProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    width?: string;
    height: string;
    animationSpeed?: number;
    rounded?: BorderRadius;
}
