import { useLocation } from "react-router-dom";
import { useEffect } from "@wordpress/element";

export const useMainMenuActive = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const anchors = document.querySelectorAll(
            'a[href^="admin.php?page=ninja-drive#"]',
        );

        anchors.forEach((a) => {
            (a as HTMLAnchorElement).classList.remove("current");
        });

        const matched: HTMLAnchorElement[] = [];

        anchors.forEach((a) => {
            const href = a.getAttribute("href");
            const hashPath = href?.split("#")[1];
            const anchor = a as HTMLAnchorElement;

            if (pathname.startsWith(hashPath || "")) {
                matched.push(anchor);
            }
        });

        if (matched.length >= 2) {
            matched[1].classList.add("current");
        } else if (matched.length === 1) {
            matched[0].classList.add("current");
        }
    }, []);
};
