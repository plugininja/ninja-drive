import { UserAccess } from "~features/user-access/types/userAccess";
import { noFoundIconSvg } from "~kernel/utils/icons";
import { SkeletonLoader } from "~/ui/molecules";
import { useNavigate } from "react-router-dom";
import { useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { EmptyState } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { Switcher } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const AccessList = ({
    data,
    selectedAccesses,
    setSelectedAccesses,
    onAdd,
    loading,
    per_page,
}: {
    data: UserAccess[];
    selectedAccesses: UserAccess[];
    setSelectedAccesses: React.Dispatch<React.SetStateAction<UserAccess[]>>;
    onAdd: () => void;
    loading: boolean;
    per_page?: number;
}) => {
    const FLEX_VALUES = ["0.3", "0.5", "2", "2", "1", "1", "0.5"];

    const navigate = useNavigate();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");

    const allSelected =
        data?.length > 0 && selectedAccesses?.length === data?.length;

    const handleSelectAll = () => {
        if (selectedAccesses?.length === data?.length) {
            setSelectedAccesses([]);
        } else {
            setSelectedAccesses(data);
        }
    };

    const handleSelect = (accessData: UserAccess) => {
        const isSelected = selectedAccesses?.some(
            (item) => item.id === accessData.id,
        );
        if (isSelected) {
            setSelectedAccesses(
                (prev) => prev?.filter((item) => item.id !== accessData.id),
            );
        } else {
            setSelectedAccesses((prev) => [...prev, accessData]);
        }
    };

    let emptyContent: React.ReactNode;
    let listContent: React.ReactNode;

    const handleUpdate = async (
        field: keyof UserAccess,
        accessData: UserAccess,
    ) => {
    };

    const handleDelete = (ids: number[]) => {
    };

    emptyContent = (
        <BlockStack margin="40px 0" gap={20} className="flex-center">
            <EmptyState
                icon={
                    <img
                        src={noFoundIconSvg}
                        alt=""
                        style={{ width: "200px", height: "200px" }}
                    />
                }
                title={__("No User Access Found", "ninja-drive")}
            />

            <Button variant="primary" startIcon="add" onClick={onAdd}>
                {__("Add New Access", "ninja-drive")}
            </Button>
        </BlockStack>
    );

    if (!loading && data?.length > 0) {
        listContent = data?.map((accessData, index) => {
            const { id, type, value, title, status, folders } = accessData;

            const selected = selectedAccesses?.some(
                (item) => item.id === accessData.id,
            );

            const is_editing = editingId === id;

            return (
                <InlineStack
                    key={id ?? index}
                    padding="10px"
                    gap={5}
                    wrap={false}
                    style={{
                        borderBottom:
                            index !== data?.length - 1
                                ? "1px solid var(--pnpnd-gray-200)"
                                : "none",
                    }}
                >
                    <InlineStack
                        style={{
                            flex: FLEX_VALUES[0],
                        }}
                    >
                        <Checkbox
                            rounded="sm"
                            style={{
                                marginLeft: "5px",
                            }}
                            checked={selected}
                            onChange={() => handleSelect(accessData)}
                        />
                    </InlineStack>

                    <InlineStack
                        style={{
                            flex: FLEX_VALUES[1],
                        }}
                    >
                        <Card
                            padding={3}
                            background="gray-50"
                            border="gray-200"
                            rounded="md"
                            flex
                            align="center"
                            blockAlign="center"
                            style={{
                                width: "35px",
                                minHeight: "35px",
                                height: "fit-content",
                            }}
                        >
                            <Text color="gray-700" size="sm">
                                {id}
                            </Text>
                        </Card>
                    </InlineStack>

                    <InlineStack
                        gap={10}
                        wrap={false}
                        style={{
                            flex: FLEX_VALUES[2],
                            minWidth: 0,
                        }}
                    >
                        {is_editing ? (
                            <Input
                                size="small"
                                style={{
                                    maxWidth: "250px",
                                }}
                                autoFocus
                                value={editedTitle}
                                onChange={(value) =>
                                    setEditedTitle(String(value))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUpdate("title", accessData);
                                        setEditingId(null);
                                    } else if (e.key === "Escape") {
                                        setEditingId(null);
                                    }
                                }}
                            />
                        ) : (
                            <Text
                                color="gray-700"
                                size="sm"
                                weight="medium"
                                wrap={false}
                                ellipsis
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                {title}
                            </Text>
                        )}

                        <IconButton
                            size="small"
                            name={is_editing ? "check" : "border_color"}
                            color="primary"
                            fontSize={is_editing ? "2xl" : "lg"}
                            onClick={() => {
                                if (is_editing) {
                                    handleUpdate("title", accessData);
                                    setEditingId(null);
                                } else {
                                    setEditingId(id);
                                    setEditedTitle(title);
                                }
                            }}
                        />
                    </InlineStack>

                    <InlineStack
                        gap={10}
                        wrap={false}
                        style={{
                            flex: FLEX_VALUES[3],
                            minWidth: 0,
                        }}
                    >
                        <Icon name="group" color="gray-700" />

                        <Text
                            color="gray-700"
                            size="sm"
                            wrap={false}
                            ellipsis
                            textTransform="capitalize"
                            style={{
                                minWidth: 0,
                            }}
                        >
                            {type} {__("Base", "ninja-drive")}
                        </Text>

                        <Divider
                            variant="vertical"
                            width="100%"
                            height="20px"
                        />

                        <Icon name="co_present" color="gray-700" />

                        <Text
                            color="gray-700"
                            size="sm"
                            wrap={false}
                            ellipsis
                            textTransform="capitalize"
                            style={{
                                minWidth: 0,
                            }}
                        >
                            {value}
                        </Text>
                    </InlineStack>

                    <InlineStack style={{ flex: FLEX_VALUES[4] }}>
                        <Switcher
                            checked={status === "active"}
                            onChange={() => handleUpdate("status", accessData)}
                        />
                    </InlineStack>

                    <InlineStack
                        style={{
                            flex: FLEX_VALUES[5],
                        }}
                    >
                        <Card
                            padding={3}
                            background="gray-50"
                            border="gray-200"
                            rounded="md"
                            flex
                            align="center"
                            blockAlign="center"
                            style={{
                                width: "35px",
                                minHeight: "35px",
                                height: "fit-content",
                            }}
                        >
                            <Text color="gray-700" size="sm">
                                {folders?.length || 0}
                            </Text>
                        </Card>
                    </InlineStack>

                    <InlineStack
                        gap={10}
                        align="end"
                        wrap={false}
                        style={{ flex: FLEX_VALUES[6] }}
                    >
                        <Button
                            variant="gray"
                            size="supersmall"
                            startIcon="edit"
                            iconSize="sm"
                            onClick={() =>
                                navigate(`/user-access/${id}/source/my-drive`)
                            }
                        >
                            <Text color="gray-700" size="sm">
                                {__("Edit", "ninja-drive")}
                            </Text>
                        </Button>

                        <IconButton
                            variant="error"
                            size="supersmall"
                            name="delete"
                            fontSize="md"
                            onClick={() => handleDelete([id])}
                        />
                    </InlineStack>
                </InlineStack>
            );
        });
    }

    return (
        <BlockStack
            marginTop={20}
            style={{
                borderRadius: "8px",
                borderLeft: "1px solid var(--pnpnd-gray-200)",
                borderRight: "1px solid var(--pnpnd-gray-200)",
                borderBottom: "1px solid var(--pnpnd-gray-200)",
            }}
            className="bg-white"
        >
            <InlineStack
                padding="15px"
                style={{
                    borderRadius: "8px 8px 0px 0px",
                    borderTop: "1px solid var(--pnpnd-gray-200)",
                    borderBottom: "1px solid var(--pnpnd-gray-200)",
                }}
            >
                {LIST_OPTIONS?.map(({ key, title }, index) => (
                    <InlineStack
                        key={key ?? index}
                        gap={5}
                        align={key === "action" ? "end" : "start"}
                        style={{ flex: FLEX_VALUES[index], minWidth: 0 }}
                    >
                        {key === "checkbox" ? (
                            <Checkbox
                                rounded="sm"
                                checked={allSelected}
                                onChange={handleSelectAll}
                            />
                        ) : (
                            <Text
                                color="gray-900"
                                size="sm"
                                weight="medium"
                                wrap={false}
                                ellipsis
                            >
                                {title}
                            </Text>
                        )}
                    </InlineStack>
                ))}
            </InlineStack>

            {loading && (
                <BlockStack>
                    {[...Array(per_page || 10)].map((_, index) => (
                        <SkeletonLoader
                            key={index}
                            width="100%"
                            height="56px"
                            style={{
                                borderBottom:
                                    index !== 4
                                        ? "1px solid var(--pnpnd-gray-200)"
                                        : "none",
                                borderRadius:
                                    index !== 4 ? "0px" : "0px 0px 8px 8px",
                            }}
                        />
                    ))}
                </BlockStack>
            )}

            {listContent}

            {!loading &&
                data?.length === 0 &&
                emptyContent}

        </BlockStack>
    );
};

export default AccessList;

const LIST_OPTIONS: {
    key:
        | "checkbox"
        | "id"
        | "title"
        | "type_user"
        | "status"
        | "files"
        | "action";
    title: string;
}[] = [
    {
        key: "checkbox",
        title: "",
    },
    {
        key: "id",
        title: __("ID:", "ninja-drive"),
    },
    {
        key: "title",
        title: __("Title:", "ninja-drive"),
    },
    {
        key: "type_user",
        title: __("Type & User:", "ninja-drive"),
    },
    {
        key: "status",
        title: __("Status:", "ninja-drive"),
    },
    {
        key: "files",
        title: __("Files:", "ninja-drive"),
    },
    {
        key: "action",
        title: __("Action:", "ninja-drive"),
    },
];
