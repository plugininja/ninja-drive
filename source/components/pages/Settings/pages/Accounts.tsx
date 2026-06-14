import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import Form from "~/components/organisms/Login/components/Form";
import { selectSettings } from "~/store/features/settingSlice";
import InlineStack from "~/components/molecules/InlineStack";
import { Accordion } from "~/components/molecules/Accordion";
import Description from "~/components/molecules/Description";
import ProfileCard from "~/components/molecules/ProfileCard";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import { selectAuth } from "~/store/features/authSlice";
import useSaveSettings from "~/hooks/useSaveSettings";
import { useAppSelector } from "~/store/hooks";
import Tabs from "~/components/atoms/Tabs";
import Text from "~/components/atoms/Text";
import Info from "~/components/atoms/Info";
import { __ } from "@wordpress/i18n";

const Accounts = () => {
    const { login_accounts } = useAppSelector(selectAuth);

    const { data } = useAppSelector(selectSettings);

    const { saveAccounts } = useSaveSettings();

    const { connection_type } = data?.accounts || {};
    return (
        <PageContainer compact style={{ margin: "0 auto" }}>
            <SettingsField
                title={
                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Connection Type", "ninja-drive")}
                        </Text>

                        <Info
                            title={__(
                                "Select how you want to connect your Google account.",
                                "ninja-drive",
                            )}
                        />
                    </InlineStack>
                }
            >
                <Tabs
                    size="small"
                    rounded="md"
                    tabRounded="sm"
                    tabs={CONNECTION_TYPE_BUTTONS}
                    active={connection_type || "automatic"}
                    onTabClick={(key) => saveAccounts("connection_type", key)}
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
