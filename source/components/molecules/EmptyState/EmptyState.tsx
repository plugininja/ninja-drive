import { EmptyStateProps } from "./EmptyState.type";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import Text from "~/components/atoms/Text";

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
                <Text size="xl" weight="extrabold">
                    {title}
                </Text>
            )}

            {description && <Description text={description} />}

            {children}
        </BlockStack>
    );
};

export default EmptyState;
