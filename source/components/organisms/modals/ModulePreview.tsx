import { useCustomAlert } from "~/components/molecules/Alert";
import { useGetModuleQuery } from "~/store/api/widgetApi";
import RenderShortcode from "~/frontend/RenderShortcode";
import { ModuleConfig } from "~/types/widget.types";
import Loading from "~/components/atoms/Loading";
import { Provider } from "react-redux";
import { store } from "~/store/store";
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
