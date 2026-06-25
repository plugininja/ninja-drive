import { ModuleConfig } from "~/features/widget-builder";
import { IconButton } from "~/ui/molecules";
import { Tooltip } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";

const FrontendContainer = ({
    children,
    data,
    setWidgetData,
}: {
    children: React.ReactNode;
    data: ModuleConfig;
    setWidgetData: React.Dispatch<React.SetStateAction<ModuleConfig>>;
}) => {

    if (!data?.id) return null;

    const isEditor = window.location.hash.includes("#/widget-builder");

    return (
        <>
            {!!pnpnd.current_user &&
                pnpnd.current_user?.can?.widgets_manage &&
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
                                href={`${pnpnd.admin_page_url}#/widget-builder/${data?.id}/source/my-drive`}
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
