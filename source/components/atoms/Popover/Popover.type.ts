export type PopoverPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "right-top"
    | "right-center"
    | "right-bottom"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "left-top"
    | "left-center"
    | "left-bottom";

export interface PopoverProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    content: React.ReactNode;
    trigger?: "hover" | "click" | "always";
    position?: PopoverPosition;
    arrowPosition?: PopoverPosition;
}
