import ConfigureTopButton from "./ConfigureTopButton";
import { toBoolean } from "~kernel/utils/functions";
import ShortCodeBlock from "./ShortCodeBlock";
import { BlockStack } from "~/ui/molecules";
import IntroModule from "./IntroModule";
import { store } from "~/kernel/store";
import { Provider } from "react-redux";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import {
    useBlockProps,
    InspectorControls,
    BlockControls,
} from "@wordpress/block-editor";
import {
    PanelBody,
    PanelRow,
    ToolbarGroup,
    ToolbarButton,
} from "@wordpress/components";

type TAttributes = { id?: string; type: string };

export type BlockContainerProps = {
    isPro?: boolean;
    attributes: TAttributes;
    setAttributes: ({ id, type }: TAttributes) => void;
};

const BlockContainer = ({
    attributes,
    setAttributes,
    isPro = true,
}: BlockContainerProps) => {
    const openModal = () => {
        PNPNDHelper.openModuleBuilder({
            root_id: "editor",
            id: attributes?.id || attributes?.type,
            integration: "gutenberg",
            onSave: (key, data) => {
                const { id, type } = data;
                setAttributes({ id, type });
            },
        });
    };

    let handleOpenModal = () => {
        openModal();
    };

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ConfigureTopButton isPro={isPro}>
                        {attributes?.type === "widget" ? (
                            <Provider store={store}>
                                <ShortCodeBlock
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                />
                            </Provider>
                        ) : (
                            <ToolbarButton
                                icon={"admin-generic"}
                                label={__(
                                    "Click to open Widget Builder",
                                    "ninja-drive",
                                )}
                                text={__("Configure", "ninja-drive")}
                                onClick={handleOpenModal}
                            />
                        )}
                    </ConfigureTopButton>
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody
                    title={__("Settings", "ninja-drive")}
                    initialOpen={true}
                >
                    <PanelRow>
                        <ConfigureTopButton isPro={isPro} isOutSide>
                            {attributes?.type === "widget" ? (
                                <Provider store={store}>
                                    <ShortCodeBlock
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                    />
                                </Provider>
                            ) : (
                                <BlockStack gap={10} className="w-full">
                                    <Button
                                        startIcon="settings"
                                        variant="secondary"
                                        onClick={handleOpenModal}
                                    >
                                        {__("Configure", "ninja-drive")}
                                    </Button>

                                    <Provider store={store}>
                                        <ShortCodeBlock
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                        />
                                    </Provider>
                                </BlockStack>
                            )}
                        </ConfigureTopButton>
                    </PanelRow>
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                <IntroModule
                    isPro={isPro}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    openModal={openModal}
                />
            </div>
        </>
    );
};

export default BlockContainer;
