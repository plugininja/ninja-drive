import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import SelectBox from "~/components/molecules/SelectBox";
import { UserAccess } from "~/types/userAccess";
import Button from "~/components/atoms/Button";
import useDebounce from "~/hooks/useDebounce";
import { useState } from "@wordpress/element";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { __ } from "@wordpress/i18n";
import {
    selectUserAccess,
    setQueryArgs,
} from "~/store/features/userAccessSlice";

const AccessTopbar = ({
    data,
    selectedAccesses,
    setSelectedAccesses,
    onAdd,
}: {
    data: UserAccess[];
    selectedAccesses: UserAccess[];
    setSelectedAccesses: React.Dispatch<React.SetStateAction<UserAccess[]>>;
    onAdd: () => void;
}) => {
    const { queryArgs } = useAppSelector(selectUserAccess);

    const [searchTerm, setSearchTerm] = useState(queryArgs?.search || "");

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const allSelected =
        data?.length > 0 && selectedAccesses?.length === data?.length;

    useDebounce(
        () => {
            if (
                !searchTerm ||
                searchTerm.trim() === "" ||
                searchTerm.length < 2
            ) {
                if (queryArgs?.search) dispatch(setQueryArgs({ search: "" }));
                return;
            }
            dispatch(setQueryArgs({ search: String(searchTerm) }));
        },
        [searchTerm],
        300,
    );

    const handleQueryArgs = (args: Partial<typeof queryArgs>) => {
        dispatch(setQueryArgs(args));
    };

    return (
        <InlineStack marginTop={20} gap={10} align="between">
            <InlineStack gap={10}>
                <SelectBox
                    style={{
                        minWidth: "175px",
                    }}
                    options={ROLE_OPTIONS}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Base:", "ninja-drive")}
                        </Text>
                    }
                    value={[queryArgs?.base]}
                    onChange={(value) =>
                        handleQueryArgs({ base: value[0] as "role" | "user" })
                    }
                />

                {allSelected ? (
                    <Button
                        variant="outlined"
                        startIcon="deselect"
                        iconSize="xl"
                        color="primary"
                        startIconColor="primary"
                        onClick={() => setSelectedAccesses([])}
                    >
                        {__("Deselect All", "ninja-drive")}
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        startIcon="select_all"
                        iconSize="xl"
                        color="primary"
                        startIconColor="primary"
                        onClick={() => setSelectedAccesses(data)}
                    >
                        {__("Select All", "ninja-drive")}
                    </Button>
                )}

            </InlineStack>

            <InlineStack gap={10}>
                <Input
                    placeholder={__("Search for access...", "ninja-drive")}
                    fullWidth={false}
                    suffix={
                        <Icon name="search" color="gray-700" fontSize="lg" />
                    }
                    value={searchTerm}
                    onChange={(value) => setSearchTerm(String(value))}
                />

                <SelectBox
                    options={SORT_BY_OPTIONS}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Sort by:", "ninja-drive")}
                        </Text>
                    }
                    value={[queryArgs?.order_by]}
                    onChange={(value) =>
                        handleQueryArgs({
                            order_by: value[0] as typeof queryArgs.order_by,
                        })
                    }
                />

                <SelectBox
                    options={SORT_BY_STATUS_OPTIONS}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Status:", "ninja-drive")}
                        </Text>
                    }
                    value={[queryArgs?.status]}
                    onChange={(value) =>
                        handleQueryArgs({
                            status: value[0] as typeof queryArgs.status,
                        })
                    }
                />

                <Button
                    variant="outlined"
                    startIcon={
                        queryArgs.order === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                    }
                    color="primary"
                    startIconColor="primary"
                    onClick={() =>
                        handleQueryArgs({
                            order: queryArgs.order === "asc" ? "desc" : "asc",
                        })
                    }
                >
                    {queryArgs.order === "asc"
                        ? __("Ascending", "ninja-drive")
                        : __("Descending", "ninja-drive")}
                </Button>
            </InlineStack>
        </InlineStack>
    );
};

export default AccessTopbar;

export const ROLE_OPTIONS: {
    name: string;
    value: "all" | "role" | "user";
}[] = [
    {
        name: __("All", "ninja-drive"),
        value: "all",
    },
    {
        name: __("Role Base", "ninja-drive"),
        value: "role",
    },
    {
        name: __("User Base", "ninja-drive"),
        value: "user",
    },
];

const SORT_BY_OPTIONS: { name: string; value: string }[] = [
    { name: __("ID", "ninja-drive"), value: "id" },
    { name: __("Title", "ninja-drive"), value: "title" },
    { name: __("Created At", "ninja-drive"), value: "created_at" },
    { name: __("Updated At", "ninja-drive"), value: "updated_at" },
];

const SORT_BY_STATUS_OPTIONS: { name: string; value: string }[] = [
    { name: __("All", "ninja-drive"), value: "all" },
    { name: __("Active", "ninja-drive"), value: "active" },
    { name: __("Inactive", "ninja-drive"), value: "inactive" },
];
