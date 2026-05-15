export interface PageContainerProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    gap?: number | string;
    title?: string;
    description?: string;
    docLink?: string;
    widget?: boolean;
    children: React.ReactNode;
}
