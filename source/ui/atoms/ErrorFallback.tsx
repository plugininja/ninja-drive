import { BlockStack } from "~/ui/molecules";
import { Button } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";

const ErrorFallback = () => {
    return (
        <BlockStack
            className="h-full"
            align="center"
            inlineAlign="center"
            gap={10}
        >
            <Card padding={20}>
                <BlockStack
                    className="h-full"
                    align="center"
                    inlineAlign="center"
                    gap={10}
                >
                    <h2>{__("Something went wrong 😢", "ninja-drive")}</h2>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                    >
                        {__("Reload page", "ninja-drive")}
                    </Button>
                </BlockStack>
            </Card>
        </BlockStack>
    );
};

export default ErrorFallback;
