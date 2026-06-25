import { DnDContextType, DnDItemProps, DnDProps } from "./DnD.type";
import clsx from "clsx";
import {
    createContext,
    useContext,
    useState,
    Children,
    isValidElement,
    cloneElement,
    useEffect,
} from "@wordpress/element";

const DnDContext = createContext<DnDContextType | undefined>(undefined);

const useDnD = () => {
    const context = useContext(DnDContext);
    if (!context) throw new Error("DnD context missing");
    return context;
};

const DnD = ({
    id,
    style,
    className,
    children,
    onOrderChange,
    onMove,
    isMove = false,
}: DnDProps) => {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [orderedChildren, setOrderedChildren] = useState<
        React.ReactElement<DnDItemProps>[]
    >([]);

    const [draggingOrder, setDraggingOrder] = useState<number | string | null>(
        null,
    );
    const [hoverOrder, setHoverOrder] = useState<number | string | null>(null);

    useEffect(() => {
        const validChildren = Children.toArray(children).filter(
            isValidElement,
        ) as React.ReactElement<DnDItemProps>[];
        setOrderedChildren(validChildren);
    }, [children]);

    const moveItem = (from: number, to: number) => {
        setOrderedChildren((prev) => {
            const next = [...prev];
            const item = next.splice(from, 1)[0];
            next.splice(to, 0, item);
            onOrderChange?.(next.map((c) => c.props.order));
            return next;
        });
    };

    const moveItemByOrder = (
        fromOrder: number | string,
        toOrder: number | string,
    ) => {
        if (isMove) {
            onMove?.(fromOrder, toOrder);
            document.getElementById(fromOrder.toString())?.remove();
        }
    };

    return (
        <DnDContext.Provider
            value={{
                draggingIndex,
                setDraggingIndex,
                hoverIndex,
                setHoverIndex,
                moveItem,
                isMove,
                draggingOrder,
                setDraggingOrder,
                hoverOrder,
                setHoverOrder,
                moveItemByOrder,
            }}
        >
            <div id={id} style={style} className={clsx("pn-dnd", className)}>
                {isMove
                    ? children
                    : orderedChildren.map((child, index) =>
                          cloneElement(child, {
                              index,
                              key: child.key ?? index,
                          }),
                      )}
            </div>
        </DnDContext.Provider>
    );
};

DnD.Item = ({
    children,
    index,
    id,
    order,
}: DnDItemProps & { index?: number }) => {
    const context = useDnD();

    if (!context) {
        return <div className="pn-dnd-item">{children}</div>;
    }

    const {
        draggingIndex,
        setDraggingIndex,
        hoverIndex,
        setHoverIndex,
        moveItem,
        isMove,
        draggingOrder,
        setDraggingOrder,
        hoverOrder,
        setHoverOrder,
        moveItemByOrder,
    } = context;

    if (isMove) {
        const isHovering = hoverOrder === order && draggingOrder !== order;

        return (
            <div
                id={id}
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggingOrder(order);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoverOrder(order);
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    setHoverOrder(null);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggingOrder !== null && draggingOrder !== order) {
                        moveItemByOrder(draggingOrder, order);
                    }
                    setDraggingOrder(null);
                    setHoverOrder(null);
                }}
                onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggingOrder(null);
                    setHoverOrder(null);
                }}
                className={clsx("pn-dnd-item", {
                    "pn-dnd-item--hovering": isHovering,
                    "pn-dnd-item--dragging": draggingOrder === order,
                })}
            >
                {children}
            </div>
        );
    }

    const isHovering =
        index !== undefined && hoverIndex === index && draggingIndex !== index;

    return (
        <div
            id={id}
            draggable
            onDragStart={() => {
                if (index !== undefined) setDraggingIndex(index);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                if (index !== undefined) setHoverIndex(index);
            }}
            onDragLeave={() => setHoverIndex(null)}
            onDrop={() => {
                if (
                    index !== undefined &&
                    draggingIndex !== null &&
                    draggingIndex !== index
                ) {
                    moveItem(draggingIndex, index);
                }
                setDraggingIndex(null);
                setHoverIndex(null);
            }}
            onDragEnd={() => {
                setDraggingIndex(null);
                setHoverIndex(null);
            }}
            className={clsx("pn-dnd-item", {
                "pn-dnd-item--hovering": isHovering,
            })}
        >
            {children}
        </div>
    );
};

export default DnD;
