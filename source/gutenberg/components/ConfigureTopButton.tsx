import Icon from "~/components/atoms/Icon";

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
            className={`pnpnd-top-level-wrapper pnpnd-block-icon-wrapper ${className}`}
        >
            {children}
        </div>
    );
};

export default ConfigureTopButton;
