import { useCallback, useEffect, useRef, useState } from "@wordpress/element";
import { useLocalStorage } from "~/kernel/hooks";
import { IconButton } from "~/ui/molecules";
import clsx from "clsx";

const COLLAPSED_WIDTH = 15;
const DEFAULT_WIDTH = 300;
const MAX_WIDTH = 1000;

const MediaSidebar = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useLocalStorage<boolean>(
        "pnpnd-media-library-sidebar-collapsed",
        false,
    );
    const [width, setWidth] = useLocalStorage<number>(
        "pnpnd-media-library-sidebar-width",
        Number(DEFAULT_WIDTH),
    );
    const [isResizing, setIsResizing] = useState(false);
    const [initialDone, setInitialDone] = useState(false);
    const isFirstRender = useRef(true);

    const targetWidth = collapsed ? COLLAPSED_WIDTH : width;

    const applyLayout = (w: number, withTransition: boolean) => {
        const content = document.getElementById("wpbody-content");
        const wrapper = document.getElementById(
            "pnpnd-media-library-sidebar-wrapper",
        );

        if (!wrapper) return;

        wrapper.style.borderRight = "1px solid #ddd";

        if (pnpnd.pagenow !== "upload.php") {
            wrapper.style.transition = withTransition
                ? "width 0.3s ease"
                : "none";
            wrapper.style.width = `${w}px`;

            const classes = [
                "media-frame-title",
                "media-frame-content",
                "media-frame-router",
                "media-frame-toolbar",
            ];

            classes.forEach((className) => {
                const elements = document.getElementsByClassName(className);

                Array.from(elements).forEach((element) => {
                    (element as HTMLElement).style.left = `${w}px`;
                    (
                        element as HTMLElement
                    ).style.width = `calc(100% - ${w}px)`;
                    (element as HTMLElement).style.transition = withTransition
                        ? "left 0.3s ease, width 0.3s ease"
                        : "none";
                });
            });

            return;
        }

        if (!content) return;

        content.style.transition = withTransition
            ? "width 0.3s ease, margin-left 0.3s ease"
            : "none";
        wrapper.style.transition = withTransition ? "width 0.3s ease" : "none";
        content.style.width = `calc(100% - ${w}px)`;
        content.style.marginLeft = `${w}px`;
        wrapper.style.width = `${w}px`;
    };

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            applyLayout(targetWidth, true);
            isFirstRender.current = false;

            const timer = setTimeout(() => {
                setInitialDone(true);
            }, 320);

            return () => clearTimeout(timer);
        });

        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        if (isFirstRender.current) return;
        applyLayout(targetWidth, !isResizing);
    }, [collapsed, width, isResizing]);

    const toggle = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);

        if (!newCollapsed) {
            setInitialDone(false);
            const timer = setTimeout(() => {
                setInitialDone(true);
            }, 320);
            return () => clearTimeout(timer);
        }
    };

    const startResize = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsResizing(true);

            const startX = e.clientX;
            const startWidth = width;

            const onMouseMove = (event: MouseEvent) => {
                let newWidth = startWidth + (event.clientX - startX);
                if (newWidth < DEFAULT_WIDTH) newWidth = DEFAULT_WIDTH;
                if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
                setWidth(newWidth);
            };

            const onMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        },
        [width],
    );

    const isContentVisible = initialDone && !collapsed;

    return (
        <div
            className={clsx(
                "pnpnd-media-library-sidebar",
                window.pnpnd.pagenow === "upload.php" &&
                    "pnpnd-media-library-sidebar--upload-page",
                window.pnpnd.pagenow !== "upload.php" &&
                    "pnpnd-media-library-sidebar--site-editor",
            )}
        >
            <div
                style={{
                    position: "relative",
                    minWidth: DEFAULT_WIDTH,
                    height: "100%",
                    width: "100%",
                    visibility: isContentVisible ? "visible" : "hidden",
                    opacity: isContentVisible ? 1 : 0,
                    transition: initialDone
                        ? "opacity 0.2s ease, visibility 0s linear 0s"
                        : "none",
                    ...(isContentVisible === false &&
                        initialDone && {
                            transition:
                                "opacity 0.2s ease, visibility 0s linear 0.2s",
                        }),
                }}
            >
                {children}
            </div>

            {!collapsed && (
                <div
                    className="pnpnd-media-library-sidebar--resizer"
                    onMouseDown={startResize}
                />
            )}

            <IconButton
                variant="primary"
                size="supersmall"
                rounded="full"
                name="keyboard_tab_rtl"
                fontSize="sm"
                style={{
                    transition:
                        "background-color 0.3s ease, transform 0.3s ease",
                    transform: collapsed ? "scaleX(-1)" : "scaleX(1)",
                }}
                className="pnpnd-media-library-sidebar--toggle"
                onClick={toggle}
            />
        </div>
    );
};

export default MediaSidebar;
