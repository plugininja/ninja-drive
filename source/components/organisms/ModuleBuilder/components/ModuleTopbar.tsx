import { __ } from "@wordpress/i18n";
import { updateEditData } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import { useModulePreview } from "~/components/organisms/modals/ModulePreview";
import { useCustomAlert } from "~/components/molecules/Alert";
import { TModuleBuilder } from "../ModuleBuilder";
import { MODULE_LISTS } from "~/constants/widget";
import IconButton from "~/components/molecules/IconButton";
import { useNavigate } from "react-router-dom";
import Tooltip from "~/components/atoms/Tooltip";
import Button from "~/components/atoms/Button";
import Topbar from "~/components/molecules/Topbar";
import Input from "~/components/atoms/Input";

const ModuleTopbar = ({
    style,
    onSave,
    onNext,
    isLast,
    onDismiss,
    loading,
    isPopup,
}: TModuleBuilder) => {
    const { editData, isEdited } = useAppSelector(
        (state) => state?.widgetBuilder,
    );

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const { openPreview } = useModulePreview();

    const navigate = useNavigate();

    const getItemTypeInfo = (type: ModuleKey, icon?: boolean) => {
        const widget = MODULE_LISTS?.filter((widget) => widget?.key === type);

        return icon ? widget[0]?.icon : widget[0]?.title;
    };

    const handleBack = () => {
        if (isEdited) {
            showAlert({
                title: "Unsaved Changes",
                text: "You have unsaved changes. Are you sure you want to go back?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Back",
                onConfirm: () => {
                    navigate("/widget-builder");
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

    const back = (
        <Button
            variant="warning"
            startIcon="arrow_back_ios"
            onClick={handleBack}
        >
            Back
        </Button>
    );

    const widget = (
        <Tooltip
            title={
                getItemTypeInfo(editData?.type as ModuleKey) || "File Browser"
            }
            wrap="no-wrap"
            placement="bottom"
            arrow
        >
            <IconButton
                variant="secondary"
                name={
                    getItemTypeInfo(editData?.type as ModuleKey, true) ||
                    "folder"
                }
                color="primary"
                fontSize="2xl"
            />
        </Tooltip>
    );

    const tile = (
        <Input
            value={editData?.title || ""}
            onChange={(value) =>
                dispatch(
                    updateEditData({
                        key: "title",
                        value: String(value),
                    }),
                )
            }
            placeholder="Enter widget name"
            fullWidth={false}
            customWidth="210px"
        />
    );

    const id = editData?.id !== "new" && (
        <Button
            variant="outlined"
            startIcon="content_copy"
            textTransform="none"
            onClick={() => handleCopy(String(editData?.id))}
        >
            [ninja-drive id="{editData?.id}"]
        </Button>
    );

    const discard = (
        <Button
            variant="warning"
            startIcon="history"
            onClick={onDismiss}
            disabled={!isEdited}
        >
            Discard
        </Button>
    );

    const preview = (
        <Button
            variant="outlined"
            startIcon="visibility"
            onClick={() => openPreview({ data: editData as ModuleConfig })}
            disabled={editData?.id === "new" || loading}
        >
            Preview
        </Button>
    );

    const save = (editData?.id !== "new" || isLast) && (
        <Button
            variant="primary"
            startIcon="check"
            onClick={() => onSave("close", editData as ModuleConfig)}
            loading={loading}
            disabled={loading || !isEdited}
        >
            Save & Close
        </Button>
    );

    const next = editData?.id === "new" && !isLast && (
        <Button variant="primary" endIcon="arrow_forward_ios" onClick={onNext}>
            Next
        </Button>
    );

    const closeBtn = (
        <Button variant="error" startIcon="close" onClick={onDismiss}>
            Close
        </Button>
    );

    const leftContents = [widget, tile];

    if (!isPopup) leftContents?.unshift(back);

    let rightContents = [closeBtn, save];

    if (!isPopup) {
        rightContents = [
            id,
            discard,
            preview,
            save,
            next,
        ] as typeof rightContents;
    }

    return (
        <Topbar
            style={style}
            leftContents={leftContents}
            rightContents={rightContents}
        />
    );
};

export default ModuleTopbar;
