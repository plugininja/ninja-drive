export interface DnDItemProps {
    id?: string;
    index?: number;
    order: number | string;
    children: React.ReactNode;
}

export interface DnDProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    children: React.ReactNode;
    onOrderChange?: (newOrder: (number | string)[]) => void;
    onMove?: (from: number | string, to: number | string) => void;
    isMove?: boolean;
}

export interface DnDContextType {
    draggingIndex: number | null;
    setDraggingIndex: (index: number | null) => void;
    hoverIndex: number | null;
    setHoverIndex: (index: number | null) => void;
    moveItem: (from: number, to: number) => void;
    isMove?: boolean;
    draggingOrder: number | string | null;
    setDraggingOrder: (order: number | string | null) => void;
    hoverOrder: number | string | null;
    setHoverOrder: (order: number | string | null) => void;
    moveItemByOrder: (from: number | string, to: number | string) => void;
}
