import { cloneElement, isValidElement } from "@wordpress/element";
import InlineStack from "~/components/molecules/InlineStack";
import type { TopbarProps } from "./Topbar.type";
import { isValidArray } from "~/utils/helpers";
import clsx from "clsx";

const Topbar = ({
    id,
    style,
    top,
    zIndex = 9999,
    className = "",
    border = true,
    wrap = true,
    padding = 20,
    leftContents = [],
    rightContents = [],
    children,
    leftContentsClassName = "flex-1",
}: TopbarProps) => {
    const renderContent = (item: React.ReactNode, index: number) => {
        if (!isValidElement(item)) return null;

        return cloneElement(item, {
            key: item.key ?? index,
        });
    };

    return (
        <InlineStack
            id={id}
            gap={10}
            align="between"
            wrap={wrap}
            style={{
                ...style,
                padding,
                top,
                zIndex,
            }}
            className={clsx(
                "pn-topbar",
                border && "pn-topbar--border",
                className,
            )}
        >
            {isValidArray(leftContents) && (
                <InlineStack gap={10} className={leftContentsClassName}>
                    {leftContents.map(renderContent)}
                </InlineStack>
            )}

            {children}

            {isValidArray(rightContents) && (
                <InlineStack gap={10}>
                    {rightContents.map(renderContent)}
                </InlineStack>
            )}
        </InlineStack>
    );
};

export default Topbar;
