import { Navigate, useNavigate, useParams } from "react-router-dom";
import { selectSettings } from "~/store/features/settingSlice";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import MainLayout from "~/components/templates/MainLayout";
import { SETTING_MENUS } from "~/constants/settings";
import Topbar from "~/components/molecules/Topbar";
import Menus from "~/components/molecules/Menus";
import Integrations from "./pages/Integrations";
import Button from "~/components/atoms/Button";
import { useAppSelector } from "~/store/hooks";
import { useEffect } from "@wordpress/element";
import useSettings from "~/hooks/useSettings";
import Input from "~/components/atoms/Input";
import Appearance from "./pages/Appearance";
import Icon from "~/components/atoms/Icon";
import Logo from "~/components/atoms/Logo";
import Text from "~/components/atoms/Text";
import Advanced from "./pages/Advanced";
import Accounts from "./pages/Accounts";
import { __ } from "@wordpress/i18n";
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

    const search = (
        <Input
            value={""}
            placeholder={__("Search settings…", "ninja-drive")}
            color="gray-200"
            suffix={<Icon name="search" color="gray-700" fontSize="lg" />}
            style={{
                minWidth: "210px",
            }}
        />
    );

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

    const save = menuKey !== "user-access" && (
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
        };

        return pageComponents[menuKey] || null;
    };

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <Topbar
                    leftContents={[logo]}
                    rightContents={[search]}
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
