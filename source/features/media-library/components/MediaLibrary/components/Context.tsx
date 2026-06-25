import { useContextMenu } from "~/ui/molecules";
import { useEffect } from "@wordpress/element";

type WpAttachment = {
    id: number;
    url: string;
    [key: string]: any;
};

const Context = () => {
    const { show } = useContextMenu();
    const $ = (window as any).jQuery as any;

    useEffect(() => {
        const handleContextMenu = (e: Event) => {
            const target = e.currentTarget as HTMLElement | null;

            if (!target) return;

            e.preventDefault();

            if (!window.wp?.media) return;

            const attachments: WpAttachment[] = [];

            const selectedEls = Array.from(
                document.querySelectorAll(
                    ".attachments-wrapper .attachment[aria-checked='true']",
                ),
            ) as HTMLElement[];

            if (selectedEls.length > 0) {
                selectedEls.forEach((el) => {
                    const idAttr = el.getAttribute("data-id");

                    if (idAttr) {
                        const attachment = window.wp.media
                            .attachment(Number(idAttr))
                            .toJSON() as WpAttachment;
                        attachments.push(attachment);
                    }
                });
            } else {
                const idAttr = target.getAttribute("data-id");

                if (idAttr) {
                    const attachment = window.wp.media
                        .attachment(Number(idAttr))
                        .toJSON() as WpAttachment;
                    attachments.push(attachment);
                }
            }

            if (attachments.length === 0) return;

            show(
                "media-attachment",
                {
                    clientX: (e as MouseEvent).clientX,
                    clientY: (e as MouseEvent).clientY,
                    preventDefault: () => {},
                } as any,
                { attachments },
            );
        };

        $(document).on(
            "contextmenu",
            ".attachments-wrapper .attachment",
            handleContextMenu,
        );

        return () => {
            $(document).off(
                "contextmenu",
                ".attachments-wrapper .attachment",
                handleContextMenu,
            );
        };
    }, [show]);

    return null;
};

export default Context;
