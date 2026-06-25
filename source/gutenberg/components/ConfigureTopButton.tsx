import { toBoolean } from "~kernel/utils/functions";
import { Icon } from "~/ui/atoms";
import clsx from "clsx";

const ConfigureTopButton = ({
    children,
    isPro = true,
    className = "",
    isOutSide = false,
}: {
    children: React.ReactNode;
    isPro?: boolean;
    className?: string;
    isOutSide?: boolean;
}) => {
    return (
        <div
            className={clsx(
                "pnpnd-top-level-wrapper pnpnd-block-icon-wrapper",
                className,
            )}
        >

            {children}
        </div>
    );
};

export default ConfigureTopButton;
