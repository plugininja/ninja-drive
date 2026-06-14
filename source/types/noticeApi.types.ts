import { TNotification } from "~/components/organisms/Notifications/Notifications.type";

export interface GetNoticesResponse {
    notices: TNotification[];
    unread_count: number;
    total: number;
    has_more: boolean;
    current_page: number;
    next_page?: number;
}

export interface GetNoticeRequest {
    page?: number;
    per_page?: number;
    status?: "read" | "unread" | "all";
    type?: "info" | "warning" | "error" | "success";
}

export interface GetNoticeResponse {
    title?: string;
    description?: string;
    type?: "error" | "warning" | "secondary";
}
