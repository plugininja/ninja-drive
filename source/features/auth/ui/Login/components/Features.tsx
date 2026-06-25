import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { GridStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";

const FeatureItem = ({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: string;
}) => (
    <InlineStack gap={16} blockAlign="start" wrap={false}>
        <Card
            padding={10}
            background="primary-extralight"
            rounded="sm"
            flex
            align="center"
            blockAlign="center"
            style={{
                minWidth: "50px",
                width: "50px",
                height: "50px",
                flexShrink: 0,
            }}
        >
            <Icon name={icon} color="primary" fontSize="2xl" />
        </Card>

        <BlockStack gap={6}>
            <Text size="md" weight="semibold" color="gray-800">
                {__(title, "ninja-drive")}
            </Text>
            <Text size="sm" color="gray-600">
                {__(description, "ninja-drive")}
            </Text>
        </BlockStack>
    </InlineStack>
);

const ProFeatureItem = ({ label }: { label: string }) => (
    <InlineStack gap={10} blockAlign="center" wrap={false}>
        <Icon name="check_circle" color="success" fontSize="md" />
        <Text size="sm" color="white">
            {__(label, "ninja-drive")}
        </Text>
    </InlineStack>
);

const Features = () => {
    return (
        <BlockStack gap={0} style={{ width: "100%" }}>
            <Divider marginBottom={52} />

            {/* Section header */}
            <BlockStack
                align="center"
                inlineAlign="center"
                gap={10}
                style={{ marginBottom: "52px" }}
            >
                <Text
                    size="2xl"
                    weight="semibold"
                    color="black"
                    align="center"
                    style={{ marginBottom: "12px" }}
                >
                    {__("Ninja Drive Features", "ninja-drive")}
                </Text>
                <Text size="md" color="gray-600" align="center">
                    {__(
                        "Everything you need to integrate Google Drive with your WordPress site.",
                        "ninja-drive",
                    )}
                </Text>
            </BlockStack>

            {/* Feature grid */}
            <GridStack
                columns={2}
                min="0"
                gap={32}
                style={{ width: "100%", marginBottom: "48px" }}
            >
                {FEATURES.map(({ title, description, icon }, index) => (
                    <FeatureItem
                        key={index}
                        title={title}
                        description={description}
                        icon={icon}
                    />
                ))}
            </GridStack>

            <BlockStack
                align="center"
                inlineAlign="center"
                gap={16}
                style={{ marginBottom: "48px" }}
            >
                <Button
                    style={{ width: "fit-content" }}
                    size="large"
                    variant="primary"
                    startIcon="crown"
                    href={pnpnd.upgrade_url}
                    target="_blank"
                    rel="noreferrer"
                >
                    {__("Explore more features", "ninja-drive")}
                </Button>
            </BlockStack>

            {/* PRO upgrade section */}
            <Card
                padding={32}
                background="gray-900"
                rounded="lg"
                borderStyle="none"
                style={{ width: "100%" }}
            >
                <InlineStack
                    align="between"
                    blockAlign="center"
                    gap={32}
                    wrap={false}
                >
                    {/* Left: pro features list */}
                    <BlockStack gap={20} style={{ flex: 1 }}>
                        <Text size="xl" weight="semibold" color="white">
                            {__("Upgrade to PRO", "ninja-drive")}
                        </Text>

                        <GridStack columns={2} min="0" gap={12}>
                            {PRO_FEATURES.map((label, index) => (
                                <ProFeatureItem key={index} label={label} />
                            ))}
                        </GridStack>
                    </BlockStack>

                    <BlockStack
                        align="center"
                        inlineAlign="center"
                        gap={16}
                        style={{ minWidth: "180px" }}
                    >
                        <Icon name="crown" color="primary" fontSize="4xl" />
                        <Text
                            size="lg"
                            weight="semibold"
                            color="white"
                            align="center"
                        >
                            {__("Go PRO", "ninja-drive")}
                        </Text>
                        <Divider color="gray-700" style={{ width: "60px" }} />
                        <Button
                            variant="primary"
                            size="large"
                            startIcon="crown"
                            full
                            href={pnpnd.upgrade_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {__("Upgrade Now", "ninja-drive")}
                        </Button>
                    </BlockStack>
                </InlineStack>
            </Card>
        </BlockStack>
    );
};

const FEATURES = [
    {
        title: __("One-Click Connection", "ninja-drive"),
        description: __(
            "Connect your Google Drive account in seconds with a single click — no complex configuration required.",
            "ninja-drive",
        ),
        icon: "link",
    },
    {
        title: __("Media Library Integration", "ninja-drive"),
        description: __(
            "Access and manage your Google Drive files directly from the WordPress Media Library interface.",
            "ninja-drive",
        ),
        icon: "folder",
    },
    {
        title: __(
            "WooCommerce | Easy Digital Downloads | Tutor LMS | ",
            "ninja-drive",
        ),
        description: __(
            "Integrate with popular e-commerce and LMS plugins to manage your digital assets.",
            "ninja-drive",
        ),
        icon: "shopping_cart",
    },
    {
        title: __("Automatic Syncing", "ninja-drive"),
        description: __(
            "Keep your content up-to-date automatically — changes in Google Drive reflect instantly on your site.",
            "ninja-drive",
        ),
        icon: "sync",
    },
    {
        title: __("User Access Control | Frontend and Backend", "ninja-drive"),
        description: __(
            "Manage user permissions and control access to your Google Drive files directly from WordPress.",
            "ninja-drive",
        ),
        icon: "cloud_upload",
    },
    {
        title: __("File Uploader | Different Forms Integration", "ninja-drive"),
        description: __(
            "Upload files from your Google Drive directly to your WordPress site with ease.",
            "ninja-drive",
        ),
        icon: "cloud_upload",
    },
    {
        title: __("Embed & Display File list Directly", "ninja-drive"),
        description: __(
            "Embed and display Google Drive files directly on your WordPress pages and posts with ease.",
            "ninja-drive",
        ),
        icon: "grid_view",
    },
    {
        title: __(
            "File Streaming & Download with Media Player Widget",
            "ninja-drive",
        ),
        description: __(
            "Let visitors stream media or download files directly from Google Drive without exposing raw links.",
            "ninja-drive",
        ),
        icon: "download",
    },
    {
        title: __("Secure OAuth Authentication", "ninja-drive"),
        description: __(
            "Your data stays protected with industry-standard OAuth 2.0, keeping credentials safe at all times.",
            "ninja-drive",
        ),
        icon: "shield",
    },
    {
        title: __(
            "Advanced File Browser | Gallery | Slider | Search Box",
            "ninja-drive",
        ),
        description: __(
            "Browse, search, and display your Google Drive files in stunning galleries, sliders, and customizable file browsers.",
            "ninja-drive",
        ),
        icon: "folder_open",
    },
    {
        title: __("Gutenberg Blocks & Elementor Widgets", "ninja-drive"),
        description: __(
            "Insert Drive files into any post or page using purpose-built Gutenberg blocks or Elementor widgets — no shortcodes needed.",
            "ninja-drive",
        ),
        icon: "view_quilt",
    },
    {
        title: __("Shortcode & Widget Support", "ninja-drive"),
        description: __(
            "Embed file galleries and viewers anywhere using flexible shortcodes or classic sidebar widgets.",
            "ninja-drive",
        ),
        icon: "code",
    },
];

const PRO_FEATURES = [
    __("Automatic OAuth Connection", "ninja-drive"),
    __("Multiple Accounts", "ninja-drive"),
    __("User Access Control", "ninja-drive"),
    __("Media Library Integration", "ninja-drive"),
    __("File Uploader", "ninja-drive"),
    __("Advanced File Filtering", "ninja-drive"),
    __("Media Player", "ninja-drive"),
    __("File List", "ninja-drive"),
    __("Search Box", "ninja-drive"),
    __("Form Integration", "ninja-drive"),
    __("Gutenberg & Elementor Blocks", "ninja-drive"),
    __("Priority Support", "ninja-drive"),
];

export default Features;
