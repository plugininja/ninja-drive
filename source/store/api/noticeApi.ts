import { GetNoticesResponse } from "~/types/noticeApi.types";
import { ServerResponse } from "~/types/Types";
import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<
            ServerResponse<GetNoticesResponse>,
            { page: number; per_page: number }
        >({
            query: ({ page, per_page }) => {
                return {
                    url: "notice",
                    params: { page, per_page },
                };
            },

            serializeQueryArgs: ({ endpointName }) => endpointName,

            merge: (currentCache, newData) => {
                if (!currentCache.data || !newData.data) return;

                if (newData.data.current_page === 1) {
                    currentCache.data = newData.data;
                    return;
                }

                currentCache.data.notices.push(...newData.data.notices);
                currentCache.data.has_more = newData.data.has_more;
                currentCache.data.current_page = newData.data.current_page;
            },

            forceRefetch({ currentArg, previousArg }) {
                if (currentArg?.page === 1) {
                    return true;
                }
                return currentArg?.page !== previousArg?.page;
            },

            providesTags: (result, error, { page }) => [
                { type: "Notifications", id: page },
            ],
        }),

        notificationsAllRead: builder.mutation<ServerResponse<null>, void>({
            query: () => {
                return {
                    url: "notice/mark-all-read",
                    method: "POST",
                };
            },

            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    dispatch(
                        notificationApi.util.updateQueryData(
                            "getNotifications",
                            undefined as any,
                            (draft) => {
                                draft.data?.notices.forEach((notification) => {
                                    notification.status = "read";
                                });
                                draft.data!.unread_count = 0;
                            },
                        ),
                    );
                } catch (error) {}
            },
        }),

        updateNotificationStatus: builder.mutation<
            ServerResponse<null>,
            { id: string }
        >({
            query: ({ id }) => {
                return {
                    url: `notice/status/${id}`,
                    method: "PATCH",
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        notificationApi.util.updateQueryData(
                            "getNotifications",
                            undefined as any,
                            (draft) => {
                                const notification = draft.data!.notices.find(
                                    (n) => n.id === arg.id,
                                );
                                if (notification) {
                                    notification.status = "read";
                                }
                                if (
                                    notification &&
                                    notification.status === "read"
                                ) {
                                    notification.status = "read";
                                    draft.data!.unread_count -= 1;
                                }
                            },
                        ),
                    );
                } catch (error) {}
            },
        }),

        deleteAllNotifications: builder.mutation<ServerResponse<null>, void>({
            query: () => {
                return {
                    url: "notice/clear",
                    method: "DELETE",
                };
            },

            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        notificationApi.util.updateQueryData(
                            "getNotifications",
                            undefined as any,
                            (draft) => {
                                draft.data!.notices = [];
                            },
                        ),
                    );
                } catch (error) {}
            },
        }),

        deleteNotification: builder.mutation<
            ServerResponse<null>,
            { id: string }
        >({
            query: ({ id }) => {
                return {
                    url: `notice/${id}`,
                    method: "DELETE",
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        notificationApi.util.updateQueryData(
                            "getNotifications",
                            undefined as any,
                            (draft) => {
                                const notification = draft.data!.notices.find(
                                    (n) => n.id === arg.id,
                                );
                                draft.data!.notices =
                                    draft.data!.notices.filter(
                                        (n) => n.id !== arg.id,
                                    );
                                if (
                                    notification &&
                                    notification.status === "unread"
                                ) {
                                    draft.data!.total -= 1;
                                    draft.data!.unread_count -= 1;
                                }
                                if (
                                    notification &&
                                    notification.status === "read"
                                ) {
                                    draft.data!.total -= 1;
                                }
                            },
                        ),
                    );
                } catch (error) {}
            },
        }),
    }),

    overrideExisting: false,
});

export const {
    useGetNotificationsQuery,
    useUpdateNotificationStatusMutation,
    useNotificationsAllReadMutation,
    useDeleteAllNotificationsMutation,
    useDeleteNotificationMutation,
} = notificationApi;
