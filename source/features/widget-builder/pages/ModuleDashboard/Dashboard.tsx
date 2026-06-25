import { useModuleSelector } from "~features/widget-builder/components/modals/ModuleSelector";
import { useGetModulesQuery } from "~features/widget-builder/api/widgetApi";
import { PAGE_OPTIONS, Pagination } from "~/ui/molecules/Pagination";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { useEffect, useState } from "@wordpress/element";
import { Navigate, useNavigate } from "react-router-dom";
import ModuleTopbar from "./components/ModuleTopbar";
import { noFoundIconSvg } from "~kernel/utils/icons";
import { Order, OrderBy } from "~kernel/types/Types";
import { userCan } from "~kernel/utils/permissions";
import MainLayout from "~/ui/templates/MainLayout";
import ModuleList from "./components/ModuleList";
import { SkeletonLoader } from "~/ui/molecules";
import { MenuProvider } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { EmptyState } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Topbar } from "~/ui/molecules";
import DOCS from "~/kernel/utils/docs";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    ModuleConfig,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

export type TQueryArgs = {
    order_by: OrderBy;
    order: Order;
    page: number;
    per_page: number;
    type: ModuleKey | "all";
    search: string;
    status: string;
};

const Dashboard = () => {
    const [selectedModules, setSelectedModules] = useState<ModuleConfig[]>([]);

    const navigate = useNavigate();
    const { open } = useModuleSelector();

    if (!userCan("widgets_manage")) {
        return <Navigate to="/file-browser/my-drive" replace />;
    }

    const [pageArgs, setPageArgs] = useLocalStorage<{
        page: number;
        per_page: number;
    }>("pnpnd_widget_dashboard_page_args", {
        page: 1,
        per_page: 10,
    });

    const [queryArgs, setQueryArgs] = useState<TQueryArgs>({
        order_by: "updated_at",
        order: "DESC",
        page: pageArgs.page,
        per_page: pageArgs.per_page,
        type: "all",
        search: "",
        status: "all",
    });

    const { data, isFetching, isLoading } = useGetModulesQuery({
        order_by: queryArgs.order_by,
        order: queryArgs.order,
        page: pageArgs.page,
        per_page: pageArgs.per_page,
        type: queryArgs.type,
        search: queryArgs.search,
        status: "all",
    });

    const widgets = data?.data?.widgets || [];
    const total_pages = data?.data?.total_pages || 1;
    const totalItems = data?.data?.total || 0;

    useEffect(() => {
        if (!isLoading && !isFetching && data?.data?.widgets?.length === 0) {
            setPageArgs((prev) => ({
                ...prev,
                page: 1,
            }));
        }
    }, [data, isLoading, isFetching]);

    const handleAddNewShortcode = () => {
        open({
            onSelect: (key) => {
                navigate(`/widget-builder/${key}/source/my-drive`);
            },
        });
    };

    const dashboardTitle = (
        <InlineStack gap={10}>
            <IconButton
                variant="white"
                rounded="md"
                name="handyman"
                color="primary"
                border
                borderColor="gray-200"
                fontSize="2xl"
                style={{
                    backgroundColor: "var(--pnpnd-gray-50)",
                }}
            />

            <Text color="gray-700" weight="semibold">
                {__("Widgets Builder", "ninja-drive")}
            </Text>
        </InlineStack>
    );

    const addModule = (
        <Button
            variant="primary"
            startIcon="add"
            onClick={handleAddNewShortcode}
            disabled={isLoading || isFetching}
        >
            {__("Add New Widget", "ninja-drive")}
        </Button>
    );

    const renderSkeletonLoader = () => (
        <BlockStack marginTop={15} className="pnpnd-widget-list">
            {Array.from({ length: pageArgs?.per_page }).map((_, idx) => (
                <SkeletonLoader
                    key={idx}
                    width="100%"
                    height="74px"
                    rounded="none"
                    className="pnpnd-widget-list__loader"
                />
            ))}
        </BlockStack>
    );

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <Topbar
                    leftContents={[dashboardTitle]}
                    rightContents={[addModule]}
                />

                <MainLayout.Content>
                    <InlineStack gap={10} align="between">
                        <InlineStack gap={5}>
                            <Text color="gray-700" weight="semibold">
                                {__("All Widgets", "ninja-drive")}
                            </Text>

                            <Text color="gray-600" size="sm">
                                ({totalItems} {__("items", "ninja-drive")})
                            </Text>
                        </InlineStack>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon="info"
                            href={DOCS?.MODULE_BUILDER?.widgets?.link}
                            target="_blank"
                        >
                            {__("Documentation", "ninja-drive")}
                        </Button>
                    </InlineStack>

                    <ModuleTopbar
                        widgets={widgets}
                        selectedModules={selectedModules}
                        setSelectedModules={setSelectedModules}
                        queryArgs={queryArgs}
                        setQueryArgs={setQueryArgs}
                        addModuleButton={addModule}
                    />

                    {widgets.length === 0 && (!isLoading || !isFetching) && (
                        <BlockStack
                            marginTop={15}
                            padding={30}
                            className="pnpnd-widget-list"
                        >
                            <EmptyState
                                icon={
                                    <img
                                        src={noFoundIconSvg}
                                        alt=""
                                        style={{
                                            width: "200px",
                                            height: "200px",
                                        }}
                                    />
                                }
                                title={__(
                                    "You Haven’t Created Any Widgets",
                                    "ninja-drive",
                                )}
                                description={__(
                                    "Click the button below to add user access.",
                                    "ninja-drive",
                                )}
                            >
                                <Button
                                    variant="primary"
                                    size="medium"
                                    startIcon="add"
                                    onClick={handleAddNewShortcode}
                                >
                                    {__("Add New Widget", "ninja-drive")}
                                </Button>
                            </EmptyState>
                        </BlockStack>
                    )}

                    {(isLoading || isFetching) && renderSkeletonLoader()}

                    {!isLoading && !isFetching && widgets.length > 0 && (
                        <MenuProvider>
                            <ModuleList
                                widgets={widgets}
                                selectedModules={selectedModules}
                                setSelectedModules={setSelectedModules}
                            />
                        </MenuProvider>
                    )}

                    {!isLoading && widgets && widgets.length > 0 && (
                        <BlockStack margin={"15px"}>
                            <InlineStack gap={5} align="center">
                                <Pagination
                                    current_page={pageArgs.page}
                                    total_pages={total_pages}
                                    onPageChange={(p) =>
                                        setPageArgs((prev) => ({
                                            ...prev,
                                            page: p,
                                        }))
                                    }
                                />

                                <SelectBox
                                    placement="top"
                                    options={PAGE_OPTIONS}
                                    value={[String(pageArgs.per_page)]}
                                    onChange={(value) =>
                                        setPageArgs((prev) => ({
                                            ...prev,
                                            per_page: Number(value[0]),
                                            page: 1,
                                        }))
                                    }
                                />
                            </InlineStack>
                        </BlockStack>
                    )}
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default Dashboard;
