import { discardChanges } from "~/store/features/widgetBuilderSlice";
import ModuleBuilder from "~/components/organisms/ModuleBuilder/ModuleBuilder";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAlert } from "~/components/molecules/Alert";
import { ModuleConfig } from "~/types/widget.types";
import ErrorBoundary from "~/components/ErrorBoundary";
import ErrorFallback from "~/components/organisms/ErrorFallback";
import { useAppDispatch } from "~/store/hooks";
import { __ } from "@wordpress/i18n";
import {
    useAddModuleMutation,
    useUpdateModuleMutation,
} from "~/store/api/widgetApi";

const Builder = () => {
    const { widgetMenu, widgetId } = useParams<{
        widgetId: string;
        widgetMenu: string;
    }>();

    const [addModule, { isLoading: addLoading }] = useAddModuleMutation();
    const [updateModule, { isLoading: updateLoading }] =
        useUpdateModuleMutation();

    const { showAlert } = useCustomAlert();

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const handleSaveModule = async (
        key: "stay" | "close",
        data: ModuleConfig,
    ) => {
        if (data?.data?.source?.selectedFiles?.length === 0) {
            showAlert({
                toast: true,
                type: "error",
                text: __(
                    "Please select at least one file to proceed.",
                    "ninja-drive",
                ),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        try {
            if (typeof data.id === "string") {
                const res = await addModule({ data }).unwrap();

                showAlert({
                    toast: true,
                    type: "success",
                    text:
                        res?.message ||
                        __(
                            "Widget created successfully.",
                            "ninja-drive",
                        ),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                if (key === "stay") {
                    navigate(
                        `/widget-builder/${res.data?.widget.id}/${widgetMenu}`,
                    );
                } else {
                    navigate("/widget-builder");
                }
            } else {
                if (!data) return;
                await updateModule({
                    id: data.id,
                    data,
                    type: data.type,
                }).unwrap();

                showAlert({
                    toast: true,
                    type: "success",
                    text: __(
                        "Widget updated successfully.",
                        "ninja-drive",
                    ),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                if (key === "close") {
                    navigate("/widget-builder");
                }
            }
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __(
                        "Failed to save widget. Please try again.",
                        "ninja-drive",
                    ),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const onDismiss = () => {
        showAlert({
            type: "warning",
            title: __("Discard", "ninja-drive"),
            text: __("Are you sure you want to discard your changes?", "ninja-drive"),
            showCancelButton: true,
            confirmButtonText: __("Discard", "ninja-drive"),
            onConfirm: async () => {
                try {
                    dispatch(discardChanges());

                    showAlert({
                        toast: true,
                        type: "success",
                        text: __("Changes discarded successfully!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __("Failed to discard changes!", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return (
        <ErrorBoundary fallback={<ErrorFallback />}>
            <ModuleBuilder
                onSave={handleSaveModule}
                onDismiss={onDismiss}
                loading={addLoading || updateLoading}
            />
        </ErrorBoundary>
    );
};

export default Builder;
