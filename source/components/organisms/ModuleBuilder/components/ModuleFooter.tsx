import { ModuleConfig } from "~/types/widget.types";
import InlineStack from "~/components/molecules/InlineStack";
import { useAppSelector } from "~/store/hooks";
import Button from "~/components/atoms/Button";

const ModuleFooter = ({
    style,
    onSave,
    onBack,
    onNext,
    isFirst,
    isLast,
    loading,
}: {
    style?: React.CSSProperties;
    onSave: (key: "stay" | "close", data: ModuleConfig) => void;
    onBack?: () => void;
    onNext?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    loading?: boolean;
}) => {
    const { editData, isEdited } = useAppSelector(
        (state) => state.widgetBuilder,
    );

    return (
        <InlineStack
            padding={20}
            align="between"
            style={{
                ...style,
                position: "absolute",
                bottom: "0px",
                zIndex: 9999,
                width: "100%",
            }}
            className="bg-white"
        >
            <Button
                variant="primary"
                startIcon="arrow_back_ios"
                onClick={onBack}
                disabled={isFirst}
            >
                Back
            </Button>

            {(editData?.id !== "new" || isLast) && (
                <Button
                    variant="primary"
                    startIcon="check"
                    onClick={() => onSave("stay", editData as ModuleConfig)}
                    loading={loading}
                    disabled={!isEdited}
                >
                    Save Changes
                </Button>
            )}

            {isLast ? (
                <Button
                    variant="primary"
                    startIcon="check"
                    onClick={() => onSave("close", editData as ModuleConfig)}
                >
                    Finish
                </Button>
            ) : (
                <Button
                    variant="primary"
                    endIcon="arrow_forward_ios"
                    onClick={onNext}
                >
                    Next
                </Button>
            )}
        </InlineStack>
    );
};

export default ModuleFooter;
