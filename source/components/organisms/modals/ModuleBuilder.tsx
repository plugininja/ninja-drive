import ModuleBuilder from "../ModuleBuilder/ModuleBuilder";
import IconButton from "~/components/molecules/IconButton";
import { selectAuth } from "~/store/features/authSlice";
import ErrorBoundary from "~/components/ErrorBoundary";
import { ModuleConfig } from "~/types/widget.types";
import SettingsRoute from "~/Routes/SettingsRoute";
import { useAppSelector } from "~/store/hooks";
import { toBoolean } from "~/utils/functions";
import ErrorFallback from "../ErrorFallback";
import AuthRoute from "~/Routes/AuthRoute";
import MainRoute from "~/Routes/MainRoute";
import { Provider } from "react-redux";
import { store } from "~/store/store";
import Login from "../Login/Login";
import {
    MemoryRouter,
    Route,
    Routes,
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    useAddModuleMutation,
    useUpdateModuleMutation,
} from "~/store/api/widgetApi";
import {
    CustomAlertProvider,
    useCustomAlert,
} from "~/components/molecules/Alert";

export type ModuleBuilderProps = {
    id?: string;
    root_id?: string;
    onSave: (key: "stay" | "close", data: ModuleConfig) => void;
    onDismiss?: () => void;
    onClose?: () => void;
    integration?: string;
};

export function BuilderContent({
    onDismiss,
    onSave,
    id,
    integration,
    root_id,
    onClose,
}: ModuleBuilderProps) {
    const { widgetMenu, widget_id } = useParams<{
        widget_id: string;
        widgetMenu: string;
    }>();
    const { active_account } = useAppSelector(selectAuth);
    const [addModule, { isLoading: addLoading }] = useAddModuleMutation();
    const [updateModule, { isLoading: updateLoading }] =
        useUpdateModuleMutation();

    const navigate = useNavigate();

    const handleSaveModule = async (
        key: "stay" | "close",
        data: ModuleConfig,
    ) => {
        try {
            if (typeof data.id === "string") {
                const widgetData: ModuleConfig = {
                    ...data,
                    integration: integration || null,
                };
                const res = await addModule({ data: widgetData }).unwrap();
                if (res.data?.widget) {
                    if (key === "stay") {
                        navigate(
                            `/widget-builder/${res.data?.widget.id}/${widgetMenu}`,
                        );
                    }
                    onSave(key, res.data?.widget);
                }
            } else {
                const res = await updateModule({
                    data,
                    id: data.id,
                    type: "all",
                }).unwrap();
                if (res.data?.widget) {
                    if (key === "stay") {
                        navigate(
                            `/widget-builder/${res.data?.widget.id}/${widgetMenu}`,
                        );
                    }
                    onSave(key, res.data?.widget);
                }
            }
        } catch (error) {
        } finally {
            if (key === "close") onDismiss?.();
        }
    };

    if (active_account === null)
        return (
            <>
                <Login />

                <IconButton
                    variant="error"
                    size="extrasmall"
                    name="close"
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        zIndex: 99999,
                    }}
                    onClick={onClose}
                />
            </>
        );

    return (
        <ErrorBoundary fallback={<ErrorFallback />}>
            <ModuleBuilder
                isPopup
                onSave={handleSaveModule}
                onDismiss={onDismiss}
                loading={addLoading || updateLoading}
            />
        </ErrorBoundary>
    );
}

export function useModuleBuilder() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openModuleBuilder = (props: ModuleBuilderProps) => {
        showAlert({
            root_id: props.root_id,
            id: "pnpnd-widget-builder-modal",
            type: "info",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: "90vw",
            height: "85vh",
            html: (
                <MemoryRouter
                    initialEntries={[
                        `/widget-builder/${props.id}/source/my-drive`,
                    ]}
                >
                    <Provider store={store}>
                        <CustomAlertProvider>
                            <MainRoute>
                                <AuthRoute
                                    skipPermissionGuard={
                                        !toBoolean(pnpnd?.is_pro)
                                    }
                                    skipAuthGuard
                                >
                                    <SettingsRoute>
                                        <Routes>
                                            <Route
                                                path="/widget-builder/:widget_id/:widgetMenu/:menuKey?"
                                                element={
                                                    <BuilderContent
                                                        {...props}
                                                        onDismiss={() => {
                                                            closeAlert(
                                                                "pnpnd-widget-builder-modal",
                                                            );
                                                        }}
                                                        onClose={() => {
                                                            closeAlert(
                                                                "pnpnd-widget-builder-modal",
                                                            );
                                                        }}
                                                    />
                                                }
                                            />
                                        </Routes>
                                    </SettingsRoute>
                                </AuthRoute>
                            </MainRoute>
                        </CustomAlertProvider>
                    </Provider>
                </MemoryRouter>
            ),
        });
    };

    return { openModuleBuilder };
}
