import { InlineStack } from "~/ui/molecules";
import { CheckboxProps } from "./Checkbox.type";
import clsx from "clsx";
import { Text, Status } from "~/ui/atoms";

const Checkbox = ({
    id,
    name,
    style,
    className = "",
    checked,
    defaultChecked = false,
    size = "medium",
    rounded = "xs",
    title,
    tabIndex,
    ariaLabel,
    readonly,
    visible = true,
    disabled = false,
    isPro = false,
    onChange,
}: CheckboxProps) => {
    const classes = clsx(
        "pn-checkbox",
        `pn-checkbox--${size}`,
        `rounded-${rounded}`,
        disabled && "pn-checkbox--disabled",
    );

    const handleCheck = (checked: boolean) => {
        if (readonly) return;
        onChange && onChange(checked);
    };

    if (!visible) return null;

    return (
        <InlineStack
            gap={10}
            style={{
                opacity: disabled ? "0.6" : "1",
            }}
            className={className}
        >
            <label
                title={title}
                style={style}
                className={classes}
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    id={id}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    className="pn-checkbox__input"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange && handleCheck(e.target.checked)}
                    tabIndex={tabIndex}
                    aria-label={ariaLabel}
                    aria-readonly={readonly || undefined}
                    readOnly={readonly}
                    disabled={disabled}
                />
                <span className="pn-checkbox__box" />
            </label>

            {title &&
                (isPro ? (
                    <InlineStack gap={10} wrap={false}>
                        <Text
                            color="gray-700"
                            size="sm"
                            style={{
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                            onClick={() => handleCheck(!checked)}
                        >
                            {title}
                        </Text>

                        <Status.Pro />
                    </InlineStack>
                ) : (
                    <Text
                        color="gray-700"
                        size="sm"
                        style={{
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                        onClick={() => handleCheck(!checked)}
                    >
                        {title}
                    </Text>
                ))}
        </InlineStack>
    );
};

export default Checkbox;
