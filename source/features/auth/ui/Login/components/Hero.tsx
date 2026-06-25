import RoundedLogo from "~/ui/atoms/Logo/RoundedLogo";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import DOCS from "~kernel/utils/docs";
import { __ } from "@wordpress/i18n";
import { Text } from "~/ui/atoms";

const Hero = () => {
    const username = pnpnd?.current_user?.name || "User";

    return (
        <BlockStack align="center" inlineAlign="center" gap={30}>
            <BlockStack align="center" inlineAlign="center" gap={20}>
                <RoundedLogo />

                <Text size="4xl" weight="semibold" align="center">
                    {__("Welcome", "ninja-drive")} {username}
                </Text>

                <Text color="gray-800" size="lg" align="center">
                    {__(
                        "Ultimate WordPress File Management Solution For Google Drive",
                        "ninja-drive",
                    )}
                </Text>
            </BlockStack>

            <InlineStack align="center" gap={10}>
                {GUIDE_LINE_TAB.map(({ title, icon, link }, index) => (
                    <Card
                        key={index}
                        padding="10px 20px"
                        background="white"
                        border="primary-light"
                        rounded="sm"
                        flex
                        align="center"
                        blockAlign="center"
                        gap={8}
                        style={{
                            width: "fit-content",
                            cursor: "pointer",
                        }}
                        className="hover-extralight"
                        onClick={() => window.open(link, "_blank")}
                    >
                        <Text weight="medium">{title}</Text>
                    </Card>
                ))}
            </InlineStack>
        </BlockStack>
    );
};

export default Hero;

const GUIDE_LINE_TAB = [
    {
        title: __("Documentations", "ninja-drive"),
        icon: "docs",
        link: DOCS.FILE_BROWSER.login.documentationLink,
    },
    {
        title: __("Video Tutorial", "ninja-drive"),
        icon: "animated_images",
        link: DOCS.FILE_BROWSER.login.videoTutorialLink,
    },
    {
        title: __("Live Support", "ninja-drive"),
        icon: "headset_mic",
        link: DOCS.FILE_BROWSER.login.liveSupportLink,
    },
    {
        title: __("See All Features", "ninja-drive"),
        icon: "extension",
        link: DOCS.FILE_BROWSER.login.allFeaturesLink,
    },
];
