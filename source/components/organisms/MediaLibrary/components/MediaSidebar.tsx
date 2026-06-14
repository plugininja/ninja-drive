import { useCallback, useEffect, useState } from "@wordpress/element";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";

const MediaSidebar = ({ children }: { children: React.ReactNode }) => {
    const [sidebarWidth, setSidebarWidth] = useState<number>(Number(300));

    useEffect(() => {
        const content = document.getElementById("wpbody-content");

        const wrapper = document.getElementById(
            "pnpnd-media-library-sidebar-wrapper",
        );

        if (content && wrapper && window.pnpnd.pagenow === "upload.php") {
            content.style.width = `calc(100% - ${sidebarWidth}px)`;
            content.style.marginLeft = `${sidebarWidth}px`;
        }

        if (wrapper) wrapper.style.width = `${sidebarWidth}px`;

        const classes = [
            "media-frame-title",
            "media-frame-content",
            "media-frame-router",
            "media-frame-toolbar",
        ];

        classes.forEach((className) => {
            const elements = document.getElementsByClassName(className);
            Array.from(elements).forEach((element) => {
                (element as HTMLElement).style.left = `${sidebarWidth}px`;
            });
        });
    }, [sidebarWidth]);

    const startResize = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = sidebarWidth;

            const minWidth = 300;

            const onMouseMove = (event: MouseEvent) => {
                let newWidth = startWidth + (event.clientX - startX);

                if (newWidth < minWidth) newWidth = minWidth;
                if (newWidth > 1000) newWidth = 1000;

                setSidebarWidth(newWidth);
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        },
        [sidebarWidth],
    );

    return (
        <div
            style={{ width: `${sidebarWidth}px` }}
            className={clsx(
                "pnpnd-media-library-sidebar",
                window.pnpnd.pagenow === "upload.php" &&
                    "pnpnd-media-library-sidebar--upload-page",
                window.pnpnd.pagenow !== "upload.php" &&
                    "pnpnd-media-library-sidebar--site-editor",
            )}
        >
            {children}

            <div
                className="pnpnd-media-library-sidebar--toggle"
                onMouseDown={startResize}
            >
                <Icon name="arrow_menu_open" color="primary" fontSize="lg" />
            </div>

            <div
                className="pnpnd-media-library-sidebar--resizer"
                onMouseDown={startResize}
            />
        </div>
    );
};

export default MediaSidebar;
