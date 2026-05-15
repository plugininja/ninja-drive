import useNotifications from "~/hooks/useNotifications";
import { TNotification } from "./Notifications.type";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { useState } from "@wordpress/element";
import Dropdown from "~/components/molecules/Dropdown";
import Divider from "~/components/atoms/Divider";
import Loading from "~/components/atoms/Loading";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
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
        unreadCount: unread,
        hasMore,
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

                    {!loading && hasMore && <div ref={loadMoreRef} />}

                    {hasMore && !details && (
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
                                    {__(
                                        "No notifications yet.",
                                        "ninja-drive",
                                    )}
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
