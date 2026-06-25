import { PopoverPosition } from "~/ui/atoms/Popover/Popover.type";
import { BlockStack, Description } from "~/ui/molecules";
import Popover from "~/ui/atoms/Popover/Popover";
import { Text } from "~/ui/atoms";

const StepContent = ({
    style,
    title,
    description,
    content,
    position = "right-center",
    arrowPosition = "left-center",
}: {
    style?: React.CSSProperties;
    title: string;
    description: string;
    content?: React.ReactNode;
    position?: PopoverPosition;
    arrowPosition?: PopoverPosition;
}) => {
    return (
        <Popover
            style={style}
            position={position}
            arrowPosition={arrowPosition}
            content={
                <BlockStack gap={10}>
                    <Text color="white" size="lg" weight="medium">
                        {title}
                    </Text>

                    <Description color="gray-300" text={description} />

                    {content}
                </BlockStack>
            }
        />
    );
};

export default StepContent;
