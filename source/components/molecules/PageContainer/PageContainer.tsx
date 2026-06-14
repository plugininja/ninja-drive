import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { PageContainerProps } from "./PageContainer.type";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

const PageContainer = ({
    id,
    compact = false,
    style,
    className,
    gap = 15,
    title,
    nodeTitle,
    description,
    docLink,
    widget,
    children,
}: PageContainerProps) => {
    return (
        <BlockStack
            id={id}
            style={{
                ...style,
                ...(widget ? { marginBottom: "80px" } : {}),
                maxWidth: compact ? 1024 : "100%",
            }}
            gap={gap}
            className={className}
        >
            {(title || nodeTitle || description) && (
                <InlineStack gap={5} align="between">
                    <BlockStack gap={10}>
                        <Text as="h2" weight="medium" size="lg">
                            {title}
                        </Text>

                        {nodeTitle && nodeTitle}

                        {description && <Description text={description} />}
                    </BlockStack>

                    {docLink && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon="info"
                            href={docLink}
                            target="_blank"
                        >
                            {__("Documentation", "ninja-drive")}
                        </Button>
                    )}
                </InlineStack>
            )}

            <BlockStack gap={20}>{children}</BlockStack>
        </BlockStack>
    );
};

export default PageContainer;
