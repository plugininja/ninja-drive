import { useShareLink } from "~/shared/file-operations/components/ShareLink";
import { File, SharedItem } from "~features/file-browser/types/file.types";
import { useDeleteShareLinkMutation } from "~/features/dashboard";
import { formatRemainingTime } from "~kernel/utils/helpers";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";

type SharedItemType = SharedItem & {
    key: string;
};

const EditDetails = ({
    file,
    onClose,
}: {
    file: File;
    onClose: () => void;
}) => {
    const [LINKS, setLINKS] = useState<SharedItemType[]>([]);
    const { file_key, name } = file || {};

    const [deleteShareLink] = useDeleteShareLinkMutation();

    const { showAlert } = useCustomAlert();

    useEffect(() => {
        const initial_link = Object.entries(
            file?.meta_data?.shared_data || {},
        )?.map(([key, value]) => ({
            key,
            ...value,
        }));

        setLINKS(initial_link);
    }, [file?.meta_data?.shared_data]);

    useEffect(() => {
        const handler = (event: Event) => {
            const e = event as CustomEvent;

            const updated_link_obj = e.detail?.updated_link;
            if (!updated_link_obj) return;

            const [key, value] = Object.entries(updated_link_obj)[0] as
                | [string, any]
                | [];

            if (!key || !value) return;

            setLINKS((prev) => {
                const idx = prev.findIndex((item) => item.key === key);

                if (idx !== -1) {
                    const next = [...prev];
                    next[idx] = { ...next[idx], ...value };
                    return next;
                }

                return [
                    ...prev,
                    {
                        key,
                        ...value,
                    },
                ];
            });
        };

        window.addEventListener("SHARE_LINK_UPDATED", handler);

        return () => {
            window.removeEventListener("SHARE_LINK_UPDATED", handler);
        };
    }, [file_key]);

    const handleCopyLink = (key: string) => {
        const generated_link = `${pnpnd?.site_url}/pnpnd/share/${file?.file_key}-${key}/${file?.name}`;

        navigator.clipboard.writeText(generated_link);

        showAlert({
            toast: true,
            type: "success",
            text: __("Link copied to clipboard", "ninja-drive"),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    const handleDelete = (key: string) => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: __(
                "Are you sure you want to delete this share link?",
                "ninja-drive",
            ),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response = await deleteShareLink({
                        file_key: file_key,
                        share_link_id: key,
                    }).unwrap();

                    setLINKS(
                        (prev) => prev?.filter((link) => link?.key !== key),
                    );

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __(
                                "Share link deleted successfully",
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
                            __("Failed to delete share link", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return (
        <div
            style={{
                position: "relative",
            }}
        >
            <IconButton
                variant="error"
                size="extrasmall"
                name="close"
                color="error"
                style={{
                    position: "absolute",
                    backgroundColor: "#ffffff",
                    top: "-30px",
                    right: "-30px",
                    zIndex: 9999,
                }}
                onClick={onClose}
            />

            <Card
                padding={10}
                background="white"
                flex
                direction="col"
                gap={10}
                wrap={false}
                style={{
                    minWidth: "600px",
                    maxHeight: "430px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                }}
            >
                {LINKS?.map((link, index) => {
                    const { key, expiry, password } = link;
                    const is_protected = !!password;
                    const is_permanent = expiry === 0;
                    const remaining_time = formatRemainingTime(
                        expiry - Math.floor(Date.now() / 1000),
                    );
                    const is_expired =
                        expiry !== 0 && remaining_time === "expired";

                    return (
                        <Card
                            key={key ?? index}
                            padding={10}
                            background="primary-extralight"
                            rounded="md"
                            flex
                            align="between"
                            blockAlign="center"
                            gap={30}
                            wrap={false}
                        >
                            <InlineStack gap={10} wrap={false}>
                                <Card
                                    padding={5}
                                    background="white"
                                    rounded="md"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        minWidth: "45px",
                                        width: "fit-content",
                                        height: "45px",
                                    }}
                                >
                                    <Text color="primary" size="sm">
                                        #{index + 1}
                                    </Text>
                                </Card>

                                <BlockStack gap={5}>
                                    <Text size="sm" wrap={false} ellipsis>
                                        {name}
                                    </Text>

                                    <InlineStack
                                        gap={10}
                                        blockAlign="center"
                                        wrap={false}
                                    >
                                        <Card
                                            padding={3}
                                            background="white"
                                            rounded="sm"
                                            border={
                                                is_protected
                                                    ? "primary-light"
                                                    : "error-100"
                                            }
                                            style={{
                                                position: "relative",
                                                width: "22px",
                                                height: "22px",
                                                aspectRatio: "1/1",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon
                                                name={
                                                    is_protected
                                                        ? "lock"
                                                        : "lock_open_right"
                                                }
                                                color={
                                                    is_protected
                                                        ? "primary"
                                                        : "error"
                                                }
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform:
                                                        "translate(-50%, -50%)",
                                                    zIndex: 1,
                                                }}
                                            />
                                        </Card>

                                        <Text
                                            color="gray-700"
                                            size="xs"
                                            wrap={false}
                                        >
                                            {is_protected
                                                ? "Protected"
                                                : "Not Protected"}
                                        </Text>

                                        <Text color="gray-700" size="xs">
                                            •
                                        </Text>

                                        <Card
                                            padding={3}
                                            background="white"
                                            border={
                                                is_expired
                                                    ? "error-100"
                                                    : "primary-light"
                                            }
                                            rounded="sm"
                                            style={{
                                                position: "relative",
                                                width: "22px",
                                                height: "22px",
                                                aspectRatio: "1/1",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon
                                                name="alarm"
                                                color={
                                                    is_expired
                                                        ? "error"
                                                        : "primary"
                                                }
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform:
                                                        "translate(-50%, -50%)",
                                                    zIndex: 1,
                                                }}
                                            />
                                        </Card>

                                        <Text
                                            color={
                                                is_expired
                                                    ? "error"
                                                    : "gray-700"
                                            }
                                            size="xs"
                                            wrap={false}
                                        >
                                            {is_expired
                                                ? "Expired"
                                                : is_permanent
                                                ? "Permanent"
                                                : remaining_time}
                                        </Text>
                                    </InlineStack>
                                </BlockStack>
                            </InlineStack>

                            <InlineStack gap={5} wrap={false}>
                                <IconButton
                                    variant="white"
                                    size="small"
                                    name="link"
                                    fontSize="sm"
                                    style={{
                                        border: "1px solid var(--pnpnd-primary-light)",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => handleCopyLink(key)}
                                />

                                <IconButton
                                    variant="white"
                                    size="small"
                                    name="edit_square"
                                    fontSize="sm"
                                    style={{
                                        border: "1px solid var(--pnpnd-primary-light)",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => {
                                    }}
                                />

                                <IconButton
                                    variant="error"
                                    size="small"
                                    name="delete"
                                    fontSize="sm"
                                    style={{
                                        border: "1px solid var(--pnpnd-error-100)",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => handleDelete(key)}
                                />
                            </InlineStack>
                        </Card>
                    );
                })}
            </Card>
        </div>
    );
};

export function useEditDetails() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openEditDetails = (file: File) => {
        showAlert({
            id: "pnpnd-share-links-edit-details",
            width: "fit-content",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            style: {
                padding: 0,
            },
            html: (
                <EditDetails
                    file={file}
                    onClose={() => closeAlert("pnpnd-share-links-edit-details")}
                />
            ),
        });
    };

    return { openEditDetails };
}
