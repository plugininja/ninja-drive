import { __ } from "@wordpress/i18n";
import { BlockContainerProps } from "./BlockContainer";
import BlockStack from "~/components/molecules/BlockStack";
import ShortCodeBlock from "./ShortCodeBlock";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import { store } from "../../store/store";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { Provider } from "react-redux";
import Shortcode from "./Shortcode";

const IntroModule = ({
    attributes,
    setAttributes,
    openModal,
}: {
    attributes: BlockContainerProps["attributes"];
    setAttributes: BlockContainerProps["setAttributes"];
    openModal: () => void;
}) => {
    const { id, type } = attributes || {};

    const title =
        type === "file-browser"
            ? __("File Browser", "ninja-drive")
            : type === "media-player"
            ? __("Media Player", "ninja-drive")
            : type === "gallery"
            ? __("Gallery", "ninja-drive")
            : type === "slider-carousel"
            ? __("Slider Carousel", "ninja-drive")
            : type === "embed-documents"
            ? __("Embed Documents", "ninja-drive")
            : type === "search-box"
            ? __("Search Box", "ninja-drive")
            : type === "file-list"
            ? __("File List", "ninja-drive")
            : type === "widget"
            ? __("Shortcode Widgets", "ninja-drive")
            : __("Widget", "ninja-drive");

    const iconName =
        type === "file-browser"
            ? "folder"
            : type === "media-player"
            ? "stock_media"
            : type === "gallery"
            ? "imagesmode"
            : type === "slider-carousel"
            ? "slideshow"
            : type === "embed-documents"
            ? "text_compare"
            : type === "search-box"
            ? "feature_search"
            : type === "file-list"
            ? "event_list"
            : type === "widget"
            ? "code"
            : "data_object";

    return (
        <>
            {id ? (
                <Provider store={store}>
                    <Shortcode id={id} />
                </Provider>
            ) : (
                <div className="pnpnd-top-level-wrapper">
                    <Card padding={30}>
                        <BlockStack
                            gap={10}
                            align="center"
                            inlineAlign="center"
                        >
                            <Icon
                                name={iconName}
                                fontSize="5xl"
                                color="primary"
                            />

                            <Text as="h3" size="lg" weight="semibold">
                                {title}
                            </Text>

                            <Text as="p" size="sm">
                                {__("Please configure the widget first to display the content.", "ninja-drive")}
                            </Text>

                            {type === "widget" ? (
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
                                    onClick={openModal}
                                >
                                    {__("Configure", "ninja-drive")}
                                </Button>
                            )}
                        </BlockStack>
                    </Card>
                </div>
            )}
        </>
    );
};

export default IntroModule;
