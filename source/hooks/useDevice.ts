import { useEffect, useState } from "@wordpress/element";

type DeviceType = "desktop" | "tablet" | "mobile";

function useDevice() {
    const [device, setDevice] = useState<DeviceType>("desktop");

    useEffect(() => {
        const updateDevice = () => {
            if (window.innerWidth >= 1024) {
                setDevice("desktop");
            } else if (window.innerWidth >= 768) {
                setDevice("tablet");
            } else {
                setDevice("mobile");
            }
        };

        updateDevice();
        window.addEventListener("resize", updateDevice);
        return () => window.removeEventListener("resize", updateDevice);
    }, []);

    return device;
}

export default useDevice;
