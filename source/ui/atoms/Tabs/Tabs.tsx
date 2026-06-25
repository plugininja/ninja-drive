import { useEffect, useRef, useState, useCallback } from "@wordpress/element";
import { TabsProps } from "./Tabs.type";
import { Card } from "~/ui/molecules";
import { Status } from "../Status";
import { Icon } from "../Icon";
import { Text } from "../Text";
import clsx from "clsx";

const Tabs = ({
    id,
    style,
    className,
    background = "gray-50",
    size = "medium",
    rounded = "lg",
    tabRounded = "md",
    tabs,
    pro = [],
    active,
    disabled = false,
    onTabClick,
}: TabsProps) => {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState({ width: 0, left: 0 });
    const [ready, setReady] = useState(false);

    const updateIndicator = useCallback(() => {
        const activeIndex = tabs.findIndex((tab) => tab.key === active);
        const activeTab = tabsRef.current[activeIndex];
        const wrapper = wrapperRef.current;

        if (!activeTab || !wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();

        setIndicator({
            width: tabRect.width,
            left: tabRect.left - wrapperRect.left,
        });
        setReady(true);
    }, [active, tabs]);

    useEffect(() => {
        const raf = requestAnimationFrame(updateIndicator);
        return () => cancelAnimationFrame(raf);
    }, [updateIndicator]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(updateIndicator);
        });
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [updateIndicator]);

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

        e.preventDefault();

        const direction = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;

        const nextTab = tabs[nextIndex];
        if (!nextTab) return;

        tabsRef.current[nextIndex]?.focus();
        onTabClick?.(nextTab.key);
    };

    return (
        <Card
            id={id}
            style={style}
            padding={5}
            background={background}
            rounded={rounded}
            className={clsx(
                "pn-tabs",
                disabled && "pn-tabs--disabled",
                className,
            )}
        >
            <div ref={wrapperRef} className="pn-tabs__wrapper" role="tablist">
                <div
                    className={clsx(
                        "pn-tabs__indicator",
                        `rounded-${tabRounded}`,
                    )}
                    style={{
                        width: indicator.width,
                        transform: `translateX(${indicator.left}px)`,
                        opacity: ready ? 1 : 0,
                    }}
                />

                {tabs?.map(({ key, title, icon }, index) => {
                    const isActive = active === key;

                    return (
                        <button
                            key={key}
                            ref={(el) => {
                                tabsRef.current[index] = el;
                            }}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            tabIndex={isActive ? 0 : -1}
                            style={{
                                height:
                                    size === "small"
                                        ? 32
                                        : size === "large"
                                        ? 48
                                        : 42,
                                gap:
                                    size === "small"
                                        ? 7
                                        : size === "large"
                                        ? 14
                                        : 10,
                                padding:
                                    size === "small"
                                        ? "0 12px"
                                        : size === "large"
                                        ? "0 20px"
                                        : "0 16px",
                            }}
                            className={clsx(
                                "pn-tabs__item",
                                `rounded-${tabRounded}`,
                            )}
                            onClick={() => !disabled && onTabClick?.(key)}
                            onKeyDown={(e) =>
                                !disabled && handleKeyDown(e, index)
                            }
                        >
                            <Icon
                                name={icon ?? ""}
                                color={isActive ? "white" : "gray-500"}
                                fontSize={
                                    size === "small"
                                        ? "md"
                                        : size === "large"
                                        ? "xl"
                                        : "lg"
                                }
                            />

                            <Text
                                color={isActive ? "white" : "gray-500"}
                                size="sm"
                            >
                                {title}
                            </Text>

                            {pro?.includes(key) && <Status.Pro />}
                        </button>
                    );
                })}
            </div>
        </Card>
    );
};

export default Tabs;
