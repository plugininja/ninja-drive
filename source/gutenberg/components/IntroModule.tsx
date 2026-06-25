import { BlockContainerProps } from "./BlockContainer";
import { toBoolean } from "~kernel/utils/functions";
import ShortCodeBlock from "./ShortCodeBlock";
import { BlockStack } from "~/ui/molecules";
import { store } from "~/kernel/store";
import { Provider } from "react-redux";
import DOCS from "~kernel/utils/docs";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import Shortcode from "./Shortcode";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const IntroModule = ({
    isPro = false,
    attributes,
    setAttributes,
    openModal,
}: {
    isPro?: boolean;
    attributes: BlockContainerProps["attributes"];
    setAttributes: BlockContainerProps["setAttributes"];
    openModal: () => void;
}) => {
    const { id, type } = attributes || {};

    const title =
        type === "file_browser"
            ? __("File Browser", "ninja-drive")
            : type === "media_player"
            ? __("Media Player", "ninja-drive")
            : type === "gallery"
            ? __("Gallery", "ninja-drive")
            : type === "slider_carousel"
            ? __("Slider Carousel", "ninja-drive")
            : type === "embed_documents"
            ? __("Embed Documents", "ninja-drive")
            : type === "search_box"
            ? __("Search Box", "ninja-drive")
            : type === "file_list"
            ? __("File List", "ninja-drive")
            : type === "widget"
            ? __("Shortcode Widgets", "ninja-drive")
            : __("Widget", "ninja-drive");

    const iconName =
        type === "file_browser"
            ? "folder"
            : type === "media_player"
            ? "stock_media"
            : type === "gallery"
            ? "imagesmode"
            : type === "slider_carousel"
            ? "slideshow"
            : type === "embed_documents"
            ? "text_compare"
            : type === "search_box"
            ? "feature_search"
            : type === "file_list"
            ? "event_list"
            : type === "widget"
            ? "code"
            : "data_object";

    const isProFeature = isPro && !toBoolean(pnpnd?.is_pro);

    return (
        <>
            {id ? (
                <Provider store={store}>
                    <Shortcode id={id} />
                </Provider>
            ) : (
                <div
                    className="pnpnd-top-level-wrapper"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                >
                    <Card
                        padding={10}
                        background={
                            isProFeature ? "warning-50" : "primary-extralight"
                        }
                        border={isProFeature ? "warning-100" : "primary-light"}
                    >
                        <Card
                            padding={30}
                            background="white"
                            rounded="md"
                            border="white"
                        >
                            <BlockStack
                                gap={10}
                                align="center"
                                inlineAlign="center"
                            >
                                {isProFeature ? (
                                    <Icon
                                        name="crown"
                                        fontSize="6xl"
                                        color="warning"
                                    />
                                ) : (
                                    <Icon
                                        name={iconName}
                                        fontSize="6xl"
                                        color="primary"
                                    />
                                )}

                                <Text as="h3" size="lg" weight="semibold">
                                    {title}
                                </Text>

                                <Text as="p" size="sm">
                                    {isProFeature
                                        ? __(
                                              "Please upgrade to the Pro version to access this feature.",
                                              "ninja-drive",
                                          )
                                        : __(
                                              "Please configure the widget first to display the content.",
                                              "ninja-drive",
                                          )}
                                </Text>

                                {isProFeature ? (
                                    <Button
                                        variant="warning"
                                        size="small"
                                        startIcon="crown"
                                        onClick={() =>
                                            window.open(
                                                DOCS?.SETTINGS?.pricingPage,
                                                "_blank",
                                            )
                                        }
                                    >
                                        {__("Upgrade now", "ninja-drive")}
                                    </Button>
                                ) : type === "widget" ? (
                                    <Provider store={store}>
                                        <ShortCodeBlock
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                        />
                                    </Provider>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="small"
                                        startIcon="settings"
                                        onClick={openModal}
                                    >
                                        {__("Configure", "ninja-drive")}
                                    </Button>
                                )}
                            </BlockStack>
                        </Card>
                    </Card>
                </div>
            )}
        </>
    );
};

export default IntroModule;
