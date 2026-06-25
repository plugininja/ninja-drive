import { useFileSelector } from "~/shared/file-picker/components/FileSelector";
import { useEffect } from "@wordpress/element";

export function FileSelectorBridge() {
    const { openFileSelector } = useFileSelector();

    useEffect(() => {
        window.PNPNDHelper.openFileSelector = openFileSelector;
    }, [openFileSelector]);

    return null;
}
