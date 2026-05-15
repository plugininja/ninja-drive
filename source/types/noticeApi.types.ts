import { TNotification } from "~/components/organisms/Notifications/Notifications.type";

export interface GetNoticesResponse {
    notices: TNotification[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
    currentPage: number;
    nextPage?: number;
}

export interface GetNoticeRequest {
    page?: number;
    perPage?: number;
    status?: "read" | "unread" | "all";
    type?: "info" | "warning" | "error" | "success";
}

export interface GetNoticeResponse {
    title?: string;
    description?: string;
    type?: "error" | "warning" | "secondary";
}
