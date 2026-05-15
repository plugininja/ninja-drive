export type NoteProps = {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    type?: "info" | "warning" | "error";
    children?: React.ReactNode;
};

export type ListProps = {
    children?: React.ReactNode;
};

export type TitleProps = {
    title?: string;
};

export type TextProps = {
    children?: React.ReactNode;
};

export type LinkProps = {
    url?: string;
    children?: React.ReactNode;
};
