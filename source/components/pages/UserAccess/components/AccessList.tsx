import { selectUserAccess } from "~/store/features/userAccessSlice";
import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import UpgradeBanner from "~/components/organisms/UpgradeBanner";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import EmptyState from "~/components/molecules/EmptyState";
import BlockStack from "~/components/molecules/BlockStack";
import { noFoundIconSvg } from "~/utils/icons";
import Checkbox from "~/components/atoms/Checkbox";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import { UserAccess } from "~/types/userAccess";
import Button from "~/components/atoms/Button";
import { useNavigate } from "react-router-dom";
import Card from "~/components/molecules/Card";
import { useAppSelector } from "~/store/hooks";
import { useState } from "@wordpress/element";
import Input from "~/components/atoms/Input";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

const AccessList = ({
    data,
    selectedAccesses,
    setSelectedAccesses,
    onAdd,
    loading,
}: {
    data: UserAccess[];
    selectedAccesses: UserAccess[];
    setSelectedAccesses: React.Dispatch<React.SetStateAction<UserAccess[]>>;
    onAdd: () => void;
    loading: boolean;
}) => {
    const { queryArgs } = useAppSelector(selectUserAccess);

    const FLEX_VALUES = ["0.3", "0.5", "2", "2", "1", "1", "0.5"];

    const { showAlert } = useCustomAlert();

    const navigate = useNavigate();

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
                    {[...Array(queryArgs?.per_page || 5)].map((_, index) => (
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
                (emptyContent || <UpgradeBanner />)}
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
