import IconButton from "~/components/molecules/IconButton";
import { useCustomAlert } from "~/components/molecules/Alert";
import GridStack from "~/components/molecules/GridStack";
import PageContainer from "~/components/molecules/PageContainer";
import { MODULE_LISTS } from "~/constants/widget";
import Description from "~/components/molecules/Description";
import { ModuleKey } from "~/types/widget.types";
import { useState } from "@wordpress/element";
import { toBoolean } from "~/utils/functions";
import Card from "~/components/molecules/Card";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";

interface ModuleSelectorProps {
    onSelect: (key: string) => void;
    onCancel?: () => void;
}

const SelectorContent = ({ onSelect, onCancel }: ModuleSelectorProps) => {
    const [hoveredKey, setHoveredKey] = useState<ModuleKey | null>(null);

    return (
        <PageContainer
            gap={5}
            title={__("Widget Type", "ninja-drive")}
            description={__(
                "Select the widget type that you want to use.",
                "ninja-drive",
            )}
            docLink="https://plugininja.com"
        >
            <GridStack columns={"auto-fit"} min="300px" gap={15} marginTop={15}>
                {MODULE_LISTS.map(
                    ({ key, title, description, icon, statusProps }) => {
                        return (
                            <Card
                                key={key}
                                background={
                                    hoveredKey === key ? "primary" : "white"
                                }
                                flex
                                direction="col"
                                align="center"
                                gap={8}
                                statusProps={statusProps}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredKey(key)}
                                onMouseLeave={() => setHoveredKey(null)}
                                onClick={() => {
                                        onSelect(key);
                                        onCancel?.();
                                }}
                            >
                                <IconButton
                                    variant={
                                        hoveredKey === key
                                            ? "white"
                                            : "secondary"
                                    }
                                    size="large"
                                    rounded="md"
                                    name={icon}
                                    color="primary"
                                    fontSize="2xl"
                                    style={{
                                        marginBottom: "5px",
                                    }}
                                />

                                <Text
                                    color={
                                        hoveredKey === key ? "white" : "black"
                                    }
                                    weight="medium"
                                >
                                    {title}
                                </Text>

                                <Description
                                    color={
                                        hoveredKey === key
                                            ? "white"
                                            : "gray-500"
                                    }
                                    text={description}
                                />
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
            width: "70vw",
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
