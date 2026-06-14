import BlockStack from "~/components/molecules/BlockStack";
import Checkbox from "~/components/atoms/Checkbox";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import InlineStack from "../InlineStack";
import { __ } from "@wordpress/i18n";
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "@wordpress/element";
import {
    AutoFillIInputOption,
    AutoFillIInputOptionsCard,
    AutoFillInputContextType,
    AutoFillInputProps,
    SeparatorType,
} from "./AutoFillInput.type";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const AutoFillInputContext = createContext<
    AutoFillInputContextType | undefined
>(undefined);

const useAutoFillInput = () => {
    const context = useContext(AutoFillInputContext);

    if (!context) throw new Error("AutoFillInput context missing");

    return context;
};

const separatorCharMap: Record<SeparatorType, string> = {
    hyphen: "-",
    underscore: "_",
    space: " ",
    comma: ",",
};

const separatorsUI = [
    { value: "hyphen", icon: "remove" },
    { value: "underscore", icon: "minimize" },
    { value: "space", icon: "space_bar" },
    { value: "comma", icon: "," },
];

const charToSeparatorMap: Record<string, SeparatorType> = {
    "-": "hyphen",
    _: "underscore",
    " ": "space",
    ",": "comma",
};

const AutoFillInput = ({
    max = 5,
    separators = true,
    defaultSeparator = "comma",
    limitedSeparators = ["hyphen", "underscore", "space", "comma"],
    example = true,
    background = "white",
    value = "",
    onChange,
    children,
}: AutoFillInputProps) => {
    const [allOptions, setAllOptions] = useState<AutoFillIInputOption[]>([]);
    const [inputValue, setInputValue] = useState<string>(value);
    const [selectedOptions, setSelectedOptions] = useState<
        AutoFillIInputOption[]
    >([]);
    const [separator, setSeparator] = useState<SeparatorType>(defaultSeparator);
    const [exampleValue, setExampleValue] = useState<string>("");

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (inputValue !== value) {
            onChange?.(inputValue);
        }
    }, [inputValue, value, onChange]);

    useEffect(() => {
        if (!inputValue || !allOptions?.length) {
            setSelectedOptions([]);
            return;
        }

        const detectedOptions = allOptions
            ?.filter((option) => inputValue?.includes(option?.value))
            ?.slice(0, max);

        setSelectedOptions(detectedOptions);
    }, [inputValue, allOptions, max]);

    useEffect(() => {
        if (!inputValue || !selectedOptions.length) return;

        const allSeparators = Object.values(separatorCharMap).join("");

        for (const option of selectedOptions) {
            const escapedValue = escapeRegex(option.value);

            const regex = new RegExp(`([${allSeparators}])${escapedValue}`);

            const match = inputValue.match(regex);

            if (match && match[1]) {
                const detectedChar = match[1];
                const detectedSeparator = charToSeparatorMap[detectedChar];

                if (detectedSeparator && detectedSeparator !== separator) {
                    setSeparator(detectedSeparator);
                }
                break;
            }
        }
    }, [inputValue, selectedOptions, separator]);

    useEffect(() => {
        if (!selectedOptions.length) {
            setExampleValue("");
            return;
        }

        const example = generateExampleFromSelected(selectedOptions, separator);

        setExampleValue(example);
    }, [selectedOptions, separator]);

    const toggleOption = (option: AutoFillIInputOption) => {
        setInputValue((prev) =>
            applyOptionToValue(prev, option?.value, separator),
        );
    };

    const applyOptionToValue = (
        prev: string,
        optionValue: string,
        separator: SeparatorType,
    ) => {
        const activeSeparator = separatorCharMap[separator];
        const allSeparators = Object.values(separatorCharMap).join("");

        if (!prev) return optionValue;

        if (prev?.includes(optionValue)) {
            const escapedValue = escapeRegex(optionValue);
            const regex = new RegExp(`([${allSeparators}])?${escapedValue}`);
            return prev?.replace(regex, "");
        }

        const lastChar = prev[prev?.length - 1];
        const needsSep = lastChar && !allSeparators?.includes(lastChar);

        return prev + (needsSep ? activeSeparator : "") + optionValue;
    };

    const replaceSeparatorBeforeSelectedOptions = (
        value: string,
        selectedOptions: AutoFillIInputOption[],
        newSeparator: SeparatorType,
    ) => {
        if (!value || !selectedOptions?.length) return value;

        const allSeparators = Object.values(separatorCharMap).join("");
        const newSepChar = separatorCharMap[newSeparator];

        let updatedValue = value;

        selectedOptions.forEach((option) => {
            const optionValue = option.value;
            const escapedValue = escapeRegex(optionValue);

            const regex = new RegExp(
                `([${allSeparators}])(${escapedValue})`,
                "g",
            );

            updatedValue = updatedValue.replace(regex, `${newSepChar}$2`);
        });

        return updatedValue;
    };

    const handleSeparatorChange = (newSeparator: SeparatorType) => {
        setSeparator(newSeparator);

        setInputValue((prev) =>
            replaceSeparatorBeforeSelectedOptions(
                prev,
                selectedOptions,
                newSeparator,
            ),
        );
    };

    const generateExampleFromSelected = (
        options: AutoFillIInputOption[],
        separator: SeparatorType,
    ) => {
        const sep = separatorCharMap[separator];

        return options
            .map((o) => o?.example)
            .filter(Boolean)
            .join(sep);
    };

    return (
        <AutoFillInputContext.Provider
            value={{
                max,
                setAllOptions,
                selectedOptions,
                toggleOption,
            }}
        >
            <BlockStack gap={20}>
                {example && (
                    <Input
                        value={inputValue}
                        helperText={
                            example
                                ? `${__(
                                      "e.g:",
                                      "ninja-drive",
                                  )} ${exampleValue}${__(
                                      ".txt",
                                      "ninja-drive",
                                  )}`
                                : ""
                        }
                        onChange={(v) => setInputValue(String(v))}
                    />
                )}

                {separators && (
                    <BlockStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Separators", "ninja-drive")}
                        </Text>

                        <Card
                            flex
                            align="center"
                            gap={8}
                            padding={10}
                            background={background}
                            rounded="md"
                            border="secondary"
                            borderStyle="dashed"
                            style={{ width: "fit-content" }}
                        >
                            {separatorsUI
                                ?.filter(
                                    (s) =>
                                        limitedSeparators?.includes(
                                            s?.value as SeparatorType,
                                        ),
                                )
                                ?.map(({ value, icon }) => (
                                    <Button
                                        key={value}
                                        variant={
                                            separator === value
                                                ? "primary"
                                                : "outlined"
                                        }
                                        size="small"
                                        startIcon={icon}
                                        onClick={() =>
                                            handleSeparatorChange(
                                                value as SeparatorType,
                                            )
                                        }
                                    />
                                ))}
                        </Card>
                    </BlockStack>
                )}

                <BlockStack gap={30}>{children}</BlockStack>
            </BlockStack>
        </AutoFillInputContext.Provider>
    );
};

AutoFillInput.Options = ({
    title,
    background = "white",
    options,
    checkbox = false,
    flex = false,
    disabled = false,
}: AutoFillIInputOptionsCard) => {
    const { max, setAllOptions, selectedOptions, toggleOption } =
        useAutoFillInput();

    useEffect(() => {
        if (disabled) return;

        setAllOptions((prev = []) => {
            const existingValues = new Set(prev?.map((o) => o?.value));

            const newOptions = options?.filter(
                (o) => !existingValues?.has(o?.value),
            );

            return [...prev, ...newOptions];
        });
    }, [options]);

    const Component = flex ? InlineStack : BlockStack;

    if (checkbox) {
        return (
            <Component gap={15} blockAlign="center">
                {title && title}

                {options?.map((option, index) => {
                    const isSelected = selectedOptions?.some(
                        (o) => o?.value === option?.value,
                    );

                    const isDisabled =
                        disabled ||
                        (!isSelected && selectedOptions?.length >= max);
                    return (
                        <Checkbox
                            key={option?.value ?? index}
                            title={option?.name}
                            rounded="sm"
                            checked={isSelected}
                            onChange={() => toggleOption(option)}
                            disabled={isDisabled}
                        />
                    );
                })}
            </Component>
        );
    }

    return (
        <BlockStack gap={10}>
            {title && title}

            <Card
                flex
                align="start"
                wrap
                gap={8}
                padding={10}
                background={background}
                rounded="md"
                border="secondary"
                borderStyle="dashed"
                style={{ width: "fit-content" }}
            >
                {options?.map((option, index) => {
                    const isSelected = selectedOptions?.some(
                        (o) => o?.value === option?.value,
                    );

                    const isDisabled =
                        disabled ||
                        (!isSelected && selectedOptions?.length >= max);

                    return (
                        <Button
                            key={option?.value ?? index}
                            variant={isSelected ? "primary" : "outlined"}
                            size="small"
                            textTransform="none"
                            disabled={isDisabled}
                            onClick={() => {
                                if (isDisabled) return;
                                toggleOption(option);
                            }}
                        >
                            {option?.name}
                        </Button>
                    );
                })}
            </Card>
        </BlockStack>
    );
};

export default AutoFillInput;
