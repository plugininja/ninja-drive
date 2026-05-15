import { __ } from "@wordpress/i18n";
import FormidableFormsIcon from "~/assets/icons/FormidableFormsIcon";
import { ElementorFormIcon } from "~/assets/icons/ElementorFormIcon";
import MasterStudyLMSLogo from "~/assets/icons/MasterStudyLMSLogo";
import { WooCommerceIcon } from "~/assets/icons/WooCommerceIcon";
import MediaLibraryIcon from "~/assets/icons/MediaLibraryIcon";
import ContactForm7Icon from "~/assets/icons/ContactForm7Icon";
import { selectSettings } from "~/store/features/settingSlice";
import GravityFormsIcon from "~/assets/icons/GravityFormsIcon";
import FluentFormsIcon from "~/assets/icons/FluentFormsIcon";
import { ElementorIcon } from "~/assets/icons/ElementorIcon";
import { StatusProps } from "~/components/atoms/Status/Status.type";
import NinjaFormsIcon from "~/assets/icons/NinjaFormsIcon";
import { TutorLMSLogo } from "~/assets/icons/TutorLMSLogo";
import GutenBergIcon from "~/assets/icons/GutenBergIcon";
import ClassicEditor from "~/assets/icons/ClassicEditor";
import PageContainer from "~/components/molecules/PageContainer";
import useSaveSettings from "~/hooks/useSaveSettings";
import WPFormsIcon from "~/assets/icons/WPFormsIcon";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import { EDDIcon } from "~/assets/icons/EDDIcon";
import BlockStack from "~/components/molecules/BlockStack";
import { useAppSelector } from "~/store/hooks";
import GridStack from "~/components/molecules/GridStack";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import Card from "~/components/molecules/Card";
import DOCS from "~/utils/docs";

const Integrations = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveIntegrations } = useSaveSettings();

    const { activeIntegrations, mediaLibrary } = data?.integrations || {};

    const isActive = (key: string) => activeIntegrations?.includes(key);

    const isConfigured = (key: string) => {
        if (["mediaLibrary"].includes(key)) {
            return true;
        } else {
            return false;
        }
    };

    const toggleIntegration = (key: string) => {
        let newActiveIntegrations = activeIntegrations || [];

        if (isActive(key)) {
            newActiveIntegrations = newActiveIntegrations.filter(
                (integration) => integration !== key,
            );
        } else {
            newActiveIntegrations = [...newActiveIntegrations, key];
        }

        saveIntegrations("activeIntegrations", newActiveIntegrations);
    };

    return (
        <PageContainer>
            <GridStack columns={2} gap={15}>
                {INTEGRATION_MODULES.map(
                    ({
                        key,
                        title,
                        icon: Icon,
                        description,
                        doc,
                        statusProps,
                    }) => (
                        <Card
                            key={key}
                            padding={12}
                            background="white"
                            statusProps={statusProps}
                        >
                            <InlineStack gap={10}>
                                <Card
                                    padding={5}
                                    rounded="md"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    <Icon />
                                </Card>

                                <BlockStack gap={5}>
                                    <InlineStack gap={10}>
                                        <Text weight="medium">{title}</Text>

                                        <Button
                                            variant={
                                                isActive(key)
                                                    ? "primary"
                                                    : "warning"
                                            }
                                            size="extrasmall"
                                        >
                                            {isActive(key)
                                                ? __("Enabled", "ninja-drive")
                                                : __("Disabled", "ninja-drive")}
                                        </Button>
                                    </InlineStack>

                                    <Description text={description} />
                                </BlockStack>
                            </InlineStack>

                            <Divider marginTop={12} marginBottom={12} />

                            <InlineStack align="between" gap={10}>
                                <InlineStack gap={5}>
                                    <Button
                                        variant="outlined"
                                        size="extrasmall"
                                        startIcon="info"
                                        href={doc}
                                        target="_blank"
                                    >
                                        {__("Docs", "ninja-drive")}
                                    </Button>

                                    {isConfigured(key) && (
                                        <Button
                                            variant="outlined"
                                            size="extrasmall"
                                            startIcon="settings"
                                        >
                                            {__("Configure", "ninja-drive")}
                                        </Button>
                                    )}
                                </InlineStack>

                                <Switcher
                                    checked={isActive(key)}
                                    onChange={() => toggleIntegration(key)}
                                />
                            </InlineStack>
                        </Card>
                    ),
                )}
            </GridStack>
        </PageContainer>
    );
};

export default Integrations;

const INTEGRATION_MODULES: {
    key:
        | "mediaLibrary"
        | "classicEditor"
        | "gutenberg"
        | "elementor"
        | "woocommerce"
        | "easyDigitalDownloads"
        | "tutorLMS"
        | "elementorFormUpload"
        | "contactForm7"
        | "wpForms"
        | "ninjaForms"
        | "fluentForms"
        | "gravityForm"
        | "formidableForms"
        | "masterStudyLMS";
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    description: string;
    doc: string;
    statusProps?: StatusProps;
}[] = [
    {
        key: "gutenberg",
        title: __("Gutenberg Editor", "ninja-drive"),
        icon: GutenBergIcon,
        description: __(
            "Enable Gutenberg Integration to add Google Drive files using 5+ blocks.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.gutenberg,
    },

    {
        key: "elementor",
        title: __("Elementor", "ninja-drive"),
        icon: ElementorIcon,
        description: __(
            "Enable Elementor Integration to add Google Drive files using 5+ widgets.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.elementor,
    },
    {
        key: "contactForm7",
        title: __("Contact Form 7", "ninja-drive"),
        icon: ContactForm7Icon,
        description: __(
            "Enable Contact Form 7 Integration to upload files to Google Drive.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.mediaLibrary,
    },
];
