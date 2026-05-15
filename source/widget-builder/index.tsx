import { useEffect } from "@wordpress/element";
import { useModuleBuilder } from "~/components/organisms/modals/ModuleBuilder";

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
