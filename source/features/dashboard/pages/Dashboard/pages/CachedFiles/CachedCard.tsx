import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { useDeleteCachedFileMutation } from "~features/dashboard";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { useContextMenu } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import CachedContext from "./CachedContext";
import { GridStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    CardsType,
    STATIC_CARDS,
} from "~features/settings/pages/Settings/pages/Caching";
import {
    selectDashboard,
    setCache,
} from "~features/dashboard/state/dashboardSlice";

const CachedCard = () => {
    const [CARDS, setCARDS] = useState<CardsType[]>([]);
    const { image_cache } = useAppSelector(selectDashboard);
    const [deleteCachedFile] = useDeleteCachedFileMutation();

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const { show } = useContextMenu();

    useEffect(() => {
        if (image_cache) {
            const updatedCards = STATIC_CARDS?.map((card) => {
                const match = image_cache?.find(
                    (cache) => cache?.key === card?.key,
                );

                return {
                    ...card,
                    size: match?.size || "0 KB",
                    count: match?.count || 0,
                };
            });

            setCARDS(updatedCards as CardsType[]);
        }
    }, [image_cache]);

    const handleDeleteCache = (
        key: "total" | "5xl" | "4xl" | "xl" | "lg" | "md",
    ) => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: `${__(
                "Are you sure you want to delete cache for",
                "ninja-drive",
            )} ${key}?`,
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response = await deleteCachedFile({
                        type: key,
                    }).unwrap();

                    dispatch(
                        setCache({
                            cached_files: response?.data?.cached_files,
                            image_cache: response?.data?.image_cache,
                        }),
                    );

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __("Cache deleted successfully", "ninja-drive"),
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
                            __("Failed to delete cache", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleMenuClick = (
        key: "delete",
        action?: "total" | "5xl" | "4xl" | "xl" | "lg" | "md",
    ) => {
        switch (key) {
            case "delete":
                if (action) handleDeleteCache(action);
                break;
            default:
                break;
        }
    };

    return (
        <SettingsField title={__("Cached Drives Files", "ninja-drive")}>
            <GridStack columns="auto-fit" min="200px" gap={15}>
                {CARDS?.map((card) => {
                    const { key, title, icon, color, bg, border, count, size } =
                        card || {};

                    return (
                        <Card
                            key={key}
                            rounded="md"
                            background={bg}
                            border={border}
                            style={{
                                minWidth: 0,
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                show(
                                    "cached-file-menu",
                                    e as React.MouseEvent<HTMLElement>,
                                    {
                                        action: key,
                                    },
                                );
                            }}
                        >
                            <InlineStack
                                gap={5}
                                wrap={false}
                                align="between"
                                blockAlign="start"
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                <Text
                                    color="gray-700"
                                    wrap={false}
                                    ellipsis
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    {title}
                                </Text>

                                <Card
                                    padding={5}
                                    background="white"
                                    border={border}
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        width: "35px",
                                        height: "35px",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <Icon
                                        name={icon}
                                        color="gray-700"
                                        fontSize="2xl"
                                    />
                                </Card>
                            </InlineStack>

                            <Text size="2xl" weight="medium">
                                {count}
                            </Text>

                            <InlineStack
                                marginTop={5}
                                gap={5}
                                wrap={false}
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    wrap={false}
                                    ellipsis
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    {__("File Size:", "ninja-drive")}
                                </Text>

                                <Card
                                    padding={5}
                                    background="white"
                                    border={border}
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        width: "fit-content",
                                        borderRadius: "6px",
                                        minWidth: 0,
                                    }}
                                >
                                    <Text
                                        color={color}
                                        size="sm"
                                        weight="medium"
                                        wrap={false}
                                        ellipsis
                                        style={{
                                            minWidth: 0,
                                        }}
                                    >
                                        {size}
                                    </Text>
                                </Card>
                            </InlineStack>
                        </Card>
                    );
                })}
            </GridStack>

            <CachedContext onMenuClick={handleMenuClick} />
        </SettingsField>
    );
};

export default CachedCard;
