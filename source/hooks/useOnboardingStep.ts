import { useEffect, useState } from "@wordpress/element";

const SHOW_KEY = "pnpnd-onboarding-steps";

const STEPS_KEY = "pnpnd-onboarding-completed-steps";

let globalSteps: number[] = (() => {
    try {
        const raw = localStorage.getItem(STEPS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
})();

let globalShow: boolean = (() => {
    try {
        const raw = localStorage.getItem(SHOW_KEY);
        return raw ? JSON.parse(raw) : true;
    } catch {
        return true;
    }
})();

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

export const completeStep = (index: number) => {
    if (!pnpnd?.onboarding) return;

    const toAdd = Array.from({ length: index + 1 }, (_, i) => i).filter(
        (i) => !globalSteps.includes(i),
    );

    if (toAdd.length === 0) return;

    globalSteps = [...globalSteps, ...toAdd];
    localStorage.setItem(STEPS_KEY, JSON.stringify(globalSteps));
    notify();
};

export const resetSteps = () => {
    globalShow = false;
    globalSteps = [];
    localStorage.removeItem(STEPS_KEY);
    localStorage.removeItem(SHOW_KEY);
    localStorage.removeItem("pnpnd-onboarding-steps-collapsed");
    localStorage.removeItem("pnpnd-onboarding-countdown");
    notify();
};

export const useOnboardingStep = () => {
    const [show, setShowState] = useState(globalShow);
    const [completedSteps, setCompletedSteps] = useState(globalSteps);

    useEffect(() => {
        if (!pnpnd?.onboarding) return;

        const sync = () => {
            setCompletedSteps([...globalSteps]);
            setShowState(globalShow);
        };

        listeners.add(sync);
        return () => {
            listeners.delete(sync);
        };
    }, []);

    const setShow = (value: boolean) => {
        globalShow = value;
        localStorage.setItem(SHOW_KEY, JSON.stringify(value));
        notify();
    };

    const isCompleted = (index: number) => completedSteps?.includes(index);

    const isNextStep = (index: number) => {
        for (let i = 0; i < index; i++) {
            if (!completedSteps?.includes(i)) return false;
        }

        return !completedSteps?.includes(index);
    };

    return { show, setShow, completedSteps, isCompleted, isNextStep };
};
