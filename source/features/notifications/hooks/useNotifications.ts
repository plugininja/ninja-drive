import { TNotification } from "~/shared/notifications-ui/components/Notifications/Notifications.type";

const useNotifications = (skip: boolean) => {

    return {
        notifications:
            ([] as TNotification[]),
        total:
            0,
        unread_count:
            0,
        has_more:
            false,
        loadMoreRef:
            null,
        isLoading:
            false,
        isFetching:
            false,
        refetchNotifications:
            (() => {}),
        notificationsAllRead:
            (() => {}),
        updateNotificationStatus:
            (() => {}),
        deleteAllNotifications:
            (() => {}),
        deleteNotification:
            (() => {}),
    };
};

export default useNotifications;
