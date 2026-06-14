import { InfoProps } from "./Info.type";
import Tooltip from "../Tooltip";
import Icon from "../Icon";
import clsx from "clsx";

const Info = ({
    title = "info",
    style,
    className,
    color = "gray-700",
    fontSize = "md",
    fontWeight = "normal",
    placement = "top",
    arrow = true,
    arrowSize = 5,
    trigger = "hover",
    width = "auto",
    wrap = "max-width-wrap",
    maxWidth = "300px",
    textColor = "white",
    background = "gray-800",
    border,
    shadow = false,
    visible = true,
    disabled = false,
}: InfoProps) => {
    return (
        <Tooltip
            title={title}
            style={{ ...style, cursor: disabled ? "not-allowed" : "pointer" }}
            className={clsx("flex-center", className)}
            placement={placement}
            arrow={arrow}
            arrowSize={arrowSize}
            trigger={trigger}
            width={width}
            wrap={wrap}
            maxWidth={maxWidth}
            color={textColor}
            background={background}
            border={border}
            shadow={shadow}
            visible={visible}
            disabled={disabled}
        >
            <Icon
                name="info"
                color={color}
                fontSize={fontSize}
                fontWeight={fontWeight}
            />
        </Tooltip>
    );
};

export default Info;
