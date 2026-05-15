import { useEffect, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { useCustomAlert } from "~/components/molecules/Alert";
import {
    useDeleteAllNotificationsMutation,
    useDeleteNotificationMutation,
    useGetNotificationsQuery,
    useNotificationsAllReadMutation,
    useUpdateNotificationStatusMutation,
} from "~/store/api/noticeApi";

const useNotifications = (skip: boolean) => {
    const [page, setPage] = useState(1);
    const perPage = 10;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    const { showAlert } = useCustomAlert();

    const {
        data: notificationsData,
        isFetching,
        isLoading,
        refetch,
    } = useGetNotificationsQuery(
        {
            page: page,
            perPage: perPage,
        },
        {
            skip: skip,
            refetchOnMountOrArgChange: true,
        },
    );

    const hasMore = notificationsData?.data?.hasMore ?? false;

    useEffect(() => {
        if (!loadMoreRef.current) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasMore && !isFetching) {
                setPage((prev) => prev + 1);
            }
        });

        observer.current.observe(loadMoreRef.current);
    }, [loadMoreRef.current, hasMore, isFetching]);

    const [notificationsAllReadMutation] = useNotificationsAllReadMutation();
    const [updateNotificationStatusMutation] =
        useUpdateNotificationStatusMutation();
    const [deleteAllNotificationsMutation] =
        useDeleteAllNotificationsMutation();
    const [deleteNotificationMutation] = useDeleteNotificationMutation();

    const refetchNotifications = () => {
        if (page === 1) {
            refetch();
            return;
        }
        setPage(1);
    };

    const notificationsAllRead = async () => {
        try {
            const response = await notificationsAllReadMutation().unwrap();

            showAlert({
                toast: true,
                type: "success",
                text: response?.message || __("All notifications marked as read.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Failed to mark all notifications as read.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const updateNotificationStatus = async (id: string) => {
        try {
            await updateNotificationStatusMutation({
                id,
            }).unwrap();
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Failed to update notification status.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const deleteAllNotifications = async () => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: __("Are you sure you want to delete all notifications?", "ninja-drive"),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response =
                        await deleteAllNotificationsMutation().unwrap();

                    refetchNotifications();

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __("All notifications deleted successfully.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Failed to delete all notifications.", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const deleteNotification = async (id: string) => {
        try {
            const response = await deleteNotificationMutation({ id }).unwrap();

            showAlert({
                toast: true,
                type: "success",
                text:
                    response?.message ||
                    __("Notification deleted successfully.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Failed to delete notification.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    return {
        notifications: notificationsData?.data?.notices || [],
        total: notificationsData?.data?.total || 0,
        unreadCount: notificationsData?.data?.unreadCount || 0,
        hasMore: notificationsData?.data?.hasMore,
        loadMoreRef,
        isLoading,
        isFetching,
        refetchNotifications,
        notificationsAllRead,
        updateNotificationStatus,
        deleteAllNotifications,
        deleteNotification,
    };
};

export default useNotifications;
