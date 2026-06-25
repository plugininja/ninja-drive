import useNotifications from "~features/notifications/hooks/useNotifications";
import { TNotification } from "./Notifications.type";
import { useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Loading } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import Details from "./Details";
import Header from "./Header";
import Item from "./Item";
import clsx from "clsx";

const Notifications = ({ skip }: { skip: boolean }) => {
    const [mode, setMode] = useState<"all" | "unread">("all");
    const [details, setDetails] = useState<TNotification | null>(null);

    const {
        notifications,
        total,
        unread_count: unread,
        has_more,
        loadMoreRef,
        isLoading,
        isFetching,
        refetchNotifications,
        notificationsAllRead,
        updateNotificationStatus,
        deleteAllNotifications,
        deleteNotification,
    } = useNotifications(skip);

    const unreadNotifications = notifications.filter(
        (n) => n.status === "unread",
    );

    const loading = isLoading || isFetching;

    return (
        <Dropdown>
            <Dropdown.Trigger style={{ position: "relative" }}>
                <IconButton
                    variant="outlined"
                    name="notifications_active"
                    className={clsx(
                        unread > 0 && "pnpnd-notifications--active",
                    )}
                />

                {unread > 0 && (
                    <span
                        className={clsx(
                            "pnpnd-notifications__badge",
                            unread > 99 && "pnpnd-notifications__badge--large",
                        )}
                    >
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </Dropdown.Trigger>

            <Dropdown.Content className="pnpnd-notifications">
                {!details && (
                    <Header
                        mode={mode}
                        setMode={setMode}
                        all={total}
                        unread={unread}
                        allRead={notificationsAllRead}
                        refresh={refetchNotifications}
                        deleteAll={deleteAllNotifications}
                    />
                )}

                {!details && <Divider color="secondary" />}

                <BlockStack className="pnpnd-notifications__content">
                    {details ? (
                        <Details
                            notification={details}
                            setDetails={setDetails}
                            delete={deleteNotification}
                        />
                    ) : (
                        (mode === "all"
                            ? notifications
                            : unreadNotifications
                        ).map((notification) => (
                            <Item
                                key={notification?.id}
                                notification={notification}
                                setDetails={setDetails}
                                update={updateNotificationStatus}
                                delete={deleteNotification}
                            />
                        ))
                    )}

                    {!loading && has_more && <div ref={loadMoreRef} />}

                    {has_more && !details && (
                        <InlineStack align="center">
                            <Loading />
                        </InlineStack>
                    )}

                    {!loading &&
                        mode === "all" &&
                        notifications.length === 0 && (
                            <BlockStack
                                padding={20}
                                align="center"
                                inlineAlign="center"
                            >
                                <Text size="sm">
                                    {__("No notifications yet.", "ninja-drive")}
                                </Text>
                            </BlockStack>
                        )}

                    {!loading &&
                        mode === "unread" &&
                        unreadNotifications.length === 0 && (
                            <BlockStack
                                padding={20}
                                align="center"
                                inlineAlign="center"
                            >
                                <Text size="sm">
                                    {__(
                                        "No unread notifications.",
                                        "ninja-drive",
                                    )}
                                </Text>
                            </BlockStack>
                        )}

                    {isLoading && (
                        <InlineStack align="center">
                            <Loading />
                        </InlineStack>
                    )}
                </BlockStack>
            </Dropdown.Content>
        </Dropdown>
    );
};

export default Notifications;
