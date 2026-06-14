import { completeStep, useOnboardingStep } from "~/hooks/useOnboardingStep";
import PageContainer from "~/components/molecules/PageContainer";
import StepContent from "~/components/onboarding/StepContent";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import GridStack from "~/components/molecules/GridStack";
import { MODULE_LISTS } from "~/constants/widget";
import { ModuleKey } from "~/types/widget.types";
import Card from "~/components/molecules/Card";
import Status from "~/components/atoms/Status";
import { useState } from "@wordpress/element";
import { toBoolean } from "~/utils/functions";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { __ } from "@wordpress/i18n";

interface ModuleSelectorProps {
    onSelect: (key: string) => void;
    onCancel?: () => void;
}

const SelectorContent = ({ onSelect, onCancel }: ModuleSelectorProps) => {
    const [hoveredKey, setHoveredKey] = useState<ModuleKey | null>(null);

    const { isNextStep } = useOnboardingStep();

    return (
        <PageContainer
            gap={5}
            nodeTitle={
                <InlineStack gap={10}>
                    <Text as="h2" weight="medium" size="lg">
                        {__("Widgets", "ninja-drive")}
                    </Text>

                    {toBoolean(pnpnd?.onboarding) && isNextStep(0) && (
                        <StepContent
                            title={__("Select a widget type", "ninja-drive")}
                            description={__(
                                "Click it to create a new widget Click it to create a new widget Click it to create.",
                                "ninja-drive",
                            )}
                        />
                    )}
                </InlineStack>
            }
            description={__(
                "Select the Widget that you want to use.",
                "ninja-drive",
            )}
            docLink="https://plugininja.com"
        >
            <GridStack columns={2} gap={15} marginTop={15}>
                {MODULE_LISTS.map(
                    ({ key, title, description, icon, statusProps }) => {
                        return (
                            <Card
                                key={key}
                                padding={10}
                                background={
                                    hoveredKey === key ? "primary" : "white"
                                }
                                flex
                                blockAlign="center"
                                gap={8}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredKey(key)}
                                onMouseLeave={() => setHoveredKey(null)}
                                onClick={() => {

                                        onSelect(key);
                                        onCancel?.();

                                        if (toBoolean(pnpnd?.onboarding)) {
                                            completeStep(0);
                                        }
                                }}
                            >
                                <IconButton
                                    variant={
                                        hoveredKey === key ? "white" : "light"
                                    }
                                    size="large"
                                    rounded="md"
                                    name={icon}
                                    color="primary"
                                    borderColor={
                                        hoveredKey === key
                                            ? "primary"
                                            : "primary-light"
                                    }
                                    fontSize="2xl"
                                    style={{
                                        flexShrink: 0,
                                    }}
                                />

                                <BlockStack gap={3}>
                                    <InlineStack gap={10} wrap={false}>
                                        <Text
                                            color={
                                                hoveredKey === key
                                                    ? "white"
                                                    : "black"
                                            }
                                            weight="medium"
                                        >
                                            {title}
                                        </Text>

                                        {statusProps?.isPro && (
                                            <Status.Pro
                                                color={
                                                    hoveredKey === key
                                                        ? "white"
                                                        : "primary"
                                                }
                                            />
                                        )}
                                    </InlineStack>

                                    <Description
                                        color={
                                            hoveredKey === key
                                                ? "white"
                                                : "gray-500"
                                        }
                                        text={description}
                                    />
                                </BlockStack>
                            </Card>
                        );
                    },
                )}
            </GridStack>

            <Card
                padding={5}
                background="error"
                rounded="sm"
                style={{
                    position: "absolute",
                    right: "-27px",
                    top: "-27px",
                    cursor: "pointer",
                    width: "30px",
                    height: "30px",
                }}
                className="flex-center"
                onClick={onCancel}
            >
                <Icon name="close" color="white" />
            </Card>
        </PageContainer>
    );
};

export function useModuleSelector() {
    const { showAlert, closeAlert } = useCustomAlert();

    const open = ({ onSelect }: ModuleSelectorProps) => {
        showAlert({
            id: "widget-selector",
            width: "1024px",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            html: (
                <SelectorContent
                    onCancel={() => {
                        closeAlert("widget-selector");
                    }}
                    onSelect={onSelect}
                />
            ),
        });
    };

    return { open };
}
