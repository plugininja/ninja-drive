import { MenuProvider } from "~/components/molecules/ContextMenu";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import { useModuleSelector } from "~/components/organisms/modals/ModuleSelector";
import { useGetModulesQuery } from "~/store/api/widgetApi";
import InlineStack from "~/components/molecules/InlineStack";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { Order, OrderBy } from "~/types/Types";
import ModuleTopbar from "./components/ModuleTopbar";
import NoFoundIcon from "~/assets/icons/NoFoundIcon";
import MainLayout from "~/components/templates/MainLayout";
import Pagination from "./components/Pagination";
import ModuleList from "./components/ModuleList";
import BlockStack from "~/components/molecules/BlockStack";
import EmptyState from "~/components/molecules/EmptyState";
import IconButton from "~/components/molecules/IconButton";
import Topbar from "~/components/molecules/Topbar";
import { useNavigate } from "react-router-dom";
import Button from "~/components/atoms/Button";
import SelectBox from "~/components/molecules/SelectBox";
import { useState } from "@wordpress/element";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

export type TQueryArgs = {
    orderBy: OrderBy;
    order: Order;
    page: number;
    perPage: number;
    type: ModuleKey | "all";
    search: string;
    status: string;
};

const Dashboard = () => {
    const [selectedModules, setSelectedModules] = useState<ModuleConfig[]>([]);

    const navigate = useNavigate();
    const { open } = useModuleSelector();

    const [queryArgs, setQueryArgs] = useState<TQueryArgs>({
        orderBy: "updatedAt",
        order: "DESC",
        page: 1,
        perPage: 10,
        type: "all",
        search: "",
        status: "all",
    });

    const { data, isFetching, isLoading } = useGetModulesQuery({
        orderBy: queryArgs.orderBy,
        order: queryArgs.order,
        page: queryArgs.page,
        perPage: queryArgs.perPage,
        type: queryArgs.type,
        search: queryArgs.search,
        status: "all",
    });

    const widgets = data?.data?.widgets || [];
    const totalPages = data?.data?.totalPages || 1;
    const totalItems = data?.data?.total || 0;

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
                variant="secondary"
                rounded="md"
                name="data_object"
                color="primary"
                fontSize="2xl"
            />

            <Text weight="semibold">{__("Widget Builder", "ninja-drive")}</Text>
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
            {Array.from({ length: queryArgs.perPage }).map((_, idx) => (
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
                    <InlineStack gap={3}>
                        <Text weight="semibold">{__("All Widgets", "ninja-drive")}</Text>

                        <Text size="sm">({totalItems} {__("items", "ninja-drive")})</Text>
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
                            padding={20}
                            className="pnpnd-widget-list"
                        >
                            <EmptyState
                                icon={<NoFoundIcon />}
                                title={__("You have no widgets created yet.", "ninja-drive")}
                                description={__("Get started by creating a new widget.", "ninja-drive")}
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
                                    currentPage={queryArgs?.page}
                                    totalPages={totalPages}
                                    onPageChange={(p) =>
                                        setQueryArgs((prev) => ({
                                            ...prev,
                                            page: p,
                                        }))
                                    }
                                />

                                <SelectBox
                                    placement="top"
                                    options={PAGE_OPTIONS}
                                    value={[String(queryArgs.perPage)]}
                                    onChange={(value) =>
                                        setQueryArgs((prev) => ({
                                            ...prev,
                                            perPage: Number(value[0]),
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

const PAGE_OPTIONS: { name: string; value: string }[] = [
    { name: __("5/Page", "ninja-drive"), value: "5" },
    { name: __("10/Page", "ninja-drive"), value: "10" },
    { name: __("20/Page", "ninja-drive"), value: "20" },
    { name: __("50/Page", "ninja-drive"), value: "50" },
    { name: __("100/Page", "ninja-drive"), value: "100" },
];
