import type { AccordionGroupProps, AccordionProps } from "./Accordion.type";
import { useRef, useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";

export const Accordion = ({
    id,
    style,
    className = "",
    title = __("title", "ninja-drive"),
    rounded = "lg",
    defaultOpen = false,
    disabled = false,
    single = true,
    children,
}: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState("0px");

    useEffect(() => {
        if (isOpen && contentRef.current) {
            setHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setHeight("0px");
        }
    }, [isOpen]);

    const classes = clsx(
        "pn-accordion",
        `rounded-${rounded}`,
        single && "pn-accordion--single",
        disabled && "pn-accordion--disabled",
        isOpen && "pn-accordion--open",
        className,
    );

    return (
        <div id={id} style={style} className={classes}>
            <button
                className="pn-accordion__header"
                type="button"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                disabled={disabled}
            >
                <span className="pn-accordion__header-title">{title}</span>
                <span
                    className={clsx(
                        "pn-accordion__header-icon",
                        isOpen && "pn-accordion__header-icon--open",
                    )}
                >
                    <Icon name="keyboard_arrow_down" fontSize="2xl" />
                </span>
            </button>
            <div
                className="pn-accordion__body"
                ref={contentRef}
                style={{
                    maxHeight: height,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                }}
            >
                <div className="pn-accordion__body-inner">{children}</div>
            </div>
        </div>
    );
};

export const AccordionGroup = ({
    items,
    allowMultiple = true,
}: AccordionGroupProps) => {
    const [openIds, setOpenIds] = useState<string[]>([]);
    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleToggle = (id: string) => {
        setOpenIds((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : allowMultiple
                ? [...prev, id]
                : [id],
        );
    };

    return (
        <div className="pn-accordion-group">
            {items.map(({ id, title, content, disabled }) => {
                const isOpen = openIds.includes(id);
                const height =
                    isOpen && contentRefs.current[id]
                        ? `${contentRefs.current[id]!.scrollHeight}px`
                        : "0px";

                const itemCls = clsx(
                    "pn-accordion",
                    isOpen && "pn-accordion--open",
                    disabled && "pn-accordion--disabled",
                );

                return (
                    <div key={id} className={itemCls}>
                        <button
                            className="pn-accordion__header"
                            type="button"
                            onClick={() => !disabled && handleToggle(id)}
                            aria-expanded={isOpen}
                            disabled={disabled}
                        >
                            <span className="pn-accordion__header-title">
                                {title}
                            </span>
                            <span className="pn-accordion__header-icon">
                                <Icon
                                    name="keyboard_arrow_down"
                                    fontSize="2xl"
                                />
                            </span>
                        </button>

                        <div
                            className="pn-accordion__body"
                            style={{
                                maxHeight: height,
                                overflow: "hidden",
                                transition: "max-height 0.3s ease",
                            }}
                        >
                            <div
                                className="pn-accordion__body-inner"
                                ref={(el) => {
                                    contentRefs.current[id] = el;
                                }}
                            >
                                {content}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
