import { PageContainerProps } from "./PageContainer.type";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { __ } from "@wordpress/i18n";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";

const PageContainer = ({
    id,
    style,
    className,
    gap = 20,
    title,
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
            }}
            gap={gap}
            className={className}
        >
            {(title || description) && (
                <InlineStack gap={5} align="between">
                    <BlockStack gap={10}>
                        <Text as="h2" weight="semibold" size="lg">
                            {title}
                        </Text>

                        <Description text={description} />
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
