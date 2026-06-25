import { IconButton, InlineStack } from "~/ui/molecules";
import { BorderStyle } from "~/kernel/types";
import { Input, Icon } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

type SearchBoxInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onClear?: () => void;
    inputStyle?: React.CSSProperties;
    size?: "small" | "medium" | "large";
    borderStyle?: BorderStyle;
};

const SearchBoxInput = ({
    value,
    onChange,
    placeholder = __("Search My Drive", "ninja-drive"),
    className,
    onClear,
    inputStyle,
    size = "small",
    borderStyle = "none",
}: SearchBoxInputProps) => {
    return (
        <InlineStack
            wrap={false}
            align="center"
            className={clsx("pn-search-box__input", className)}
        >
            <Input
                size={size}
                borderStyle={borderStyle}
                inputStyle={{ padding: 0, ...inputStyle }}
                className="flex-1"
                placeholder={placeholder}
                value={value}
                onChange={(val) => onChange(val as string)}
            />

            {value && value.length > 0 && (
                <IconButton
                    size="supersmall"
                    rounded="full"
                    name="close"
                    onClick={onClear}
                />
            )}

            <Icon name="search" fontSize="xl" />
        </InlineStack>
    );
};

export default SearchBoxInput;
