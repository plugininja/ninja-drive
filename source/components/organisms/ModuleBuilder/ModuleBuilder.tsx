import { widgetInit, setIsEdited } from "~/store/features/widgetBuilderSlice";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useGetModuleQuery } from "~/store/api/widgetApi";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAlert } from "~/components/molecules/Alert";
import { getModuleMenuItems } from "~/constants/widget";
import { useEffect, useRef } from "@wordpress/element";
import ModuleSidebar from "./components/ModuleSidebar";
import ModuleFooter from "./components/ModuleFooter";
import ModuleTopbar from "./components/ModuleTopbar";
import ErrorBoundary from "~/components/ErrorBoundary";
import BlockStack from "~/components/molecules/BlockStack";
import MainLayout from "~/components/templates/MainLayout/MainLayout";
import Loading from "~/components/atoms/Loading";
import Advanced from "./pages/Advanced";
import Source from "./pages/Source";
import Filter from "./pages/Filter";

export type TModuleBuilder = {
    style?: React.CSSProperties;
    onSave: (key: "stay" | "close", data: ModuleConfig) => void;
    onNext?: () => void;
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
    const { editData, isEdited, defaultData } = useAppSelector(
        (state) => state?.widgetBuilder,
    );

    const { widgetId, widgetMenu } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { showAlert } = useCustomAlert();

    const firstRender = useRef(true);

    const { data, isFetching, isLoading, isError, error } = useGetModuleQuery(
        {
            id: widgetId || "new",
            isAdmin: true,
        },
        {
            skip: !widgetId,
        },
    );

    useEffect(() => {
        if (!editData?.id) return;
        if (
            editData?.data?.source?.selectedFiles?.length === 0 &&
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
            navigate(`/widget-builder/${widgetId}/source/my-drive`);
            return;
        }
    }, [editData?.data?.source?.selectedFiles, widgetMenu]);

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
                JSON.stringify(defaultData) !== JSON.stringify(editData),
            ),
        );
    }, [data, editData]);

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
        if (isEdited) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isEdited]);

    const menuItems = getModuleMenuItems(editData?.type as ModuleKey);
    const keys = menuItems?.map((option) => option?.key) || [];
    const currentIndex = keys.indexOf(widgetMenu as any);

    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= keys?.length - 1;

    const handleBack = () => {
        if (isFirst) return;
        const prevKey = keys[currentIndex - 1];
        navigate(`/widget-builder/${widgetId}/${prevKey}`);
    };

    const handleNext = () => {
        const nextKey = keys[currentIndex + 1];
        navigate(`/widget-builder/${widgetId}/${nextKey}`);
    };

    if ((isFetching || isLoading) && firstRender?.current)
        return (
            <BlockStack align="center" inlineAlign="center" className="h-full">
                <Loading />
            </BlockStack>
        );
    firstRender.current = false;

    const renderModuleMenu = () => {
        switch (widgetMenu) {
            case "source":
                return <Source />;
            case "filter":
                return <Filter />;
            case "advanced":
                return <Advanced />;

            default:
                return <Source />;
        }
    };

    if (!editData) return null;
    return (
        <MainLayout>
            <ModuleSidebar />

            <MainLayout.ContentWrapper>
                <ErrorBoundary>
                    <ModuleTopbar
                        style={{
                            borderRadius: "0 10px 0 0",
                        }}
                        onDismiss={onDismiss}
                        onSave={onSave}
                        onNext={handleNext}
                        isLast={isLast}
                        loading={loading}
                        isPopup={isPopup}
                    />
                </ErrorBoundary>

                <MainLayout.Content>{renderModuleMenu()}</MainLayout.Content>

                <ModuleFooter
                    style={{ borderRadius: "0 0 10px 0" }}
                    onSave={onSave}
                    onBack={handleBack}
                    onNext={handleNext}
                    isFirst={isFirst}
                    isLast={isLast}
                    loading={loading}
                />
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default ModuleBuilder;
