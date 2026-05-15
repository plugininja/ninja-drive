import { __, sprintf } from "@wordpress/i18n";
import { File } from "~/types/file.types";

export const toBoolean = (val: boolean | string) =>
    val === "true" || val === true || val === "1";

export function openAuthWindow(
    authUrl: string = "",
    width: string = "970",
    height: string = "700",
): void {
    const left = window.screenLeft || window.screenX;
    const top = window.screenTop || window.screenY;
    const centerX =
        left +
        (window.innerWidth ||
            document.documentElement.clientWidth ||
            screen.width) /
            2 -
        parseInt(width) / 2;
    const centerY =
        top +
        (window.innerHeight ||
            document.documentElement.clientHeight ||
            screen.height) /
            2 -
        parseInt(height) / 2;

    // const authWindow = window.open(
    //     authUrl,
    //     "newwindow",
    //     `width=${width},height=${height},left=${centerX},top=${centerY}`
    // );
    const authWindow = window.open(authUrl, "_blank");

    if (authWindow && authWindow.focus) authWindow.focus();
}

export const validateAppCredentials = (clientID: string, secretKey: string) => {
    let valid = true;

    const clientIdRegex = /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
    const secretKeyRegex = /^GOCSPX-[\w-]{20,}$/;

    if (!clientID.trim()) {
        valid = false;
    } else if (!clientIdRegex.test(clientID.trim())) {
        valid = false;
    }

    if (!valid) return valid;

    if (secretKey?.includes("*")) {
        return true;
    }

    if (!secretKey.trim()) {
        valid = false;
    } else if (!secretKeyRegex.test(secretKey.trim())) {
        valid = false;
    }

    return valid;
};

export const getFormatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

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

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return __("0 Bytes", "ninja-drive");
    const k = 1024;
    const sizes = [
        __("Bytes", "ninja-drive"),
        __("KB", "ninja-drive"),
        __("MB", "ninja-drive"),
        __("GB", "ninja-drive"),
        __("TB", "ninja-drive"),
        __("PB", "ninja-drive"),
        __("EB", "ninja-drive"),
        __("ZB", "ninja-drive"),
        __("YB", "ninja-drive"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

export function objectEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== typeof obj2) return false;

    if (obj1 == null || obj2 == null) return obj1 === obj2;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;

        const arr1 = [...obj1];
        const arr2 = [...obj2];

        return arr1.every((item1) => {
            const index = arr2.findIndex((item2) => objectEqual(item1, item2));
            if (index === -1) return false;
            arr2.splice(index, 1);
            return true;
        });
    }

    if (typeof obj1 === "object" && typeof obj2 === "object") {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(
            (key) => keys2.includes(key) && objectEqual(obj1[key], obj2[key]),
        );
    }

    return obj1 === obj2;
}

export const getDownloadUrl = (file: File, id?: string): string => {
    if (!file || !file.fileKey || !file.name) {
        console.error("Invalid file object provided to getDownloadUrl:", file);
        return "";
    }

    const url = PNPNDHelper.getUrl(
        "download",
        file?.fileKey,
        file?.name,
        id,
        undefined,
        file?.extension,
    );

    return url;
};
