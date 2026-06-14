import { useEffect, useRef, useState } from "@wordpress/element";

const createBoxNode = () => {
    const box = document.createElement("div");
    box.style.position = "absolute";
    box.style.background = "var(--pnpnd-primary-light)";
    box.style.border = "1px dashed var(--pnpnd-primary)";
    box.style.pointerEvents = "none";
    box.style.mixBlendMode = "multiply";
    return box;
};

interface Coordinates {
    x: number;
    y: number;
}

export const useDragSelect = (
    selectContainerRef: React.RefObject<HTMLDivElement>,
    isFileSelecting: boolean,
) => {
    const boxRef = useRef<HTMLDivElement>(createBoxNode());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isControlPressed, setIsControlPressed] = useState(false);
    const drawAreaRef = useRef<{ start?: Coordinates; end?: Coordinates }>({});
    const hasStartedRef = useRef<boolean>(false);

    const drawSelectionBox = (start: Coordinates, end: Coordinates) => {
        const box = boxRef.current;
        if (!box) return;

        const left = Math.min(start.x, end.x);
        const top = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);

        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!drawAreaRef.current.start) return;

        const rect = containerRef.current?.getBoundingClientRect();
        const end = {
            x: e.clientX - (rect?.left || 0),
            y: e.clientY - (rect?.top || 0),
        };

        drawAreaRef.current.end = end;

        const dx = Math.abs(end.x - drawAreaRef.current.start.x);
        const dy = Math.abs(end.y - drawAreaRef.current.start.y);

        if (!hasStartedRef.current && (dx > 10 || dy > 10)) {
            hasStartedRef.current = true;
            document.body.style.userSelect = "none";
            if (
                containerRef.current &&
                !containerRef.current.contains(boxRef.current)
            ) {
                containerRef.current.appendChild(boxRef.current);
            }
        }

        if (hasStartedRef.current) {
            drawSelectionBox(drawAreaRef.current.start, end);
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (!isFileSelecting) return;
        e.stopPropagation();

        const target = e.target as HTMLElement;
        let container = target.closest(".pnpnd-files") as HTMLDivElement;

        if (container) {
            containerRef.current = container;

            const rect = container.getBoundingClientRect();

            drawAreaRef.current = {
                start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
                end: { x: e.clientX - rect.left, y: e.clientY - rect.top },
            };

            hasStartedRef.current = false;
            document.addEventListener("mousemove", handleMouseMove);
        }
    };

    const handleMouseUp = () => {
        document.body.style.userSelect = "initial";
        document.removeEventListener("mousemove", handleMouseMove);
        hasStartedRef.current = false;

        if (
            containerRef.current &&
            containerRef.current.contains(boxRef.current)
        ) {
            const boxRect = boxRef.current.getBoundingClientRect(); // ← Use directly here
            const items = containerRef.current.querySelectorAll("[data-key]");
            const newSelected: string[] = [];

            items.forEach((item) => {
                const id = item.getAttribute("data-key");
                const rect = item.getBoundingClientRect();

                if (
                    boxRect.left < rect.right &&
                    boxRect.right > rect.left &&
                    boxRect.top < rect.bottom &&
                    boxRect.bottom > rect.top
                ) {
                    if (id) newSelected.push(id);
                }
            });

            setSelectedItems(newSelected);
            containerRef.current.removeChild(boxRef.current);
        }

        drawAreaRef.current = {};
    };

    useEffect(() => {
        if (!isFileSelecting) return;

        const el = selectContainerRef.current;
        if (!el) return;

        el.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            el.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isFileSelecting, selectContainerRef.current]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                setIsControlPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.ctrlKey && !e.metaKey) {
                setIsControlPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return { selectedItems, isControlPressed };
};
