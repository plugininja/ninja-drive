import { PopoverPosition } from "~/components/atoms/Popover/Popover.type";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import Popover from "../atoms/Popover/Popover";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

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
