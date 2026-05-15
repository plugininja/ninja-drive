import { __, sprintf } from "@wordpress/i18n";

export function timeAgo(dateString: string): string {
    const now = Date.now();
    const past = new Date(dateString).getTime();

    if (isNaN(past)) return __("Invalid date", "ninja-drive");

    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return sprintf(__("%d sec ago", "ninja-drive"), diffInSeconds);
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return sprintf(__("%d min ago", "ninja-drive"), minutes);
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return sprintf(__("%d hour ago", "ninja-drive"), hours);
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return sprintf(__("%d day ago", "ninja-drive"), days);
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return sprintf(__("%d month ago", "ninja-drive"), months);
    }

    const years = Math.floor(days / 365);
    return sprintf(__("%d year ago", "ninja-drive"), years);
}
