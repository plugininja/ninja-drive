import { useEffect } from "@wordpress/element";

type UseOutsideClickProps<T extends HTMLElement> = {
    ref: React.RefObject<T>;
    handler: () => void;
    enabled?: boolean; // optional
};

const useOutsideClick = <T extends HTMLElement>({
    ref,
    handler,
    enabled = true,
}: UseOutsideClickProps<T>) => {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref?.current;

            if (!el || el.contains(event.target as Node)) {
                return;
            }

            handler();
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, enabled]);
};

export default useOutsideClick;
