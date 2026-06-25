import { SORT_BY } from "~/shared/file-views/components/FilesViews/Header";
import { QueryArgs } from "~features/widget-builder/types/widget.types";
import { OrderBy } from "~kernel/types/Types";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";

const Actions = ({
    queryArgs,
    setQueryArgs,
}: {
    queryArgs: QueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<QueryArgs>>;
}) => {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <IconButton variant="outlined" size="small" name="settings" />
            </Dropdown.Trigger>

            <Dropdown.Content
                position={{
                    right: 0,
                    top: "115%",
                }}
                style={{
                    minWidth: "200px",
                }}
            >
                <Dropdown.MenuItem>
                    <BlockStack gap={10}>
                        <Text
                            as="p"
                            size="md"
                            weight="medium"
                            style={{
                                marginBottom: "7px",
                            }}
                        >
                            {__("Appearance", "ninja-drive")}
                        </Text>

                        <Text size="sm" weight="medium">
                            {__("Sort By", "ninja-drive")}
                        </Text>

                        <SelectBox
                            size="small"
                            options={SORT_BY}
                            value={[queryArgs?.order_by]}
                            onChange={(value) =>
                                setQueryArgs({
                                    ...queryArgs,
                                    order_by: value[0] as OrderBy,
                                    page: 1,
                                })
                            }
                        />

                        <Text size="sm" weight="medium">
                            {__("Order", "ninja-drive")}
                        </Text>

                        <Card
                            padding={5}
                            background="primary-extralight"
                            flex
                            align="center"
                            gap={5}
                            rounded="sm"
                        >
                            {ORDER_OPTIONS.map((option) => (
                                <Card
                                    key={option?.key}
                                    padding={6}
                                    rounded="sm"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    background={
                                        queryArgs.order === option?.key
                                            ? "primary"
                                            : "white"
                                    }
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setQueryArgs({
                                            ...queryArgs,
                                            order: option?.key,
                                            page: 1,
                                        })
                                    }
                                >
                                    <Icon
                                        name={option?.icon}
                                        color={
                                            queryArgs.order === option?.key
                                                ? "white"
                                                : "black"
                                        }
                                    />
                                </Card>
                            ))}
                        </Card>

                        <Text size="sm" weight="medium" wrap={false}>
                            {__("Items per page", "ninja-drive")}
                        </Text>

                        <Card
                            padding={5}
                            background="primary-extralight"
                            flex
                            align="center"
                            gap={5}
                            rounded="sm"
                        >
                            {ITEM_PER_PAGE_OPTIONS.map((option) => (
                                <Card
                                    key={option?.count}
                                    padding={6}
                                    rounded="sm"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    background={
                                        Number(queryArgs.per_page) ===
                                        option?.count
                                            ? "primary"
                                            : "white"
                                    }
                                    style={{
                                        width: "40px",
                                    }}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setQueryArgs({
                                            ...queryArgs,
                                            per_page: option?.count,
                                            page: 1,
                                        })
                                    }
                                >
                                    <Text
                                        size="sm"
                                        color={
                                            Number(queryArgs.per_page) ===
                                            option?.count
                                                ? "white"
                                                : "black"
                                        }
                                    >
                                        {option?.count}
                                    </Text>
                                </Card>
                            ))}
                        </Card>
                    </BlockStack>
                </Dropdown.MenuItem>
            </Dropdown.Content>
        </Dropdown>
    );
};

export default Actions;

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

export const ITEM_PER_PAGE_OPTIONS = [
    {
        count: 10,
    },
    {
        count: 25,
    },
    {
        count: 50,
    },
    {
        count: 100,
    },
];
