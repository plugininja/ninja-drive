export interface TNotification {
    id: string;
    title: string;
    description: string;
    htmlContent?: React.ReactNode;
    createdAt: string;
    type: "success" | "error" | "warning" | "info";
    status: "read" | "unread";
}

export interface NotificationsProps {}

export interface NotificationsHeaderProps {
    mode: "all" | "unread";
    setMode: (mode: "all" | "unread") => void;
    all: number;
    unread: number;
    allRead: () => void;
    refresh: () => void;
    deleteAll: () => void;
}

export interface NotificationItemProps {
    notification: TNotification;
    setDetails: (notification: TNotification | null) => void;
    update: (id: string) => void;
    delete: (id: string) => void;
}

export interface NotificationDetailsProps {
    notification: TNotification;
    setDetails: (notification: TNotification | null) => void;
    delete: (id: string) => void;
}
