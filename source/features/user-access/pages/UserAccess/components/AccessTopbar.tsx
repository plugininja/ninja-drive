import { InlineStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    UserAccess,
    UserAccessQueryArgs,
} from "~features/user-access/types/userAccess";

const AccessTopbar = ({
    data,
    selectedAccesses,
    setSelectedAccesses,
    onAdd,
    queryArgs,
    setQueryArgs,
}: {
    data: UserAccess[];
    selectedAccesses: UserAccess[];
    setSelectedAccesses: React.Dispatch<React.SetStateAction<UserAccess[]>>;
    onAdd: () => void;
    queryArgs: UserAccessQueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<UserAccessQueryArgs>>;
}) => {

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
                    onChange={(value) => {
                    }}
                />

                {
                    false ? (
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
                    )
                }

                <Button
                    variant="primary"
                    startIcon="add"
                    onClick={() => {
                    }}
                >
                    {__("Add New Access", "ninja-drive")}
                </Button>
            </InlineStack>

            <InlineStack gap={10}>
                <Input
                    placeholder={__("Search for access...", "ninja-drive")}
                    fullWidth={false}
                    suffix={
                        <Icon name="search" color="gray-700" fontSize="lg" />
                    }
                    value={
                        ""
                    }
                    onChange={(value) => {
                    }}
                />

                <SelectBox
                    options={SORT_BY_OPTIONS}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Sort by:", "ninja-drive")}
                        </Text>
                    }
                    value={[queryArgs?.order_by]}
                    onChange={(value) => {
                    }}
                />

                <SelectBox
                    options={SORT_BY_STATUS_OPTIONS}
                    prefix={
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Status:", "ninja-drive")}
                        </Text>
                    }
                    value={[queryArgs?.status]}
                    onChange={(value) => {
                    }}
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
                    onClick={() => {
                    }}
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
