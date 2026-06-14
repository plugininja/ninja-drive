import { useEffect, useRef, useState } from "@wordpress/element";
import { toBoolean } from "~/utils/functions";

const STORAGE_KEY = "pnpnd-onboarding-countdown";

const TOTAL = 5 * 60;

const getInitial = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { remaining: TOTAL, paused: false };
    } catch {
        return { remaining: TOTAL, paused: false };
    }
};

const save = (r: number, p: boolean) => {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ remaining: r, paused: p }),
    );
};

export const stopCountdown = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const useCountdown = () => {
    const [remaining, setRemaining] = useState(() => getInitial().remaining);
    const [paused, setPaused] = useState(() => getInitial().paused);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isDone = remaining <= 0;

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!toBoolean(pnpnd?.onboarding) || isDone || paused) {
            clearTimer();
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        intervalRef.current = setInterval(() => {
            setRemaining((prev: number) => {
                const next = Math.max(prev - 1, 0);
                save(next, false);
                return next;
            });
        }, 1000);

        return clearTimer;
    }, [paused, isDone]);

    const toggle = () => {
        setPaused((prev: boolean) => {
            save(remaining, !prev);
            return !prev;
        });
    };

    const format = (s: number) => {
        const m = Math.floor(s / 60)
            .toString()
            .padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    return {
        paused,
        isDone,
        toggle,
        formatted: format(remaining),
    };
};
