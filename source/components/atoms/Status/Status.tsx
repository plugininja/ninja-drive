import type { StatusConfig, StatusProps } from "./Status.type";
import InlineStack from "~/components/molecules/InlineStack";
import { BackgroundColor, TextColor } from "~/types/styles";
import Tooltip from "~/components/atoms/Tooltip";
import Card from "~/components/molecules/Card";
import { toBoolean } from "~/utils/functions";
import Icon from "~/components/atoms/Icon";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const Status = ({
    id,
    style,
    className = "",
    isPro = false,
    isComingSoon = false,
    isHot = false,
    isNew = false,
    isBeta = false,
    placement = "default",
    top = 10,
    bottom,
    left,
    right = 10,
    tooltipPlacement = "left",
    size = "medium",
    widthFull = true,
    ignore = false,
    overlay = true,
    children,
}: StatusProps) => {
    const allowFeature = isPro ? toBoolean(pnpnd.is_pro) : true;

    const statusConfig: StatusConfig[] = [
        {
            key: "badge-pro",
            variant: "badge-pro",
            title: __("Premium Feature", "ninja-drive"),
            icon: "crown",
            iconColor: "white",
            condition: !allowFeature,
        },
        {
            key: "comingsoon",
            variant: "warning",
            title: __("Coming Soon", "ninja-drive"),
            icon: "upcoming",
            iconColor: "white",
            condition: isComingSoon,
        },
        {
            key: "hot",
            variant: "error",
            title: __("Most Used Feature", "ninja-drive"),
            icon: "local_fire_department",
            iconColor: "white",
            condition: isHot,
        },
        {
            key: "badge-new",
            variant: "badge-new",
            title: __("New Feature", "ninja-drive"),
            icon: "campaign",
            iconColor: "primary",
            condition: isNew,
        },
        {
            key: "beta",
            variant: "secondary",
            title: __("Beta Feature", "ninja-drive"),
            icon: "running_with_errors",
            iconColor: "primary",
            condition: isBeta,
        },
    ];

    const statusList = statusConfig.filter((status) => status.condition);

    if (ignore || (!isPro && !isComingSoon && !isNew && !isHot && !isBeta)) {
        return <>{children}</>;
    }

    const parsePosition = (value?: number | string) =>
        value === undefined
            ? undefined
            : typeof value === "number"
            ? `${value}px`
            : value;

    let positionStyles: React.CSSProperties = {};

    switch (placement) {
        case "center":
            positionStyles = {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            };
            break;

        case "right-center":
            positionStyles = {
                top: "50%",
                right: parsePosition(right ?? 10),
                transform: "translateY(-50%)",
            };
            break;

        case "left-center":
            positionStyles = {
                top: "50%",
                left: parsePosition(left ?? 10),
                transform: "translateY(-50%)",
            };
            break;

        case "top-center":
            positionStyles = {
                top: parsePosition(top ?? 10),
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;

        case "bottom-center":
            positionStyles = {
                bottom: parsePosition(bottom ?? 10),
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;

        default:
            positionStyles = {
                top: parsePosition(top),
                right: parsePosition(right),
                bottom: parsePosition(bottom),
                left: parsePosition(left),
            };
    }

    const classes = clsx("pn-status", widthFull && "w-full", className);

    return (
        <div
            id={id}
            style={style}
            className={classes}
            onClick={(e) => {
                if (!allowFeature) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }

                if (isComingSoon) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
            }}
        >
            <InlineStack
                wrap={false}
                gap={
                    size === "extrasmall"
                        ? 5
                        : size === "small"
                        ? 7
                        : size === "medium"
                        ? 9
                        : size === "large"
                        ? 11
                        : 13
                }
                style={positionStyles}
                className="pn-status__items"
            >
                {statusList.map(({ key, variant, title, icon, iconColor }) => (
                    <Tooltip
                        key={key}
                        title={title}
                        placement={tooltipPlacement}
                        arrow
                        wrap="no-wrap"
                    >
                        <Card
                            padding={5}
                            rounded="sm"
                            borderStyle="none"
                            background={variant as BackgroundColor}
                            className={clsx(
                                "pn-status__items-item",
                                `pn-status__items-item--${size}`,
                            )}
                        >
                            <Icon name={icon} color={iconColor} />
                        </Card>
                    </Tooltip>
                ))}
            </InlineStack>

            <div
                className={clsx(
                    "pn-status__content",
                    overlay && (!allowFeature || isComingSoon)
                        ? "pn-status__content--disabled"
                        : "",
                )}
                onClick={(e) => {
                    if (!allowFeature) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }

                    if (isComingSoon) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                }}
            >
                {children}
            </div>
        </div>
    );
};

Status.Pro = ({
    title,
    color = "primary",
}: {
    title?: string;
    color?: TextColor;
}) => {
    if (toBoolean(pnpnd?.is_pro)) {
        return null;
    }

    return (
        <Tooltip
            title={
                title ||
                __(
                    "This feature is only available in the pro version",
                    "ninja-drive",
                )
            }
            arrow
            wrap="no-wrap"
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Icon name="crown" color={color} fontSize="xl" />
        </Tooltip>
    );
};

export default Status;
