import { useLayoutEffect, useState } from "@wordpress/element";
import { PopoverProps } from "./Popover.type";
import clsx from "clsx";
import { Icon } from "~/ui/atoms";

const Popover = ({
    id,
    style,
    className,
    content,
    trigger = "always",
    position = "right-center",
    arrowPosition = "left-center",
}: PopoverProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useLayoutEffect(() => {
        setIsOpen(trigger === "always");
    }, [trigger]);

    return (
        <div
            id={id}
            style={style}
            className={clsx("pnpnd-popover", position, className)}
        >
            <div
                className="pnpnd-popover-dot"
                onMouseEnter={() => trigger === "hover" && setIsOpen(true)}
                onMouseLeave={() => trigger === "hover" && setIsOpen(false)}
                onClick={() => setIsOpen(() => !isOpen)}
            />

            <div
                className={clsx(
                    "pnpnd-popover-content",
                    `pnpnd-arrow-${arrowPosition}`,
                    {
                        "pnpnd-popover-visible": isOpen,
                    },
                )}
            >
                <Icon
                    name="close"
                    color="gray-400"
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        zIndex: 3,
                        cursor: "pointer",
                    }}
                    onClick={() => setIsOpen(false)}
                />

                {content}
            </div>
        </div>
    );
};

export default Popover;
