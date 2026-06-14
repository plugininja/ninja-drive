import { __, sprintf } from "@wordpress/i18n";
import { File } from "~/types/file.types";

export const toBoolean = (val: boolean | string) =>
    val === "true" || val === true || val === "1";

export function openAuthWindow(
    authUrl: string = "",
    width: string = "970",
    height: string = "700",
): void {
    const authWindow = window.open(authUrl, "_blank");

    if (authWindow && authWindow.focus) authWindow.focus();
}

export const validateAppCredentials = (
    client_id: string,
    secret_key: string,
) => {
    let valid = true;

    const clientIdRegex = /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
    const secretKeyRegex = /^GOCSPX-[\w-]{20,}$/;

    if (!client_id.trim()) {
        valid = false;
    } else if (!clientIdRegex.test(client_id.trim())) {
        valid = false;
    }

    if (!valid) return valid;

    if (secret_key?.includes("*")) {
        return true;
    }

    if (!secret_key.trim()) {
        valid = false;
    } else if (!secretKeyRegex.test(secret_key.trim())) {
        valid = false;
    }

    return valid;
};

export const getFormatDate = (date_string: string): string => {
    if (!date_string) return "";

    const date = new Date(date_string);
    if (isNaN(date.getTime())) return date_string;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function activeColorGenerator(hex: string, percent: number) {
    let num = parseInt(hex.replace("#", ""), 16);

    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    r = Math.min(255, Math.max(0, r + (r * percent) / 100));
    g = Math.min(255, Math.max(0, g + (g * percent) / 100));
    b = Math.min(255, Math.max(0, b + (b * percent) / 100));

    return (
        "#" +
        (
            (1 << 24) +
            (Math.round(r) << 16) +
            (Math.round(g) << 8) +
            Math.round(b)
        )
            .toString(16)
            .slice(1)
    );
}

export const uniqueBy = (arr: Array<any>, key: string): Array<any> => {
    const seen = new Set();
    return arr.filter((item) => {
        if (seen.has(item[key])) return false;
        seen.add(item[key]);
        return true;
    });
};

export const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (hrs > 0) {
        return `${hrs}:${pad(mins)}:${pad(secs)}`;
    } else {
        return `${pad(mins)}:${pad(secs)}`;
    }
};

export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (
        a === null ||
        b === null ||
        typeof a !== "object" ||
        typeof b !== "object"
    ) {
        return a === b;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
}

export const getUsedStorage = (limit: number, usage: number) => {
    return (usage / limit) * 100;
};

export function formatDateToMonDayYear(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);

    const months = [
        __("Jan", "ninja-drive"),
        __("Feb", "ninja-drive"),
        __("Mar", "ninja-drive"),
        __("Apr", "ninja-drive"),
        __("May", "ninja-drive"),
        __("Jun", "ninja-drive"),
        __("Jul", "ninja-drive"),
        __("Aug", "ninja-drive"),
        __("Sep", "ninja-drive"),
        __("Oct", "ninja-drive"),
        __("Nov", "ninja-drive"),
        __("Dec", "ninja-drive"),
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day} ${year}`;
}

export const getDownloadUrl = (file: File, id?: string): string => {
    if (!file || !file.file_key || !file.name) {
        console.error("Invalid file object provided to getDownloadUrl:", file);
        return "";
    }

    const url = PNPNDHelper.getUrl(
        "download",
        file?.file_key,
        file?.name,
        id,
        undefined,
        file?.extension,
    );

    return url;
};

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
