import { Text } from "~/ui/atoms";
import { BlockStack } from "../BlockStack";
import { EmptyStateProps } from "./EmptyState.type";
import { Description } from "../Description";

const EmptyState = ({
    id,
    style,
    className,
    icon,
    title,
    description,
    children,
}: EmptyStateProps) => {
    return (
        <BlockStack
            id={id}
            style={style}
            align="center"
            inlineAlign="center"
            gap={10}
            className={className}
        >
            {icon && icon}

            {title && (
                <Text color="gray-700" size="xl" weight="medium">
                    {title}
                </Text>
            )}

            {description && <Description text={description} />}

            {children}
        </BlockStack>
    );
};

export default EmptyState;
