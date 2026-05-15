import {
    CustomAlertProvider,
    useCustomAlert,
} from "~/components/molecules/Alert";
import ModuleBuilder from "../ModuleBuilder/ModuleBuilder";
import { selectAuth } from "~/store/features/authSlice";
import { ModuleConfig } from "~/types/widget.types";
import ErrorBoundary from "~/components/ErrorBoundary";
import { useAppSelector } from "~/store/hooks";
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
import SettingsRoute from "~/Routes/SettingsRoute";
import IconButton from "~/components/molecules/IconButton";

export type ModuleBuilderProps = {
    id?: string;
    rootId?: string;
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
    rootId,
    onClose,
}: ModuleBuilderProps) {
    const { widgetMenu, widgetId } = useParams<{
        widgetId: string;
        widgetMenu: string;
    }>();
    const { activeAccount } = useAppSelector(selectAuth);
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

    if (activeAccount === null)
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
            rootId: props.rootId,
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
                                <AuthRoute skipAuthGuard>
                                    <SettingsRoute>
                                        <Routes>
                                            <Route
                                                path="/widget-builder/:widgetId/:widgetMenu/:menuKey?"
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
