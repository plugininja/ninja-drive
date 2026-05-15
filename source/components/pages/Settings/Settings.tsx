import { Navigate, useNavigate, useParams } from "react-router-dom";
import { selectSettings } from "~/store/features/settingSlice";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { SETTING_MENUS } from "~/constants/settings";
import MainLayout from "~/components/templates/MainLayout";
import InlineStack from "~/components/molecules/InlineStack";
import Integrations from "./pages/Integrations";
import IconButton from "~/components/molecules/IconButton";
import { useAppSelector } from "~/store/hooks";
import Topbar from "~/components/molecules/Topbar";
import { useEffect } from "@wordpress/element";
import useSettings from "~/hooks/useSettings";
import Appearance from "./pages/Appearance";
import Sidebar from "~/components/molecules/Sidebar";
import Advanced from "./pages/Advanced";
import Accounts from "./pages/Accounts";
import Button from "~/components/atoms/Button";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import Tools from "./pages/Tools";
import Card from "~/components/molecules/Card";
import Storage from "~/components/molecules/Storage";
import { selectAuth } from "~/store/features/authSlice";

const Settings = () => {
    const { data, isDirty } = useAppSelector(selectSettings);
    const { activeAccount } = useAppSelector(selectAuth);

    const { menuKey } = useParams();
    const navigate = useNavigate();

    const { saveSettings, isSaving } = useSettings();

    useEffect(() => {
        if (isDirty && data?.tools?.autoSave) saveSettings();
    }, [isDirty]);

    const validMenuKeys = SETTING_MENUS.map((menu) => menu.key);

    if (
        !menuKey ||
        !validMenuKeys.includes(
            menuKey as (typeof SETTING_MENUS)[number]["key"],
        )
    ) {
        return <Navigate to="/settings/accounts" replace />;
    }

    const handleMenuClick = (key: (typeof SETTING_MENUS)[number]["key"]) => {
        navigate(`/settings/${key}`);
    };

    const topbarTitle = (
        <InlineStack gap={10}>
            <IconButton
                variant="secondary"
                rounded="md"
                color="primary"
                name={SETTING_MENUS.find((menu) => menu.key === menuKey)?.icon}
            />

            <Text weight="medium">
                {SETTING_MENUS.find((menu) => menu.key === menuKey)?.title}
            </Text>
        </InlineStack>
    );

    const save = menuKey !== "user-access" && (
        <Button
            variant="primary"
            startIcon="check"
            disabled={!isDirty || isSaving}
            loading={isSaving}
            onClick={() => {
                saveSettings();
            }}
        >
            {__("Save Settings", "ninja-drive")}
        </Button>
    );

    const renderPage = () => {
        const pageComponents: Record<string, JSX.Element> = {
            accounts: <Accounts />,
            advanced: <Advanced />,
            appearance: <Appearance />,
            integrations: <Integrations />,
            tools: <Tools />,
        };

        return pageComponents[menuKey] || null;
    };

    return (
        <MainLayout>
            <Sidebar localStorageKey={STORAGE_KEYS.settingsSidebar}>
                <Sidebar.Menu>
                    {SETTING_MENUS.map((menu) => (
                        <Sidebar.Item
                            key={menu?.key}
                            title={menu?.title}
                            icon={menu?.icon}
                            active={menu?.key === menuKey}
                            statusProps={menu?.statusProps}
                            onClick={() => handleMenuClick(menu?.key)}
                            border={
                                menu?.key === menuKey
                                    ? "primary-extralight"
                                    : "white"
                            }
                            borderStyle={"solid"}
                            rounded="md"
                            iconRounded="md"
                            iconButtonVariant="outlined"
                        />
                    ))}
                </Sidebar.Menu>

                <Sidebar.Bottom>
                    <Card
                        padding={12}
                        background="white"
                        border="primary-extralight"
                        borderStyle="solid"
                    >
                        <Storage
                            total={Number(activeAccount?.storage?.limit)}
                            used={Number(activeAccount?.storage?.usage)}
                        />
                    </Card>

                    <Sidebar.HelpCenter />
                </Sidebar.Bottom>
            </Sidebar>

            <MainLayout.ContentWrapper>
                <Topbar leftContents={[topbarTitle]} rightContents={[save]} />

                <MainLayout.Content>{renderPage()}</MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default Settings;
