import { SettingsSearch } from "~features/settings/components/SettingsSearch";
import { selectSettings } from "~features/settings/state/settingSlice";
import { SETTING_MENUS } from "~features/settings/constants/settings";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useSettings from "~features/settings/hooks/useSettings";
import { InlineStack, IconButton } from "~/ui/molecules";
import Synchronization from "./pages/Synchronization";
import { useAppSelector } from "~kernel/store/hooks";
import { userCan } from "~kernel/utils/permissions";
import MainLayout from "~/ui/templates/MainLayout";
import MediaLibrary from "./pages/MediaLibrary";
import Integrations from "./pages/Integrations";
import { useEffect } from "@wordpress/element";
import Menus from "~/shared/molecules/Menus";
import Appearance from "./pages/Appearance";
import Advanced from "./pages/Advanced";
import { Topbar } from "~/ui/molecules";
import Accounts from "./pages/Accounts";
import Caching from "./pages/Caching";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Logo } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import Tools from "./pages/Tools";

const Settings = () => {
    const { data, is_dirty } = useAppSelector(selectSettings);

    const { menuKey } = useParams();

    const navigate = useNavigate();

    const { saveSettings, isSaving } = useSettings();

    useEffect(() => {
        if (is_dirty && data?.tools?.auto_save) saveSettings();
    }, [is_dirty]);

    const validMenuKeys = SETTING_MENUS.map((menu) => menu.key);

    if (!userCan("settings_view")) {
        return <Navigate to="/file-browser/my-drive" replace />;
    }

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

    const logo = <Logo />;

    const topbarTitle = (
        <InlineStack gap={10}>
            <IconButton
                variant="outlined"
                rounded="md"
                color="gray-700"
                style={{
                    backgroundColor: "var(--pnpnd-gray-50)",
                }}
                name={SETTING_MENUS.find((menu) => menu.key === menuKey)?.icon}
            />

            <Text color="gray-700" weight="medium">
                {SETTING_MENUS.find((menu) => menu.key === menuKey)?.title}
            </Text>
        </InlineStack>
    );

    const save = menuKey !== "user-access" && userCan("settings_manage") && (
        <Button
            variant="primary"
            startIcon="check"
            disabled={!is_dirty || isSaving}
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
            integrations: <Integrations />,
            appearance: <Appearance />,
            tools: <Tools />,
            "media-library": <MediaLibrary />,
            synchronization: <Synchronization />,
            caching: <Caching />,
        };

        return pageComponents[menuKey] || null;
    };

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <Topbar
                    leftContents={[logo]}
                    rightContents={[<SettingsSearch />]}
                    wrap={false}
                    leftContentsClassName=""
                    zIndex={99999}
                >
                    <Menus
                        menus={SETTING_MENUS}
                        active={menuKey}
                        onMenuClick={(key) =>
                            handleMenuClick(
                                key as (typeof SETTING_MENUS)[number]["key"],
                            )
                        }
                    />
                </Topbar>

                <Topbar
                    padding={15}
                    top="81px"
                    leftContents={[topbarTitle]}
                    rightContents={[save]}
                />

                <MainLayout.Content
                    style={{
                        paddingBottom: "95px",
                    }}
                >
                    {renderPage()}
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default Settings;
