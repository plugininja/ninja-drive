import { cloneElement, isValidElement } from "@wordpress/element";
import { formatDateToMonDayYear } from "~kernel/utils/functions";
import { NotificationItemProps } from "./Notifications.type";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import clsx from "clsx";

const Item = ({
    notification,
    setDetails,
    update,
    delete: deleteNotification,
}: NotificationItemProps) => {
    const { title, description, created_at, htmlContent, type, status } =
        notification;

    const iconName =
        type === "success"
            ? "notifications_active"
            : type === "warning"
            ? "settings_alert"
            : type === "error"
            ? "settings_alert"
            : "info";

    return (
        <InlineStack
            blockAlign="start"
            gap={10}
            wrap={false}
            style={{
                minWidth: 0,
            }}
            className={clsx(
                "pnpnd-notifications__item",
                status === "unread" && "pnpnd-notifications__item--unread",
            )}
            onClick={() => {
                setDetails(notification);
                if (status === "unread") {
                    update(notification?.id);
                }
            }}
        >
            <Card
                padding={3}
                background={
                    type === "success" ? "primary-extralight" : `${type}-50`
                }
                border={type === "success" ? "primary-light" : `${type}-100`}
                flex
                align="center"
                blockAlign="center"
                rounded="sm"
                style={{
                    width: "30px",
                    height: "30px",
                    flexShrink: 0,
                }}
            >
                <Icon
                    name={iconName}
                    color={type === "success" ? "primary" : type}
                />
            </Card>

            <BlockStack
                gap={2}
                style={{
                    minWidth: 0,
                }}
                className="w-full"
            >
                <InlineStack align="between" gap={10} className="w-full">
                    <Text size="sm" weight="semibold">
                        {title}
                    </Text>

                    <InlineStack gap={10} wrap={false}>
                        <Text size="xs" weight="medium">
                            {formatDateToMonDayYear(created_at)}
                        </Text>

                        {status === "unread" && (
                            <span
                                className={clsx(
                                    "pnpnd-notifications__item-status",
                                    `bg-${type}`,
                                )}
                            />
                        )}
                    </InlineStack>
                </InlineStack>

                {htmlContent ? (
                    renderHtmlContent(htmlContent)
                ) : (
                    <Text
                        size="xs"
                        color="gray-500"
                        ellipsis
                        ellipsisLine={2}
                        style={{
                            minWidth: 0,
                        }}
                    >
                        {description}
                    </Text>
                )}
            </BlockStack>

            <IconButton
                variant="error"
                size="supersmall"
                name="delete"
                fontSize="lg"
                className="pnpnd-notifications__item-delete"
                onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification?.id);
                }}
            />
        </InlineStack>
    );
};

export default Item;

const renderHtmlContent = (htmlContent: React.ReactNode) => {
    if (isValidElement(htmlContent)) {
        return cloneElement(htmlContent, {
            style: {
                ...htmlContent.props.style,
                minWidth: 0,
            },
            className: clsx(htmlContent.props.className, "text-ellipsis-2"),
        });
    }

    return htmlContent;
};
