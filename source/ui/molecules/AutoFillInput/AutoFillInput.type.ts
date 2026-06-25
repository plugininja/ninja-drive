import { BackgroundColor } from "~kernel/types/styles";

export type SeparatorType = "hyphen" | "underscore" | "space" | "comma";

export interface AutoFillIInputOption {
    name: string;
    value: string;
    example?: string;
}

export interface AutoFillIInputOptionsCard {
    title?: React.ReactNode;
    background?: BackgroundColor;
    options: AutoFillIInputOption[];
    checkbox?: boolean;
    flex?: boolean;
    disabled?: boolean;
}

export interface AutoFillInputProps {
    max?: number;
    separators?: boolean;
    defaultSeparator?: "hyphen" | "underscore" | "space" | "comma";
    limitedSeparators?: ("hyphen" | "underscore" | "space" | "comma")[];
    example?: boolean;
    background?: BackgroundColor;
    value?: string;
    onChange?: (value: string) => void;
    children?: React.ReactNode;
}

export interface AutoFillInputContextType {
    max: number;
    setAllOptions: React.Dispatch<React.SetStateAction<AutoFillIInputOption[]>>;
    selectedOptions: AutoFillIInputOption[];
    toggleOption: (option: AutoFillIInputOption, disabled?: boolean) => void;
}
