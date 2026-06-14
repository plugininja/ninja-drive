import { useModuleBuilder } from "~/components/organisms/modals/ModuleBuilder";
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
