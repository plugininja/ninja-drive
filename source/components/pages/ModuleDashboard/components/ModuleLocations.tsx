import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { ShortCodeLocation } from "~/types/widget.types";
import { isValidArray } from "~/utils/helpers";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

const ModuleLocations = ({ locations }: { locations: ShortCodeLocation[] }) => {
    const handleClick = (url: string) => {
        window.open(url, "_blank");
    };

    return (
        <BlockStack padding={5} gap={10}>
            <Text weight="semibold" wrap={false}>
                {__("Shortcode Locations:", "ninja-drive")}
            </Text>

            {!locations ||
                locations === undefined ||
                (locations?.length === 0 && (
                    <Text size="sm" align="center">
                        {__("No locations found", "ninja-drive")}
                    </Text>
                ))}

            <BlockStack gap={5}>
                {isValidArray(locations) &&
                    locations?.map((location, index) => (
                        <InlineStack
                            key={location?.post_id}
                            gap={5}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(location?.url)}
                        >
                            <Text size="sm">{index + 1}.</Text>

                            <Text size="sm">{location?.title}</Text>

                            <Icon name="open_in_new" color="primary" />
                        </InlineStack>
                    ))}
            </BlockStack>
        </BlockStack>
    );
};

export default ModuleLocations;
