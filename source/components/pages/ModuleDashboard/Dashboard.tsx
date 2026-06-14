import { useModuleSelector } from "~/components/organisms/modals/ModuleSelector";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { MenuProvider } from "~/components/molecules/ContextMenu";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import InlineStack from "~/components/molecules/InlineStack";
import MainLayout from "~/components/templates/MainLayout";
import { useGetModulesQuery } from "~/store/api/widgetApi";
import BlockStack from "~/components/molecules/BlockStack";
import EmptyState from "~/components/molecules/EmptyState";
import IconButton from "~/components/molecules/IconButton";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import SelectBox from "~/components/molecules/SelectBox";
import { useEffect, useState } from "@wordpress/element";
import ModuleTopbar from "./components/ModuleTopbar";
import { noFoundIconSvg } from "~/utils/icons";
import Topbar from "~/components/molecules/Topbar";
import Pagination from "./components/Pagination";
import ModuleList from "./components/ModuleList";
import { useNavigate } from "react-router-dom";
import Button from "~/components/atoms/Button";
import { Order, OrderBy } from "~/types/Types";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

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

    const [page, setPage] = useLocalStorage("pnpnd_widget_dashboard_page", 1);
    const [perPage, setPerPage] = useLocalStorage(
        "pnpnd_widget_dashboard_per_page",
        10,
    );

    const [queryArgs, setQueryArgs] = useState<TQueryArgs>({
        order_by: "updated_at",
        order: "DESC",
        page: page,
        per_page: perPage,
        type: "all",
        search: "",
        status: "all",
    });

    const { data, isFetching, isLoading } = useGetModulesQuery({
        order_by: queryArgs.order_by,
        order: queryArgs.order,
        page: page,
        per_page: perPage,
        type: queryArgs.type,
        search: queryArgs.search,
        status: "all",
    });

    const widgets = data?.data?.widgets || [];
    const total_pages = data?.data?.total_pages || 1;
    const totalItems = data?.data?.total || 0;

    useEffect(() => {
        if (!isLoading && !isFetching) {
            if (widgets?.length === 0 && totalItems > 0) {
                setPage(1);
            }
        }
    }, [data]);

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
            {Array.from({ length: perPage }).map((_, idx) => (
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
                            href=""
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
                                icon={<img src={noFoundIconSvg} alt="" style={{ width: "200px", height: "200px" }} />}
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
                                isPro={totalItems >= 5}
                            />
                        </MenuProvider>
                    )}

                    {!isLoading && widgets && widgets.length > 0 && (
                        <BlockStack margin={"15px"}>
                            <InlineStack gap={5} align="center">
                                <Pagination
                                    current_page={page}
                                    total_pages={total_pages}
                                    onPageChange={(p) => setPage(p)}
                                />

                                <SelectBox
                                    placement="top"
                                    options={PAGE_OPTIONS}
                                    value={[String(perPage)]}
                                    onChange={(value) =>
                                        setPerPage(Number(value[0]))
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

export const PAGE_OPTIONS: { name: string; value: string }[] = [
    { name: __("5/Page", "ninja-drive"), value: "5" },
    { name: __("10/Page", "ninja-drive"), value: "10" },
    { name: __("20/Page", "ninja-drive"), value: "20" },
    { name: __("50/Page", "ninja-drive"), value: "50" },
    { name: __("100/Page", "ninja-drive"), value: "100" },
];
