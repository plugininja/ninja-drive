import { __ } from "@wordpress/i18n";
import IconButton from "~/components/molecules/IconButton";
import { ModuleConfig } from "../types/widget.types";
import Tooltip from "~/components/atoms/Tooltip";
import { useEffect } from "@wordpress/element";
import { CSS_VAR } from "~/types/tokens";

const FrontendContainer = ({
    children,
    data,
}: {
    children: React.ReactNode;
    data: ModuleConfig;
}) => {
    const theme = data?.data?.advanced?.theme ?? "system";

    useEffect(() => {
        const color = pnpnd.settings?.appearance?.primaryColor ?? "#0061fe";

        const root = document.documentElement;

        root.setAttribute("pnpnd-theme-status", theme);

        root.style.setProperty(CSS_VAR.PRIMARY, color);
    }, [theme]);

    if (!data?.id) return null;

    const isEditor = window.location.hash.includes("#/widget-builder");

    return (
        <>
            {!!pnpnd.currentUser &&
                pnpnd.currentUser?.can?.manageModuleBuilder &&
                !isEditor && (
                    <div className="pnpnd-widget__edit">
                        <Tooltip
                            title={__("Click to Edit", "ninja-drive")}
                            wrap="no-wrap"
                            arrow
                            placement="left"
                        >
                            <IconButton
                                variant="primary"
                                size="small"
                                rounded="md"
                                name="edit"
                                href={`${pnpnd.adminPageUrl}#/widget-builder/${data?.id}/source/my-drive`}
                                target="_blank"
                            />
                        </Tooltip>
                    </div>
                )}

            {children}
        </>
    );
};

export default FrontendContainer;
