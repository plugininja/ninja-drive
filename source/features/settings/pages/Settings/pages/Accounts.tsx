import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { selectSettings } from "~features/settings/state/settingSlice";
import SettingsField from "~/shared/molecules/SettingsField";
import { selectAuth } from "~features/auth/state/authSlice";
import Form from "~features/auth/ui/Login/components/Form";
import ProfileCard from "~/shared/molecules/ProfileCard";
import { noFoundIconSvg, userCan } from "~/kernel/utils";
import { useAppSelector } from "~kernel/store/hooks";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Accordion } from "~/ui/molecules";
import DOCS from "~/kernel/utils/docs";
import { __ } from "@wordpress/i18n";
import { Tabs } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Info } from "~/ui/atoms";

const Accounts = () => {
    const { login_accounts } = useAppSelector(selectAuth);

    const { data } = useAppSelector(selectSettings);

    const { saveAccounts } = useSaveSettings();

    const { connection_type } = data?.accounts || {};

    if (!userCan("accounts_manage") && !userCan("accounts_connect")) {
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
                    {__("Access Denied", "ninja-drive")}
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
                        "You do not have permission to access the accounts.",
                        "ninja-drive",
                    )}
                </Text>
            </BlockStack>
        );
    }

    return (
        <PageContainer compact style={{ margin: "0 auto" }}>
            <SettingsField
                title={
                    userCan("accounts_manage") && (
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Connection Type", "ninja-drive")}
                            </Text>

                            <Info
                                title={
                                    login_accounts?.length! > 0
                                        ? __(
                                              "Connection type cannot be changed after accounts are connected.",
                                              "ninja-drive",
                                          )
                                        : __(
                                              "Select how you want to connect your Google account.",
                                              "ninja-drive",
                                          )
                                }
                            />
                        </InlineStack>
                    )
                }
                docLink={
                    userCan("accounts_manage") ? DOCS?.googleApp : undefined
                }
            >
                {userCan("accounts_manage") && (
                    <>
                        <Tabs
                            size="small"
                            rounded="md"
                            tabRounded="sm"
                            tabs={CONNECTION_TYPE_BUTTONS}
                            active={connection_type || "automatic"}
                            onTabClick={(key) =>
                                saveAccounts("connection_type", key)
                            }
                            disabled={login_accounts?.length! > 0}
                        />

                        <Text color="gray-500" size="xs">
                            {connection_type === "automatic"
                                ? __(
                                      "One Click Sign-in with your Google account using the plugin's default Google App. No configuration needed.",
                                      "ninja-drive",
                                  )
                                : __(
                                      "Create your own Google App and use it to connect your Google account with the plugin.",
                                      "ninja-drive",
                                  )}
                        </Text>

                        {connection_type === "manual" && <Form />}
                    </>
                )}

                <ProfileCard
                    accounts={login_accounts || []}
                    addAccount
                    connection_type={connection_type}
                />
            </SettingsField>

            <Accordion
                defaultOpen
                arrow={false}
                style={{
                    maxWidth: 1024,
                    margin: "0 auto",
                }}
                title={
                    <InlineStack gap={10}>
                        <IconButton
                            variant="light"
                            size="large"
                            rounded="md"
                            name="beenhere"
                            color="primary"
                            border
                            borderColor="primary-light"
                        />

                        <Text color="gray-700" size="lg" weight="medium">
                            {__(
                                "See what happens with your data when you authorize?",
                                "ninja-drive",
                            )}
                        </Text>
                    </InlineStack>
                }
            >
                <BlockStack gap={15}>
                    {AUTHORIZATION_INFO.map(({ title, description }, index) => (
                        <BlockStack
                            key={index}
                            marginTop={index === 1 ? 5 : 0}
                            gap={5}
                        >
                            <Text color="gray-700" weight="medium">
                                {title}
                            </Text>

                            <Description text={description} />
                        </BlockStack>
                    ))}
                </BlockStack>
            </Accordion>
        </PageContainer>
    );
};

export default Accounts;

const CONNECTION_TYPE_BUTTONS: {
    key: "automatic" | "manual";
    title: string;
    icon: string;
}[] = [
    {
        key: "automatic",
        title: __("One Click", "ninja-drive"),
        icon: "sensor_occupied",
    },
    { key: "manual", title: __("Manual", "ninja-drive"), icon: "settings" },
];

const AUTHORIZATION_INFO: {
    title: string;
    description: string;
}[] = [
    {
        title: __("Requested scopes and justification", "ninja-drive"),
        description: __(
            "In order to display your Google Drive cloud files, you have to authorize it with your Google account. The authorization will ask you to grant the application the https://www.googleapis.com/auth/drive scope. The scope is needed to allow the plugin to see, edit, create, and delete all of your Google Drive files and files that are shared with you.",
            "ninja-drive",
        ),
    },
    {
        title: __("Information about the data", "ninja-drive"),
        description: __(
            "The authorization tokens will be stored, encrypted, on your server and is not accessible by any third party. When you use the Application, all communications are strictly between your server and the cloud storage service servers. We do not collect and do not have access to your personal data.",
            "ninja-drive",
        ),
    },
];
