import { useEffect, useRef, useState, useCallback } from "@wordpress/element";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { TabsProps } from "./Tabs.type";
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
    active,
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

    return (
        <Card
            id={id}
            style={style}
            padding={5}
            background={background}
            rounded={rounded}
            className={clsx("pn-tabs", className)}
        >
            <div ref={wrapperRef} className="pn-tabs__wrapper">
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
                            onClick={() => onTabClick?.(key)}
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
                        </button>
                    );
                })}
            </div>
        </Card>
    );
};

export default Tabs;
