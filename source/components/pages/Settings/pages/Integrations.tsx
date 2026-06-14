import {
    classicEditorIcon,
    contactForm7Icon,
    eddIcon,
    elementorFormIcon,
    elementorIcon,
    fluentFormsIcon,
    formidableFormsIcon,
    gravityFormsIcon,
    gutenBergIcon,
    masterStudyLmsIcon,
    mediaLibraryIcon,
    ninjaFormsIcon,
    tutorLmsIcon,
    wooCommerceIcon,
    wpFormsIcon,
} from "~/utils/icons";
import { StatusProps } from "~/components/atoms/Status/Status.type";
import SettingsField from "~/components/molecules/SettingsField";
import { selectSettings } from "~/store/features/settingSlice";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import GridStack from "~/components/molecules/GridStack";
import SelectBox from "~/components/molecules/SelectBox";
import useSaveSettings from "~/hooks/useSaveSettings";
import Switcher from "~/components/atoms/Switcher";
import { SettingsData } from "~/types/settings";
import { useAppSelector } from "~/store/hooks";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import Status from "~/components/atoms/Status";
import useSettings from "~/hooks/useSettings";
import { toBoolean } from "~/utils/functions";
import { useState } from "@wordpress/element";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import Info from "~/components/atoms/Info";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";

const Integrations = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveIntegrations } = useSaveSettings();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const { saveSettings } = useSettings();

    const { active_integrations, media_library } = data?.integrations || {};

    const { folders } = media_library || {};

    const isActive = (key: string) => active_integrations?.includes(key);

    const isPluginActive = (key: string): boolean =>
        (pnpnd as any)?.active_plugins?.[key] !== false;

    const isConfigured = (key: string) => {
        if (["media_library"].includes(key)) {
            return true;
        } else {
            return false;
        }
    };

    const toggleIntegration = (key: string) => {
        if (!isPluginActive(key)) return;

        let newActiveIntegrations = active_integrations || [];

        if (isActive(key)) {
            newActiveIntegrations = newActiveIntegrations.filter(
                (integration) => integration !== key,
            );
        } else {
            newActiveIntegrations = [...newActiveIntegrations, key];
        }

        saveIntegrations("active_integrations", newActiveIntegrations);
    };

    const handleEnableAll = () => {
        const allIntegrationKeys = INTEGRATION_MODULES?.map((integration) => {
            const { key, statusProps } = integration;

            if (
                statusProps?.isComingSoon ||
                (!pnpnd?.is_pro && statusProps?.isPro) ||
                !isPluginActive(key)
            ) {
                return null;
            }

            return key;
        }).filter((key) => key !== null) as string[];

        saveIntegrations("active_integrations", allIntegrationKeys);
    };

    const handleDisableAll = () => {
        saveIntegrations("active_integrations", []);
    };

    const handleConfigure = (key: string) => {
        if (key === "media_library" && toBoolean(pnpnd.is_pro)) {
            PNPNDHelper.openFileSelector({
                fileTypes: ["folder"],
                prevSelectedFiles: folders?.map((file) => ({
                    file_key: file,
                })) as File[],
                onConfirm: (files) => {
                    const save_data = {
                        ...data,
                        integrations: {
                            ...data?.integrations,
                            media_library: {
                                ...data?.integrations?.media_library,
                                folders: files.map((file) => file.file_key),
                            },
                        },
                    };

                    saveSettings(save_data as SettingsData);
                },
                onClose: () => {},
            });
        }
    };

    return (
        <BlockStack gap={10} style={{ maxWidth: "1024px", margin: "0 auto" }}>
            <InlineStack gap={10} align="between">
                <Text color="gray-700" size="lg" weight="medium">
                    {__("Connect With Other Plugins", "ninja-drive")}
                </Text>

                <Button
                    variant="outlined"
                    size="small"
                    startIcon="info"
                    href=""
                    target="_blank"
                >
                    {__("Documentation", "ninja-drive")}
                </Button>
            </InlineStack>

            <SettingsField>
                <InlineStack gap={10} align="between">
                    <SelectBox
                        size="small"
                        style={{
                            width: "180px",
                        }}
                        background="gray-50"
                        color="gray-200"
                        options={[
                            {
                                name: __("All", "ninja-drive"),
                                value: "all",
                            },
                            {
                                name: __("Form", "ninja-drive"),
                                value: "form",
                            },
                            {
                                name: __("WooCommerce", "ninja-drive"),
                                value: "woocommerce",
                            },
                            {
                                name: __("Others", "ninja-drive"),
                                value: "others",
                            },
                        ]}
                        value={[filter]}
                        onChange={(value) => setFilter(String(value[0]))}
                    />

                    <InlineStack gap={10}>
                        <Input
                            size="small"
                            background="gray-50"
                            color="gray-200"
                            placeholder={__(
                                "Search integrations…",
                                "ninja-drive",
                            )}
                            suffix={
                                <Icon
                                    name="search"
                                    color="gray-700"
                                    fontSize="lg"
                                />
                            }
                            value={search}
                            onChange={(value) => setSearch(String(value))}
                            fullWidth={false}
                            customWidth="180px"
                        />

                        <Button
                            variant="gray"
                            size="small"
                            startIcon="blur_on"
                            onClick={handleEnableAll}
                        >
                            {__("Enable All", "ninja-drive")}
                        </Button>

                        <Button
                            variant="error"
                            size="small"
                            startIcon="deselect"
                            onClick={handleDisableAll}
                        >
                            {__("Disable All", "ninja-drive")}
                        </Button>
                    </InlineStack>
                </InlineStack>

                <GridStack columns={2} gap={15}>
                    {INTEGRATION_MODULES.map(
                        ({
                            key,
                            category,
                            title,
    icon: Icon,
    description,
    doc,
    statusProps,
}) => {
    const iconUrl = typeof Icon === "string" ? Icon : "";
                            if (filter !== "all" && category !== filter) {
                                return null;
                            }

                            if (
                                search &&
                                !title
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            ) {
                                return null;
                            }

                            const pluginActive = isPluginActive(key);

                            return (
                                <Card
                                    key={key}
                                    padding={7}
                                    background="gray-50"
                                    border="gray-200"
                                    flex
                                    align="between"
                                    blockAlign="center"
                                    gap={10}
                                    style={
                                        !pluginActive
                                            ? { opacity: 0.6 }
                                            : undefined
                                    }
                                >
                                    <InlineStack gap={10} wrap={false}>
                                        <Card
                                            padding={5}
                                            background="white"
                                            border="gray-200"
                                            rounded="md"
                                            flex
                                            align="center"
                                            blockAlign="center"
                                            style={{
                                                width: "45px",
                                                height: "45px",
                                            }}
                                        >
                                            <img src={iconUrl} alt={title} style={{ width: "28px", height: "28px" }} />
                                        </Card>

                                        <BlockStack gap={3}>
                                            <InlineStack gap={10}>
                                                <Text size="sm" weight="medium">
                                                    {title}
                                                </Text>

                                                <Info title={description} />

                                                {statusProps?.isPro && (
                                                    <Status.Pro />
                                                )}
                                            </InlineStack>

                                            {!pluginActive && (
                                                <Text size="xs" color="error">
                                                    {__(
                                                        "Plugin not installed or inactive",
                                                        "ninja-drive",
                                                    )}
                                                </Text>
                                            )}
                                        </BlockStack>
                                    </InlineStack>

                                    <InlineStack gap={10} wrap={false}>
                                        {isConfigured(key) && pluginActive && (
                                            <Button
                                                variant="outlined"
                                                size="extrasmall"
                                                startIcon="settings"
                                                onClick={() =>
                                                    handleConfigure(key)
                                                }
                                            >
                                                {__("Configure", "ninja-drive")}
                                            </Button>
                                        )}

                                        <Switcher
                                            checked={
                                                isActive(key) && pluginActive
                                            }
                                            disabled={!pluginActive}
                                            onChange={() => {
                                                if (
                                                    statusProps?.isPro &&
                                                    !toBoolean(pnpnd.is_pro)
                                                ) {
                                                    return;
                                                }
                                                toggleIntegration(key);
                                            }}
                                        />
                                    </InlineStack>
                                </Card>
                            );
                        },
                    )}
                </GridStack>
            </SettingsField>
        </BlockStack>
    );
};

export default Integrations;

const INTEGRATION_MODULES: {
    key:
        | "media_library"
        | "classic_editor"
        | "gutenberg"
        | "elementor"
        | "woocommerce"
        | "easy_digital_downloads"
        | "tutor_lms"
        | "elementor_form_upload"
        | "contact_form_7"
        | "wp_forms"
        | "ninja_forms"
        | "fluent_forms"
        | "gravity_form"
        | "formidable_forms"
        | "master_study_lms";
    category: "all" | "form" | "woocommerce" | "others";
    title: string;
    icon: string;
    description: string;
    doc: string;
    statusProps?: StatusProps;
}[] = [
    {
        key: "gutenberg",
        category: "others",
        title: __("Gutenberg Editor", "ninja-drive"),
        icon: gutenBergIcon,
        description: __(
            "Enable Gutenberg Integration to add Google Drive files using 5+ blocks.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.gutenberg,
    },

    {
        key: "elementor",
        category: "others",
        title: __("Elementor", "ninja-drive"),
        icon: elementorIcon,
        description: __(
            "Enable Elementor Integration to add Google Drive files using 5+ widgets.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.elementor,
    },
    {
        key: "contact_form_7",
        category: "form",
        title: __("Contact Form 7", "ninja-drive"),
        icon: contactForm7Icon,
        description: __(
            "Enable Contact Form 7 Integration to upload files to Google Drive.",
            "ninja-drive",
        ),
        doc: DOCS.SETTINGS.integrations.media_library,
    },
];
