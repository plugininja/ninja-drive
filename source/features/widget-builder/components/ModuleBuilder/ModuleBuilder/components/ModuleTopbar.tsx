import { useModulePreview } from "~features/widget-builder/components/modals/ModulePreview";
import { useWidgetOnboardingMutation } from "~features/widget-builder/api/widgetApi";
import { useEmbedPage } from "~features/widget-builder/components/modals/EmbedPage";
import { updateEditData } from "~features/widget-builder/state/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import StepContent from "~features/onboarding/StepContent";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { toBoolean } from "~kernel/utils/functions";
import { TModuleBuilder } from "../ModuleBuilder";
import useDevice from "~kernel/hooks/useDevice";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Tooltip } from "~/ui/atoms";
import { Stepper } from "~/ui/atoms";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    completeStep,
    resetSteps,
    useOnboardingStep,
} from "~features/widget-builder/hooks/useOnboardingStep";
import {
    getModuleMenuItems,
    MODULE_LISTS,
} from "~features/widget-builder/constants/widget";
import {
    ModuleConfig,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const ModuleTopbar = ({
    style,
    onSave,
    onNext,
    isFirst,
    isLast,
    onBack,
    onDismiss,
    loading,
    isPopup,
}: TModuleBuilder) => {
    const { edit_data, is_edited } = useAppSelector(
        (state) => state?.widget_builder,
    );
    const [widgetOnboarding] = useWidgetOnboardingMutation();
    const { widget_id, widgetMenu } = useParams();
    const isLargeScreen = useDevice(1420);

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const { openPreview } = useModulePreview();

    const { openEmbedPage } = useEmbedPage();

    const { isNextStep, completedSteps } = useOnboardingStep();

    const navigate = useNavigate();

    const getItemTypeInfo = (type: ModuleKey, icon?: boolean) => {
        const widget = MODULE_LISTS?.filter((widget) => widget?.key === type);

        return icon ? widget[0]?.icon : widget[0]?.title;
    };

    const handleStepClick = (menuId: string) => {
        navigate(`/widget-builder/${widget_id}/${menuId}`);
    };

    const handleBack = () => {
        if (is_edited) {
            showAlert({
                title: "Unsaved Changes",
                text: "You have unsaved changes. Are you sure you want to go back?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Back",
                onConfirm: () => {
                    navigate("/widget-builder");

                    if (toBoolean(pnpnd?.onboarding)) {
                        handleOnboardingStatus(false);
                    }
                },
            });
            return;
        }

        navigate("/widget-builder");
    };

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(`[ninja-drive id="${id}"]`);

        showAlert({
            toast: true,
            type: "success",
            text: "Shortcode copied to clipboard!",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    const getStep = () => {
        if (widgetMenu === "source") {
            return completedSteps?.length === 3;
        } else if (widgetMenu === "configuration") {
            return isNextStep(3);
        } else if (widgetMenu === "style") {
            return isNextStep(4);
        } else if (widgetMenu === "permissions") {
            return isNextStep(5);
        } else if (widgetMenu === "notifications") {
            return false;
        }
    };

    const handleOnboardingStatus = async (status: boolean) => {
        if (!toBoolean(pnpnd?.onboarding)) return;

        try {
            const result = await widgetOnboarding({ status }).unwrap();

            if (result?.data?.status === false) {
                resetSteps();
                (window as any).onboarding = "0";
            }
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text: error?.data?.message || "Something went wrong!",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const embedPage = edit_data?.id !== "new" && (
        <div
            style={{
                position: "relative",
            }}
        >
            <Button variant="primary" startIcon="code" onClick={openEmbedPage}>
                {isLargeScreen ? __("Embed Page", "ninja-drive") : ""}
            </Button>

            {toBoolean(pnpnd?.onboarding) && isNextStep(7) && (
                <StepContent
                    style={{
                        position: "absolute",
                        top: "120%",
                        left: 10,
                    }}
                    title={__("Embed Page", "ninja-drive")}
                    description={__(
                        "Click it to embed the page Click it to embed the page Click it to embed the page.",
                        "ninja-drive",
                    )}
                    position="bottom-right"
                    arrowPosition="top-right"
                />
            )}
        </div>
    );

    const id = edit_data?.id !== "new" && (
        <Button
            variant="outlined"
            startIcon="content_copy"
            textTransform="none"
            onClick={() => handleCopy(String(edit_data?.id))}
        >
            [ninja-drive id="{edit_data?.id}"]
        </Button>
    );

    const discard = (
        <Button
            variant="warning"
            startIcon="history"
            onClick={onDismiss}
            disabled={!is_edited}
        >
            {__("Discard", "ninja-drive")}
        </Button>
    );

    const preview = (
        <Button
            variant="outlined"
            startIcon="visibility"
            onClick={() => openPreview({ data: edit_data as ModuleConfig })}
            disabled={edit_data?.id === "new" || loading}
        >
            {__("Preview", "ninja-drive")}
        </Button>
    );

    const save = (
        <div
            style={{
                position: "relative",
            }}
        >
            <Button
                variant="primary"
                startIcon="check"
                onClick={() => onSave("stay", edit_data as ModuleConfig)}
                loading={loading}
                disabled={
                    loading ||
                    !is_edited ||
                    (edit_data?.id === "new" && !isLast)
                }
            >
                {__("Save Changes", "ninja-drive")}
            </Button>

            {toBoolean(pnpnd?.onboarding) && isNextStep(6) && (
                <StepContent
                    style={{
                        position: "absolute",
                        top: "120%",
                        left: 10,
                    }}
                    title={__("Save", "ninja-drive")}
                    description={__(
                        "Click it to create a new widget Click it to create a new widget Click it to create.",
                        "ninja-drive",
                    )}
                    position="bottom-right"
                    arrowPosition="top-right"
                />
            )}
        </div>
    );

    const initialMenuItems = getModuleMenuItems(edit_data?.type as ModuleKey);

    const shouldShowPermission =
        edit_data?.data?.style?.file_uploader?.upload_preview?.enable;

    const menuItems = initialMenuItems?.filter(
        (menu) =>
            edit_data?.type !== "file_uploader" ||
            menu.key !== "permissions" ||
            shouldShowPermission,
    );

    const currentMenuIndex = menuItems?.findIndex(
        (menu) => menu?.key === widgetMenu,
    );

    const nextMenuItem = menuItems?.[currentMenuIndex + 1];

    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 99999,
            }}
            className="bg-white"
        >
            <InlineStack style={style}>
                <Button
                    color="black"
                    startIcon="chevron_backward"
                    iconSize="2xl"
                    style={{ padding: "20px" }}
                    onClick={() => {
                        if (isPopup) {
                            onDismiss?.();
                        } else {
                            handleBack();
                        }
                    }}
                >
                    {isPopup
                        ? __("Back To Editor", "ninja-drive")
                        : isLargeScreen
                        ? __("Back To Builder", "ninja-drive")
                        : ""}
                </Button>

                <Divider variant="vertical" width="1px" height="80px" />

                <InlineStack
                    padding={20}
                    align="between"
                    gap={10}
                    className="flex-1"
                >
                    <InlineStack
                        style={{
                            position: "relative",
                        }}
                    >
                        <Tooltip
                            title={
                                getItemTypeInfo(edit_data?.type as ModuleKey) ||
                                "File Browser"
                            }
                            wrap="no-wrap"
                            placement="bottom"
                            arrow
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "2px",
                                transform: "translateY(-50%)",
                                zIndex: 1,
                            }}
                        >
                            <IconButton
                                variant="white"
                                name={
                                    getItemTypeInfo(
                                        edit_data?.type as ModuleKey,
                                        true,
                                    ) || "folder"
                                }
                                border
                                borderColor="gray-200"
                                color="primary"
                                fontSize="2xl"
                            />
                        </Tooltip>

                        <Input
                            value={edit_data?.title || ""}
                            placeholder="Enter widget name"
                            fullWidth={false}
                            customWidth="250px"
                            background="gray-50"
                            color="gray-200"
                            style={{
                                paddingLeft: "40px",
                            }}
                            suffix={
                                toBoolean(pnpnd?.onboarding) &&
                                isNextStep(1) && (
                                    <BlockStack style={{ marginRight: "6px" }}>
                                        <StepContent
                                            title={__(
                                                "Give a name",
                                                "ninja-drive",
                                            )}
                                            description={__(
                                                "Click it to create a new widget Click it to create a new widget Click it to create.",
                                                "ninja-drive",
                                            )}
                                            content={
                                                <InlineStack
                                                    align="between"
                                                    gap={10}
                                                    style={{
                                                        marginTop: "7px",
                                                    }}
                                                >
                                                    <Text
                                                        color="gray-300"
                                                        size="sm"
                                                    >
                                                        {completedSteps?.length +
                                                            1}{" "}
                                                        {__(
                                                            "of",
                                                            "ninja-drive",
                                                        )}{" "}
                                                        8
                                                    </Text>

                                                    <Button
                                                        variant="primary"
                                                        size="extrasmall"
                                                        onClick={() =>
                                                            completeStep(1)
                                                        }
                                                    >
                                                        Done
                                                    </Button>
                                                </InlineStack>
                                            }
                                            position="bottom-left"
                                            arrowPosition="top-left"
                                        />
                                    </BlockStack>
                                )
                            }
                            onChange={(value) =>
                                dispatch(
                                    updateEditData({
                                        key: "title",
                                        value: String(value),
                                    }),
                                )
                            }
                        />
                    </InlineStack>

                    <InlineStack gap={10}>
                        {!isPopup && embedPage}

                        {!isPopup && id}

                        {discard}

                        {!isPopup && preview}

                        {save}
                    </InlineStack>
                </InlineStack>
            </InlineStack>

            <Divider width="100%" height="1px" />

            <InlineStack
                gap={20}
                align="between"
                style={{
                    padding: 20,
                }}
            >
                <div
                    style={{
                        opacity: isFirst ? 0 : 1,
                        transition: "opacity 0.3s",
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon="arrow_left_alt"
                        style={{
                            backgroundColor: "var(--pnpnd-gray-50)",
                        }}
                        onClick={onBack}
                        disabled={isFirst}
                    >
                        Back
                    </Button>
                </div>

                <Stepper
                    steps={menuItems?.map((menu) => ({
                        key: menu?.key,
                        title: menu?.title,
                    }))}
                    active={widgetMenu || menuItems?.[0]?.key}
                    onStepperClick={(key) => {
                        handleStepClick(key);

                        if (toBoolean(pnpnd?.onboarding)) {
                            const currentStep =
                                widgetMenu === "source"
                                    ? 2
                                    : widgetMenu === "configuration"
                                    ? 3
                                    : widgetMenu === "style"
                                    ? 4
                                    : widgetMenu === "permissions"
                                    ? 5
                                    : 0;

                            completeStep(currentStep);
                        }
                    }}
                />

                <InlineStack gap={10}>
                    {toBoolean(pnpnd?.onboarding) && getStep() && (
                        <BlockStack style={{ marginRight: "6px" }}>
                            <StepContent
                                key={widgetMenu}
                                title={`${__("Click to next", "ninja-drive")} ${
                                    nextMenuItem?.title || "Embed Page"
                                }`}
                                description={__(
                                    "Click it to create a new widget Click it to create a new widget Click it to create.",
                                    "ninja-drive",
                                )}
                                position="bottom-right"
                                arrowPosition="top-right"
                            />
                        </BlockStack>
                    )}

                    {isLast ? (
                        <Button
                            variant="primary"
                            startIcon="check"
                            onClick={() => {
                                onSave("close", edit_data as ModuleConfig);

                                if (toBoolean(pnpnd?.onboarding)) {
                                    handleOnboardingStatus(false);
                                }
                            }}
                            loading={loading}
                            disabled={loading || !is_edited}
                        >
                            Finish
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            endIcon="arrow_right_alt"
                            onClick={() => {
                                if (
                                    edit_data?.data?.source?.selected_files
                                        ?.length === 0
                                )
                                    return;

                                onNext?.();

                                if (toBoolean(pnpnd?.onboarding)) {
                                    const currentStep =
                                        widgetMenu === "source"
                                            ? 2
                                            : widgetMenu === "configuration"
                                            ? 3
                                            : widgetMenu === "style"
                                            ? 4
                                            : widgetMenu === "permissions"
                                            ? 5
                                            : 0;

                                    completeStep(currentStep);
                                }
                            }}
                            disabled={
                                edit_data?.data?.source?.selected_files
                                    ?.length === 0
                            }
                        >
                            Next
                        </Button>
                    )}
                </InlineStack>
            </InlineStack>

            <Divider width="100%" height="1px" />
        </div>
    );
};

export default ModuleTopbar;
