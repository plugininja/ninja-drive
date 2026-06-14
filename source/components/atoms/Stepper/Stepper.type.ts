export interface StepItem {
    key: string;
    title: string;
}

export interface StepperProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    steps: StepItem[];
    active: string;
    onStepperClick?: (key: string) => void;
    hideLabels?: boolean;
}
