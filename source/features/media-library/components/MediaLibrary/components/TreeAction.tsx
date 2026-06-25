import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { File } from "~features/file-browser/types/file.types";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    selectMediaLibrary,
    setBulkSelect,
    setQueryArgs,
} from "~features/media-library/state/mediaLibrarySlice";

const TreeAction = ({
    disabled,
}: {
    files: File[];
    disabled: boolean;
}) => {
    const {
        active_folder,
        selected_folders,
        bulk_select,
        query_args,
    } = useAppSelector(selectMediaLibrary);
    const dispatch = useAppDispatch();

    const deleteEnabled = bulk_select
        ? selected_folders.length > 0
        : !!active_folder;

    return (
        <div>
            <Card
                padding={5}
                background="white"
                flex
                align="between"
                style={{
                    borderRadius: "6px",
                }}
            >
                <InlineStack gap={5}>
                    <Button
                        variant="primary"
                        size="extrasmall"
                        startIcon="cloud_upload"
                        onClick={() => {
                        }}
                        disabled={!active_folder || bulk_select || disabled}
                    >
                        Upload
                    </Button>

                    <Button
                        variant="error"
                        size="extrasmall"
                        startIcon="delete"
                        onClick={() => {
                        }}
                        disabled={!deleteEnabled || disabled}
                    >
                        Delete
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <IconButton
                                variant="secondary"
                                size="extrasmall"
                                name="sort_by_alpha"
                                disabled={disabled}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                right: 0,
                                top: "115%",
                            }}
                        >
                            <BlockStack padding={10} gap={10}>
                                <Text size="md" weight="medium" wrap={false}>
                                    File Order
                                </Text>

                                <BlockStack gap={5}>
                                    <Text color="gray-800" size="sm">
                                        Sort By
                                    </Text>

                                    <SelectBox
                                        style={{
                                            width: "150px",
                                        }}
                                        size="extrasmall"
                                        options={SORT_OPTIONS}
                                        value={[query_args.order_by || "name"]}
                                        onChange={(value) =>
                                            dispatch(
                                                setQueryArgs({
                                                    order_by: value[0],
                                                }),
                                            )
                                        }
                                    />
                                </BlockStack>

                                <BlockStack gap={5}>
                                    <Text color="gray-800" size="sm">
                                        Order By
                                    </Text>

                                    <Card
                                        padding={5}
                                        background="primary-extralight"
                                        flex
                                        align="center"
                                        gap={5}
                                        style={{
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {ORDER_OPTIONS.map((option) => (
                                            <Card
                                                key={option?.key}
                                                padding={8}
                                                rounded="sm"
                                                flex
                                                align="center"
                                                blockAlign="center"
                                                background={
                                                    query_args.order ===
                                                    option?.key
                                                        ? "primary"
                                                        : "white"
                                                }
                                                style={{
                                                    height: "28px",
                                                }}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    dispatch(
                                                        setQueryArgs({
                                                            order: option?.key,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name={option?.icon}
                                                    color={
                                                        query_args.order ===
                                                        option?.key
                                                            ? "white"
                                                            : "black"
                                                    }
                                                />
                                            </Card>
                                        ))}
                                    </Card>
                                </BlockStack>
                            </BlockStack>
                        </Dropdown.Content>
                    </Dropdown>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <IconButton
                                variant="secondary"
                                size="extrasmall"
                                name="more_vert"
                                disabled={disabled}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                right: 0,
                                top: "115%",
                            }}
                        >
                            <Dropdown.MenuItem
                                isActive={bulk_select}
                                onClick={() =>
                                    dispatch(setBulkSelect(!bulk_select))
                                }
                            >
                                <Icon
                                    name="select_all"
                                    color={bulk_select ? "black" : "gray-500"}
                                />
                                Bulk Select
                            </Dropdown.MenuItem>

                            <Dropdown.MenuItem
                                onClick={() => {
                                }}
                            >
                                <Icon name="folder_check_2" color="gray-500" />
                                Add Folder
                            </Dropdown.MenuItem>
                        </Dropdown.Content>
                    </Dropdown>
                </InlineStack>
            </Card>

            <Divider marginTop={10} marginBottom={10} />

            <InlineStack align="between" gap={5}>
                <Text
                    weight="semibold"
                    wrap={false}
                    ellipsis
                    style={{ minWidth: 0 }}
                >
                    Folders
                </Text>

                <InlineStack gap={5} wrap={false}>
                    <Button
                        variant="secondary"
                        size="extrasmall"
                        startIcon="create_new_folder"
                        onClick={() => {
                        }}
                        disabled={bulk_select || !active_folder || disabled}
                    >
                        New Folder
                    </Button>

                    {active_folder && (
                        <IconButton
                            variant="primary"
                            size="extrasmall"
                            name="cached"
                            onClick={() => {
                            }}
                            disabled={disabled}
                        />
                    )}
                </InlineStack>
            </InlineStack>

        </div>
    );
};

export default TreeAction;

export const SORT_OPTIONS: {
    name: string;
    value: "name" | "size" | "created_at" | "updated_at";
}[] = [
    {
        name: "Name",
        value: "name",
    },
    {
        name: "Size",
        value: "size",
    },
    {
        name: "Created At",
        value: "created_at",
    },
    {
        name: "Updated At",
        value: "updated_at",
    },
];

export const ORDER_OPTIONS: {
    key: "ASC" | "DESC";
    icon: string;
}[] = [
    {
        key: "ASC",
        icon: "arrow_warm_up",
    },
    {
        key: "DESC",
        icon: "arrow_cool_down",
    },
];
