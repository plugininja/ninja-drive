import { noFoundIconSvg, userCanViewPage } from "~/kernel/utils";
import SettingsField from "~/shared/molecules/SettingsField";
import AssignFolder from "~/shared/molecules/AssignFolder";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import DOCS from "~/kernel/utils/docs";
import { Switcher } from "~/ui/atoms";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const MediaLibrary = () => {

    if (!userCanViewPage("media_library")) {
        return (
            <BlockStack
                inlineAlign="center"
                align="center"
                gap={24}
                padding={40}
            >
                <img
                    src={noFoundIconSvg}
                    alt=""
                    style={{ width: "200px", height: "200px" }}
                />

                <Text size="2xl" weight="semibold" align="center">
                    {__("No access", "ninja-drive")}
                </Text>

                <Text
                    size="md"
                    align="center"
                    color="gray-600"
                    style={{
                        maxWidth: "800px",
                        lineHeight: "1.5",
                    }}
                >
                    {__(
                        "You do not have permission to access the media library.",
                        "ninja-drive",
                    )}
                </Text>
            </BlockStack>
        );
    }

    return (
        <SettingsField
            compact
            style={{
                margin: "0 auto",
            }}
            onClick={() => {
            }}
        >
            <AssignFolder
                title={__("Assigned Folders", "ninja-drive")}
                description={__(
                    "Select the Google Drive folders to integrate with your WordPress media library. You can assign multiple folders, and they will appear as separate sections within the media library for easy access and organization.",
                    "ninja-drive",
                )}
                selected={
                    []
                }
                onSelect={(folder) => {
                }}
                sync={
                    <Button
                        variant="secondary"
                        size="small"
                        color="primary"
                        style={{
                            backgroundColor: "var(--pnpnd-primary-extralight)",
                        }}
                    >
                        <Icon
                            name="refresh"
                            color="primary"
                            fontSize="lg"
                        />
                        {__("Sync", "ninja-drive")}
                    </Button>
                }
                extraContent={
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon="info"
                        href={DOCS?.SETTINGS?.mediaLibraryIntegration}
                        target="_blank"
                    >
                        {__("Documentation", "ninja-drive")}
                    </Button>
                }
            />

            <Divider width="100%" height="1px" />

            <BlockStack gap={10}>
                <Switcher
                    title={__(
                        "Delete Cloud Files on Attachment Delete",
                        "ninja-drive",
                    )}
                    titleSize="sm"
                />

                <Description
                    text={__(
                        "When enabled, deleting an attachment will also delete the corresponding file from the cloud storage.",
                        "ninja-drive",
                    )}
                />
            </BlockStack>

            <Divider width="100%" height="1px" />

            <BlockStack gap={10}>
                <InlineStack gap={10}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Clear Attachments", "ninja-drive")}
                    </Text>

                    <Button
                        variant="error"
                        size="small"
                        startIcon="cached"
                    >
                        {__("Clear Attachments", "ninja-drive")}
                    </Button>
                </InlineStack>

                <Description
                    text={__(
                        "Remove all Google Drive attachments currently integrated into your media library.",
                        "ninja-drive",
                    )}
                />
            </BlockStack>
        </SettingsField>
    );
};

export default MediaLibrary;
