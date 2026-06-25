export interface RadioProps {
    id?: string;
    variant?: "dot" | "check";
    style?: React.CSSProperties;
    className?: string;
    checked?: boolean;
    title?: string;
    tabIndex?: number;
    ariaLabel?: string;
    loading?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
}
