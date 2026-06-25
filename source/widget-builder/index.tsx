import { useModuleBuilder } from "~features/widget-builder/components/modals/ModuleBuilder";
import { useEffect } from "@wordpress/element";

export function ModuleBuilderBridge() {
    const { openModuleBuilder } = useModuleBuilder();

    useEffect(() => {
        window.PNPNDHelper.openModuleBuilder = openModuleBuilder;

        return () => {
            delete window.PNPNDHelper.openModuleBuilder;
        };
    }, [openModuleBuilder]);

    return null;
}
