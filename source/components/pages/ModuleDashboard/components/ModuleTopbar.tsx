import { MODULE_LISTS, SORT_BY_OPTIONS } from "~/constants/widget";
import { useDeleteModuleMutation } from "~/store/api/widgetApi";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import SelectBox from "~/components/molecules/SelectBox";
import { ModuleConfig } from "~/types/widget.types";
import Button from "~/components/atoms/Button";
import { useState } from "@wordpress/element";
import useDebounce from "~/hooks/useDebounce";
import { __, sprintf } from "@wordpress/i18n";
import Input from "~/components/atoms/Input";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { TQueryArgs } from "../Dashboard";

const ModuleTopbar = ({
    selectedModules,
    setSelectedModules,
    widgets,
    queryArgs,
    setQueryArgs,
    addModuleButton,
}: {
    widgets: ModuleConfig[];
    selectedModules: ModuleConfig[];
    setSelectedModules: React.Dispatch<React.SetStateAction<ModuleConfig[]>>;
    setQueryArgs: React.Dispatch<React.SetStateAction<TQueryArgs>>;
    queryArgs: TQueryArgs;
    addModuleButton: React.ReactNode;
}) => {
    const [searchText, setSearchText] = useState<string>("");
    const [deleteModule] = useDeleteModuleMutation();

    const { showAlert } = useCustomAlert();

    useDebounce(
        () => {
            setQueryArgs((prev) => ({ ...prev, search: searchText }));
        },
        [searchText],
        800,
    );

    const handleDeleteAll = async () => {
        if (selectedModules.length === 0) return;

        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: sprintf(
                __(
                    "Are you sure want to delete %d selected widgets?",
                    "ninja-drive",
                ),
                selectedModules.length,
            ),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const result = await deleteModule({
                        id: selectedModules.map((item) => item.id),
                    }).unwrap();

                    setQueryArgs((prev) => ({
                        ...prev,
                        page: 1,
                    }));

                    setSelectedModules([]);

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __(
                                "All selected widgets have been deleted!",
                                "ninja-drive",
                            ),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text:
                            error?.data?.message ||
                            __(
                                "Failed to delete selected widgets!",
                                "ninja-drive",
                            ),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const typeOptions = [
        { name: __("All", "ninja-drive"), value: "all" },
        ...MODULE_LISTS.map((item) => ({
            name: item.title,
            value: item.key,
        })),
    ];

    const allSelected =
        selectedModules.length === widgets.length && widgets.length > 0;

    return (
        <InlineStack marginTop={15} align="between" gap={10}>
            <InlineStack gap={5}>
                <SelectBox
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Filter by:", "ninja-drive")}
                        </Text>
                    }
                    style={{
                        width: "270px",
                    }}
                    value={[queryArgs.type]}
                    options={typeOptions}
                    searchable={false}
                    onChange={(value) =>
                        setQueryArgs((prev) => ({
                            ...prev,
                            type: value[0] as any,
                        }))
                    }
                />

                {allSelected ? (
                    <>
                        <Button
                            variant="outlined"
                            startIcon="deselect"
                            iconSize="xl"
                            color="primary"
                            startIconColor="primary"
                            onClick={() => setSelectedModules([])}
                        >
                            {__("Deselect All", "ninja-drive")}
                        </Button>

                        <Button
                            variant="error"
                            startIcon="clear_all"
                            iconSize="xl"
                            onClick={handleDeleteAll}
                        >
                            {__("Delete All", "ninja-drive")}
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outlined"
                        startIcon="select_all"
                        iconSize="xl"
                        color="primary"
                        startIconColor="primary"
                        onClick={() => setSelectedModules(widgets)}
                    >
                        {__("Select All", "ninja-drive")}
                    </Button>
                )}

                {addModuleButton}
            </InlineStack>

            <InlineStack gap={5}>
                <Input
                    type="search"
                    value={searchText}
                    placeholder={__("Search for widgets...", "ninja-drive")}
                    fullWidth={false}
                    customWidth="250px"
                    suffix={
                        <Icon name="search" color="gray-700" fontSize="lg" />
                    }
                    onChange={(val) => setSearchText(val as string)}
                />

                <SelectBox
                    options={SORT_BY_OPTIONS}
                    value={[queryArgs.order_by]}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Sort by:", "ninja-drive")}
                        </Text>
                    }
                    onChange={(value) =>
                        setQueryArgs((prev) => ({
                            ...prev,
                            order_by: value[0] as any,
                        }))
                    }
                />

                <Button
                    variant="outlined"
                    startIcon={
                        queryArgs.order === "ASC"
                            ? "arrow_upward"
                            : "arrow_downward"
                    }
                    color="primary"
                    startIconColor="primary"
                    onClick={() =>
                        setQueryArgs((prev) => ({
                            ...prev,
                            order: queryArgs.order === "ASC" ? "DESC" : "ASC",
                        }))
                    }
                >
                    {queryArgs.order === "ASC"
                        ? __("Ascending", "ninja-drive")
                        : __("Descending", "ninja-drive")}
                </Button>
            </InlineStack>
        </InlineStack>
    );
};

export default ModuleTopbar;
