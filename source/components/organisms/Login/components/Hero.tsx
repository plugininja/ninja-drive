import RoundedLogo from "~/components/atoms/Logo/RoundedLogo";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import Card from "~/components/molecules/Card";
import Icon from "~/components/atoms/Icon";
import DOCS from "~/utils/docs";

const Hero = () => {
    const username = pnpnd?.currentUser?.name || "User";

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
                        padding={10}
                        background="white"
                        border="primary-light"
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
                        <Card
                            padding={5}
                            background="primary"
                            rounded="sm"
                            flex
                            align="center"
                            blockAlign="center"
                            style={{
                                width: "40px",
                                height: "40px",
                            }}
                        >
                            <Icon name={icon} color="white" fontSize="2xl" />
                        </Card>

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
