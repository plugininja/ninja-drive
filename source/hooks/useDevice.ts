import { useEffect, useState } from "@wordpress/element";

type DeviceType = "desktop" | "tablet" | "mobile";

const getDevice = (): DeviceType => {
    if (window.innerWidth >= 1024) {
        return "desktop";
    }

    if (window.innerWidth >= 768) {
        return "tablet";
    }

    return "mobile";
};

function useDevice(): DeviceType;
function useDevice(breakpoint: number): boolean;

function useDevice(breakpoint?: number) {
    const [device, setDevice] = useState<DeviceType>(() =>
        typeof window !== "undefined" ? getDevice() : "desktop",
    );

    const [matched, setMatched] = useState<boolean>(() =>
        typeof window !== "undefined" && breakpoint !== undefined
            ? window.innerWidth >= breakpoint
            : false,
    );

    useEffect(() => {
        const updateDevice = () => {
            setDevice(getDevice());

            if (breakpoint !== undefined) {
                setMatched(window.innerWidth >= breakpoint);
            }
        };

        updateDevice();

        window.addEventListener("resize", updateDevice);

        return () => {
            window.removeEventListener("resize", updateDevice);
        };
    }, [breakpoint]);

    return breakpoint !== undefined ? matched : device;
}

export default useDevice;
