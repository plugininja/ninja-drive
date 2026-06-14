import RenderShortcode from "../../frontend/RenderShortcode";
import { useGetModuleQuery } from "~/store/api/widgetApi";
import Loading from "~/components/atoms/Loading";
import { memo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const Shortcode = ({ id }: { id: string }) => {
    const { data, isFetching, isLoading, isError } = useGetModuleQuery(
        {
            id,
        },
        {
            skip: !id,
        },
    );

    if (isFetching || isLoading || !data?.data?.widget) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Loading />
            </div>
        );
    }

    if (isError) {
        return <div>{__("Error loading widget.", "ninja-drive")}</div>;
    }

    return (
        <div
            pnpnd-theme-status={data.data.widget.data.style.theme}
            className={clsx(
                "pnpnd-top-level-wrapper",
                "pnpnd-widget",
                `pnpnd-${data.data.widget.type}`,
            )}
        >
            <RenderShortcode data={data.data?.widget} />
        </div>
    );
};

export default memo(Shortcode);
