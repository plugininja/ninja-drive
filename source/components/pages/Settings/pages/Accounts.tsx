import { __ } from "@wordpress/i18n";
import { selectSettings } from "~/store/features/settingSlice";
import { selectAuth } from "~/store/features/authSlice";
import PageContainer from "~/components/molecules/PageContainer";
import useSaveSettings from "~/hooks/useSaveSettings";
import SettingsField from "~/components/molecules/SettingsField";
import InlineStack from "~/components/molecules/InlineStack";
import { Accordion } from "~/components/molecules/Accordion";
import Description from "~/components/molecules/Description";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import ProfileCard from "~/components/molecules/ProfileCard";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import { useAppSelector } from "~/store/hooks";
import Form from "~/components/organisms/Login/components/Form";
import Text from "~/components/atoms/Text";

const Accounts = () => {
    const { loginAccounts } = useAppSelector(selectAuth);

    const { data } = useAppSelector(selectSettings);
    const { saveAccounts } = useSaveSettings();

    const { connectionType } = data?.accounts || {};

    return (
        <PageContainer>
            <SettingsField
                title={__("Connection Type", "ninja-drive")}
                description={__("Choose how you want to connect your Google accounts with the plugin.", "ninja-drive")}
            >
                <ButtonGroup
                    background="primary-extralight"
                    buttons={CONNECTION_TYPE_BUTTONS}
                    selectedKey={connectionType || "automatic"}
                    onChange={(value: "automatic" | "manual") =>
                        saveAccounts(
                            "connectionType",
                            value as "automatic" | "manual",
                        )
                    }
                />

                {connectionType === "automatic" ? (
                    <Text as="span" size="xs">
                        {__("One Click Sign-in with your Google account using the plugin's default Google App. No configuration needed.", "ninja-drive")}
                    </Text>
                ) : (
                    <Text as="span" size="xs">
                        {__("Manual Create your own Google App and use it to connect your Google account with the plugin.", "ninja-drive")}
                    </Text>
                )}
                {connectionType === "manual" && <Form />}
                <ProfileCard
                    accounts={loginAccounts || []}
                    addAccount
                    connectionType={connectionType}
                />
            </SettingsField>

            <Accordion
                title={
                    <InlineStack gap={10}>
                        <IconButton
                            variant="secondary"
                            size="large"
                            rounded="full"
                            name="beenhere"
                            color="primary"
                        />

                        <Text size="lg" weight="medium">
                            {__("See what happens with your data when you authorize?", "ninja-drive")}
                        </Text>
                    </InlineStack>
                }
                defaultOpen
            >
                <BlockStack gap={15}>
                    {AUTHORIZATION_INFO.map(({ title, description }, index) => (
                        <BlockStack key={index} gap={5}>
                            <Text weight="medium">{title}</Text>

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
    startIcon: string;
}[] = [
,
    { key: "manual", title: __("Manual", "ninja-drive"), startIcon: "tune" },
];

const AUTHORIZATION_INFO: {
    title: string;
    description: string;
}[] = [
    {
        title: __("Requested scopes and justification", "ninja-drive"),
        description: __("In order to display your Google Drive cloud files, you have to authorize it with your Google account. The authorization will ask you to grant the application the https://www.googleapis.com/auth/drive scope. The scope is needed to allow the plugin to see, edit, create, and delete all of your Google Drive files and files that are shared with you.", "ninja-drive"),
    },
    {
        title: __("Information about the data", "ninja-drive"),
        description: __("The authorization tokens will be stored, encrypted, on your server and is not accessible by any third party. When you use the Application, all communications are strictly between your server and the cloud storage service servers. We do not collect and do not have access to your personal data.", "ninja-drive"),
    },
];
