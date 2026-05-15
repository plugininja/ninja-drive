import { SkeletonLoaderProps } from "./SkeletonLoader.type";
import type { CSSProperties } from "react";
import clsx from "clsx";

const SkeletonLoader = ({
    id,
    style,
    className,
    width,
    height,
    animationSpeed = 1.5,
    rounded = "md",
}: SkeletonLoaderProps) => {
    const combinedStyle: CSSProperties = {
        width,
        height,
        ...style,
        "--pnpnd-skl-animation-speed": `${animationSpeed}s`,
    } as CSSProperties;

    const classes = clsx(
        "pnpnd-skeleton-loader",
        "pnpnd-skeleton-loader--loading",
        `rounded-${rounded}`,
        className,
    );

    return <div id={id} style={combinedStyle} className={classes} />;
};

export default SkeletonLoader;
