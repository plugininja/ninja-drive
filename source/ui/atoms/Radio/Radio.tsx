import type { RadioProps } from "./Radio.type";
import { Text } from "~/ui/atoms";
import clsx from "clsx";

const Radio: React.FC<RadioProps> = ({
    id = "",
    variant = "dot",
    style,
    className = "",
    checked,
    title,
    tabIndex,
    ariaLabel,
    loading = false,
    disabled,
    onChange,
}) => {
    const handleChange = () => {
        if (disabled || loading) return;

        onChange?.(!checked);
    };

    return (
        <div
            id={id}
            style={{
                ...style,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                userSelect: "none",
            }}
            tabIndex={tabIndex}
            aria-label={ariaLabel}
            className={clsx(
                "pn-radio",
                `pn-radio--${variant}`,
                disabled && "pn-radio--disabled",
                className,
            )}
        >
            <div
                className={clsx(
                    "pn-radio__ring",
                    checked && "pn-radio__ring--active",
                    loading && "pn-radio__ring--loading",
                )}
                onClick={handleChange}
            >
                {variant === "dot" && <div className="pn-radio__dot" />}

                {variant === "check" && (
                    <svg
                        className="pn-radio__check"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 6L5 9L10 3.5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>

            {title && (
                <Text
                    color={checked ? "primary" : "gray-700"}
                    size="sm"
                    textTransform="capitalize"
                    style={{
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                    onClick={handleChange}
                >
                    {title}
                </Text>
            )}
        </div>
    );
};

export default Radio;
