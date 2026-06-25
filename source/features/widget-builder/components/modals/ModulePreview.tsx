import { ModuleConfig } from "~features/widget-builder/types/widget.types";
import { useGetModuleQuery } from "~features/widget-builder/api/widgetApi";
import { useCustomAlert } from "~/shared/molecules/Alert";
import RenderShortcode from "~/frontend/RenderShortcode";
import { store } from "~kernel/store/store";
import { Provider } from "react-redux";
import { Loading } from "~/ui/atoms";
import clsx from "clsx";

interface ModulePreviewContentProps {
    onCancel?: () => void;
    data: ModuleConfig;
}

export function ModulePreviewContent({
    data,
    onCancel,
}: ModulePreviewContentProps) {
    const { data: widgetData, isLoading } = useGetModuleQuery({
        id: data.id,
        is_admin: true,
    });

    if (isLoading) {
        <Loading />;
    }

    return (
        <div
            pnpnd-theme-status={
                widgetData?.data?.widget?.data?.style?.theme || "light"
            }
            className={clsx(
                "pnpnd-top-level-wrapper",
                "pnpnd-widget",
                `pnpnd-${data.type}`,
            )}
        >
            <Provider store={store}>
                <RenderShortcode
                    data={widgetData?.data?.widget as ModuleConfig}
                />
            </Provider>
        </div>
    );
}

export function useModulePreview() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openPreview = ({ data }: ModulePreviewContentProps) => {
        showAlert({
            id: "widget-preview-modal",
            type: "info",
            showIcon: false,
            width: "90vw",
            height: "80vh",
            style: {
                overflow: "auto",
                scrollbarWidth: "none",
            },
            showConfirmButton: false,
            showCancelButton: false,
            html: (
                <ModulePreviewContent
                    data={data}
                    onCancel={() => {
                        closeAlert("widget-preview-modal");
                    }}
                />
            ),
        });
    };

    return { openPreview };
}
