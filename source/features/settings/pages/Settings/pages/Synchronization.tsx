import SettingsField from "~/shared/molecules/SettingsField";
import AssignFolder from "~/shared/molecules/AssignFolder";
import { PageContainer } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Disabled } from "~/ui/molecules";
import DOCS from "~kernel/utils/docs";
import { Switcher } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const Synchronization = () => {

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            onClick={() => {
            }}
        >
            <SettingsField
                description={__(
                    "Enable or disable the local cache file auto synchronization with the cloud files.",
                    "ninja-drive",
                )}
                docLink={DOCS.SETTINGS?.synchronization?.link}
                action={
                    <Switcher
                        id="enableAutoSync"
                        isPro={true}
                        title={__("Enable Auto Synchronization", "ninja-drive")}
                        titleSize="sm"
                    />
                }
            >
                <Disabled
                    dependOn="enableAutoSync"
                    gap={15}
                >
                    <AssignFolder
                        title={__("Assigned Folders", "ninja-drive")}
                        description={__(
                            "Select the Google Drive folders to synchronize with your WordPress media library. You can assign multiple folders, and they will be automatically synchronized based on the timer settings below.",
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
                                    backgroundColor:
                                        "var(--pnpnd-primary-extralight)",
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
                    />

                    <BlockStack gap={10}>
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__(
                                    "Select Timer For Auto Synchronization",
                                    "ninja-drive",
                                )}
                            </Text>

                            <SelectBox
                                background="gray-50"
                                color="gray-200"
                                size="small"
                                style={{
                                    width: "200px",
                                }}
                                options={SYNC_CUSTOM_TIMER}
                            />
                        </InlineStack>

                        <Description
                            text={__(
                                "Set how frequently the plugin should automatically synchronize assigned folders with Google Drive.",
                                "ninja-drive",
                            )}
                        />
                    </BlockStack>

                    <Disabled
                    >
                        <BlockStack gap={10}>
                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Select Custom timer", "ninja-drive")}
                                </Text>

                                <Input
                                    type="number"
                                    size="small"
                                    background="gray-50"
                                    color="gray-200"
                                    fullWidth={false}
                                    customWidth="200px"
                                    min={60}
                                    max={2592000}
                                    value={
                                        0
                                    }
                                    onChange={(value) => {
                                    }}
                                />
                            </InlineStack>

                            <Description
                                text={__(
                                    "Enter the custom synchronization interval (min: 60 seconds).",
                                    "ninja-drive",
                                )}
                            />
                        </BlockStack>
                    </Disabled>
                </Disabled>
            </SettingsField>
        </PageContainer>
    );
};

export default Synchronization;

const SYNC_CUSTOM_TIMER: { name: string; value: string }[] = [
    { name: __("5 Minutes", "ninja-drive"), value: "300" },
    { name: __("10 Minutes", "ninja-drive"), value: "600" },
    { name: __("15 Minutes", "ninja-drive"), value: "900" },
    { name: __("30 Minutes", "ninja-drive"), value: "1800" },
    { name: __("1 Hour", "ninja-drive"), value: "3600" },
    { name: __("5 Hours", "ninja-drive"), value: "18000" },
    { name: __("1 Day", "ninja-drive"), value: "86400" },
    { name: __("1 Week", "ninja-drive"), value: "604800" },
    { name: __("Custom", "ninja-drive"), value: "custom" },
];
