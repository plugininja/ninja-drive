import { widgetInit, setIsEdited } from "~/store/features/widgetBuilderSlice";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import Configuration from "./pages/Configuration/Configuration";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useCustomAlert } from "~/components/molecules/Alert";
import BlockStack from "~/components/molecules/BlockStack";
import { useGetModuleQuery } from "~/store/api/widgetApi";
import { useNavigate, useParams } from "react-router-dom";
import { getModuleMenuItems } from "~/constants/widget";
import { useEffect, useRef } from "@wordpress/element";
import ErrorBoundary from "~/components/ErrorBoundary";
import ModuleTopbar from "./components/ModuleTopbar";
import Loading from "~/components/atoms/Loading";
import Style from "./pages/Style/Style";
import Source from "./pages/Source";

export type TModuleBuilder = {
    style?: React.CSSProperties;
    onSave: (key: "stay" | "close", data: ModuleConfig) => void;
    onBack?: () => void;
    onNext?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    onDismiss?: () => void;
    loading?: boolean;
    isPopup?: boolean;
};

const ModuleBuilder = ({
    onSave,
    onDismiss,
    loading,
    isPopup,
}: TModuleBuilder) => {
    const { edit_data, is_edited, default_data } = useAppSelector(
        (state) => state?.widget_builder,
    );

    const { widget_id, widgetMenu } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { showAlert } = useCustomAlert();

    const firstRender = useRef(true);

    const { data, isFetching, isLoading, isError, error } = useGetModuleQuery(
        {
            id: widget_id || "new",
            is_admin: true,
        },
        {
            skip: !widget_id,
        },
    );

    useEffect(() => {
        if (!edit_data?.id) return;
        if (
            edit_data?.data?.source?.selected_files?.length === 0 &&
            widgetMenu !== "source"
        ) {
            showAlert({
                toast: true,
                type: "warning",
                text: "Please select at least one file.",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            navigate(`/widget-builder/${widget_id}/source/my-drive`);
            return;
        }
    }, [edit_data?.data?.source?.selected_files, widgetMenu]);

    useEffect(() => {
        if (isError) {
            navigate("/widget-builder");
            showAlert({
                toast: true,
                type: "error",
                text: (error as any)?.data?.message || "An error occurred",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    }, [isError]);

    useEffect(() => {
        dispatch(
            setIsEdited(
                JSON.stringify(default_data) !== JSON.stringify(edit_data),
            ),
        );
    }, [data, edit_data]);

    useEffect(() => {
        if (data) {
            if (!data.data?.widget) return;
            dispatch(widgetInit(data.data?.widget));
        }
    }, [data]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        if (is_edited) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [is_edited]);

    const initialMenuItems = getModuleMenuItems(edit_data?.type as ModuleKey);

    const shouldShowPermission =
        edit_data?.data?.style?.file_uploader?.upload_preview?.enable;

    const menuItems = initialMenuItems?.filter(
        (menu) =>
            edit_data?.type !== "file_uploader" ||
            menu.key !== "permissions" ||
            shouldShowPermission,
    );

    const keys = menuItems?.map((option) => option?.key) || [];
    const currentIndex = keys.indexOf(widgetMenu as any);

    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= keys?.length - 1;

    const handleBack = () => {
        if (isFirst) return;
        const prevKey = keys[currentIndex - 1];
        navigate(`/widget-builder/${widget_id}/${prevKey}`);
    };

    const handleNext = () => {
        const nextKey = keys[currentIndex + 1];
        navigate(`/widget-builder/${widget_id}/${nextKey}`);
    };

    if ((isFetching || isLoading) && firstRender?.current)
        return (
            <BlockStack align="center" inlineAlign="center" className="h-full">
                <Loading />
            </BlockStack>
        );
    firstRender.current = false;

    const renderModuleMenu = () => {
        const moduleComponents: Record<string, JSX.Element> = {
            source: <Source />,
            configuration: <Configuration />,
            style: <Style />,
        };

        return moduleComponents[widgetMenu!] || <Source />;
    };

    if (!edit_data) return null;

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <ErrorBoundary>
                    <ModuleTopbar
                        style={{
                            borderRadius: "0 10px 0 0",
                        }}
                        onBack={handleBack}
                        onDismiss={onDismiss}
                        onSave={onSave}
                        onNext={handleNext}
                        isFirst={isFirst}
                        isLast={isLast}
                        loading={loading}
                        isPopup={isPopup}
                    />
                </ErrorBoundary>

                <MainLayout.Content
                    style={{
                        padding: isPopup
                            ? "20px 20px 215px 20px"
                            : "20px 20px 100px 20px",
                    }}
                >
                    {renderModuleMenu()}
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default ModuleBuilder;
