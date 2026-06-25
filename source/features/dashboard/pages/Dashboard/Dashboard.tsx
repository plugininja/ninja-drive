import { DASHBOARD_MENUS } from "~features/dashboard/constants/dashboard";
import { dashboardInit } from "~features/dashboard/state/dashboardSlice";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useGetDashboardDataQuery } from "../../api/dashboardApi";
import DownloadLinks from "./pages/DownloadLinks/DownloadLinks";
import CachedFiles from "./pages/CachedFiles/CachedFiles";
import { useEffect, useMemo } from "@wordpress/element";
import ShareLinks from "./pages/ShareLinks/ShareLinks";
import { useAppDispatch } from "~kernel/store/hooks";
import MainLayout from "~/ui/templates/MainLayout";
import Overview from "./pages/overview/Overview";
import Menus from "~/shared/molecules/Menus";
import { BlockStack } from "~/ui/molecules";
import { Topbar } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Loading } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Logo } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";

const Dashboard = () => {
    const { menuKey } = useParams<{
        menuKey: (typeof DASHBOARD_MENUS)[number]["key"];
    }>();

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const {
        data: dashboard_data,
        isLoading,
        isFetching,
    } = useGetDashboardDataQuery({});

    useEffect(() => {
        if (dashboard_data?.data) {
            dispatch(dashboardInit(dashboard_data?.data));
        }
    }, [dashboard_data, isLoading, isFetching]);

    const validMenuKeys = useMemo(
        () => DASHBOARD_MENUS.map((menu) => menu.key),
        [],
    );

    const handleMenuClick = (key: (typeof DASHBOARD_MENUS)[number]["key"]) => {
        navigate(`/dashboard/${key}`);
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

    const renderPage = () => {
        const pageComponents: Record<string, JSX.Element> = {
            overview: <Overview />,
            "cached-files": <CachedFiles />,
            "share-links": <ShareLinks />,
            "download-links": <DownloadLinks />,
        };

        return pageComponents[menuKey!] || null;
    };

    if (isLoading || isFetching) {
        return (
            <BlockStack align="center" inlineAlign="center" className="h-full">
                <Loading />
            </BlockStack>
        );
    }

    if (
        !menuKey ||
        !validMenuKeys.includes(
            menuKey as (typeof DASHBOARD_MENUS)[number]["key"],
        )
    ) {
        return <Navigate to="/dashboard/overview" replace />;
    }

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
                        menus={DASHBOARD_MENUS}
                        active={menuKey}
                        onMenuClick={(key) =>
                            handleMenuClick(
                                key as (typeof DASHBOARD_MENUS)[number]["key"],
                            )
                        }
                    />
                </Topbar>

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

export default Dashboard;
