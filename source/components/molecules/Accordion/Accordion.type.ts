import type { BorderRadius } from "~/types/styles";

export interface AccordionProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    rounded?: BorderRadius;
    defaultOpen?: boolean;
    disabled?: boolean;
    single?: boolean;
    children?: React.ReactNode;
}

export interface AccordionGroupItem {
    id: string;
    title?: React.ReactNode;
    content?: React.ReactNode;
    disabled?: boolean;
}

export interface AccordionGroupProps {
    items: AccordionGroupItem[];
    allowMultiple?: boolean;
}
