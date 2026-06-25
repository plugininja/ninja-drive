import { ProgressBarProps } from "./ProgressBar.type";
import clsx from "clsx";

const ProgressBar = ({
    id,
    style,
    className = "",
    progress,
    height = 8,
    background = "secondary",
    fillColor = "primary",
}: ProgressBarProps) => {
    const progressBarStyle: React.CSSProperties = {
        height,
        ...style,
    };

    return (
        <div
            id={id}
            style={progressBarStyle}
            className={clsx("pn-progress-bar", `bg-${background}`, className)}
        >
            <div
                style={{ width: `${progress}%` }}
                className={clsx("pn-progress-bar__fill", `bg-${fillColor}`)}
            />
        </div>
    );
};

export default ProgressBar;
