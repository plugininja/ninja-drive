import { useFileSelector } from "~/components/organisms/modals/FileSelector";
import { useEffect } from "@wordpress/element";

export function FileSelectorBridge() {
    const { openFileSelector } = useFileSelector();

    useEffect(() => {
        window.PNPNDHelper.openFileSelector = openFileSelector;
    }, [openFileSelector]);

    return null;
}
