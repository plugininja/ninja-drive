import { selectDashboard } from "~features/dashboard/state/dashboardSlice";
import { Pagination, PAGE_OPTIONS } from "~/ui/molecules/Pagination";
import { formatFileSize } from "~/features/file-browser/utils/file";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { File } from "~features/file-browser/types/file.types";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { useAppSelector } from "~kernel/store/hooks";
import { noFoundIconSvg } from "~kernel/utils/icons";
import { SkeletonLoader } from "~/ui/molecules";
import { useNavigate } from "react-router-dom";
import { useEditDetails } from "./EditDetails";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { EmptyState } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Avatar } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    useDeleteDownloadLinkMutation,
    useGetDownloadedFilesQuery,
} from "~features/dashboard";

const DownloadLinks = ({
    variant = "large",
    width,
    overview = false,
}: {
    variant?: "small" | "large";
    width?: string;
    overview?: boolean;
}) => {
    const { downloaded_files } = useAppSelector(selectDashboard);
    const [files, setFiles] = useState<File[]>(downloaded_files?.files || []);
    const [filter, setFilter] = useLocalStorage<{
        page: number;
        per_page: number;
    }>("pnpnd-download-files-filter", {
        page: 1,
        per_page: 5,
    });

    const { data, isLoading, isFetching } = useGetDownloadedFilesQuery(
        {
            page: filter?.page,
            per_page: filter?.per_page,
            order: "DESC",
            order_by: "updated_at",
        },
        {
            skip: overview,
        },
    );

    const [deleteDownloadLink] = useDeleteDownloadLinkMutation();

    const { openEditDetails } = useEditDetails();

    const navigate = useNavigate();

    const { showAlert } = useCustomAlert();

    useEffect(() => {
        if (!overview && data?.data?.files) {
            setFiles(data?.data?.files);
        } else if (overview && downloaded_files?.files) {
            setFiles(downloaded_files?.files);
        }
    }, [data, downloaded_files, overview, isLoading, isFetching]);

    useEffect(() => {
        if (!isLoading && !isFetching && data?.data?.files?.length === 0) {
            setFilter((prev) => ({
                ...prev,
                page: 1,
            }));
        }
    }, [data, isLoading, isFetching]);

    const FLEX_VALUES =
        variant === "small" ? ["1", "4", "2", "1"] : ["0.5", "6", "1", "1.5"];

    const handleDelete = (file_key: string) => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: __(
                "Are you sure you want to delete this download link?",
                "ninja-drive",
            ),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response = await deleteDownloadLink({
                        file_key,
                        download_link_id: "all",
                    }).unwrap();

                    setFiles(
                        (prev) =>
                            prev?.filter((file) => file?.file_key !== file_key),
                    );

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __(
                                "Download link deleted successfully",
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
                            __("Failed to delete download link", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return (
        <>
            <SettingsField
                style={{
                    width: width,
                }}
            >
                <InlineStack
                    gap={10}
                    align="between"
                    wrap={false}
                    style={{
                        minWidth: 0,
                    }}
                >
                    <Text
                        color="gray-700"
                        weight="medium"
                        wrap={false}
                        ellipsis
                        style={{ minWidth: 0 }}
                    >
                        {overview
                            ? __("Recent Download Links", "ninja-drive")
                            : __("All Download Links", "ninja-drive")}
                    </Text>

                    {overview && (
                        <Button
                            variant="outlined"
                            endIcon="arrow_forward"
                            endIconColor="gray-700"
                            style={{
                                whiteSpace: "nowrap",
                                color: "var(--pnpnd-gray-700)",
                            }}
                            onClick={() =>
                                navigate("/dashboard/download-links")
                            }
                        >
                            {__("Full Report", "ninja-drive")}
                        </Button>
                    )}
                </InlineStack>

                <BlockStack>
                    <InlineStack
                        padding={20}
                        style={{
                            borderRadius: "8px 8px 0px 0px",
                            minWidth: 0,
                        }}
                        className="bg-primary-light"
                    >
                        {HEADER.map((header, index) => (
                            <InlineStack
                                key={header}
                                gap={10}
                                align={header === "Action:" ? "end" : "start"}
                                style={{
                                    flex: FLEX_VALUES[index],
                                    minWidth: 0,
                                }}
                            >
                                <Text
                                    color="gray-700"
                                    weight="medium"
                                    wrap={false}
                                    ellipsis
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    {header}
                                </Text>
                            </InlineStack>
                        ))}
                    </InlineStack>

                    {!overview && (isLoading || isFetching) ? (
                        <BlockStack gap={2} marginTop={2}>
                            {Array.from({ length: filter?.per_page }).map(
                                (_, index) => (
                                    <SkeletonLoader
                                        key={index}
                                        width="100%"
                                        height="60px"
                                    />
                                ),
                            )}
                        </BlockStack>
                    ) : files?.length === 0 ? (
                        <EmptyState
                            style={{
                                padding: "20px",
                            }}
                            icon={
                                <img
                                    src={noFoundIconSvg}
                                    alt=""
                                    style={{ width: "200px", height: "200px" }}
                                />
                            }
                            title={__("Files Not Found", "ninja-drive")}
                        />
                    ) : (
                        files?.map((file) => {
                            const {
                                file_key,
                                name,
                                extension,
                                additional_data,
                                meta_data,
                                size,
                            } = file || {};

                            const length = Object.keys(
                                meta_data?.download_data || {},
                            ).length;

                            return (
                                <InlineStack
                                    key={file_key}
                                    gap={10}
                                    style={{
                                        minWidth: 0,
                                    }}
                                    className="pnpnd-dashboard-item-index-border"
                                >
                                    <InlineStack
                                        style={{
                                            flex: FLEX_VALUES[0],
                                        }}
                                    >
                                        <Card
                                            padding={
                                                extension === "folder" ? 5 : 0
                                            }
                                            background="white"
                                            border="primary-light"
                                            flex
                                            align="center"
                                            blockAlign="center"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "6px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Avatar
                                                src={PNPNDHelper.getUrl(
                                                    "thumbnail",
                                                    file_key,
                                                    additional_data?.base_name!,
                                                    "",
                                                    "lg",
                                                    extension,
                                                )}
                                                width="100%"
                                                height="100%"
                                                rounded="sm"
                                                showSpinner={
                                                    extension !== "folder"
                                                }
                                                spinnerSize="25px"
                                            />
                                        </Card>
                                    </InlineStack>

                                    <BlockStack
                                        gap={5}
                                        style={{
                                            flex: FLEX_VALUES[1],
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
                                            {name}
                                        </Text>

                                        <InlineStack
                                            gap={5}
                                            wrap={false}
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Text
                                                color="gray-700"
                                                size="xs"
                                                wrap={false}
                                                ellipsis
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >
                                                {extension?.toUpperCase()}
                                            </Text>

                                            <Text color="gray-700" size="xs">
                                                •
                                            </Text>

                                            <Text
                                                color="gray-700"
                                                size="xs"
                                                wrap={false}
                                                ellipsis
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >
                                                {formatFileSize(
                                                    Number(size) || 0,
                                                )}
                                            </Text>
                                        </InlineStack>
                                    </BlockStack>

                                    <InlineStack
                                        style={{
                                            flex: FLEX_VALUES[2],
                                            minWidth: 0,
                                        }}
                                    >
                                        <Card
                                            padding={5}
                                            rounded="md"
                                            flex
                                            align="center"
                                            blockAlign="center"
                                            style={{
                                                minWidth: "40px",
                                                width: "fit-content",
                                                height: "40px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Text color="gray-700" size="sm">
                                                {length > 0 ? length : 0}
                                            </Text>
                                        </Card>
                                    </InlineStack>

                                    <InlineStack
                                        align="end"
                                        wrap={false}
                                        gap={10}
                                        style={{
                                            flex: FLEX_VALUES[3],
                                            minWidth: 0,
                                        }}
                                    >
                                        {overview ? (
                                            <IconButton
                                                variant="outlined"
                                                rounded="md"
                                                name="instant_mix"
                                                color="primary"
                                                style={{
                                                    flexShrink: 0,
                                                }}
                                                onClick={() =>
                                                    openEditDetails(file)
                                                }
                                            />
                                        ) : (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    rounded="md"
                                                    startIcon="instant_mix"
                                                    startIconColor="gray-700"
                                                    style={{
                                                        color: "var(--pnpnd-gray-700)",
                                                    }}
                                                    onClick={() =>
                                                        openEditDetails(file)
                                                    }
                                                >
                                                    Edit
                                                </Button>

                                                <IconButton
                                                    variant="error"
                                                    rounded="md"
                                                    name="delete"
                                                    color="error"
                                                    style={{
                                                        flexShrink: 0,
                                                    }}
                                                    onClick={() =>
                                                        handleDelete(file_key)
                                                    }
                                                />
                                            </>
                                        )}
                                    </InlineStack>
                                </InlineStack>
                            );
                        })
                    )}
                </BlockStack>
            </SettingsField>

            {!overview && !(isLoading || isFetching) && (
                <BlockStack margin={"15px"}>
                    <InlineStack gap={5} align="center">
                        <Pagination
                            current_page={data?.data?.current_page || 1}
                            total_pages={data?.data?.total_pages || 1}
                            onPageChange={(p) =>
                                setFilter((prev) => ({ ...prev, page: p }))
                            }
                        />

                        <SelectBox
                            options={PAGE_OPTIONS}
                            value={[filter?.per_page?.toString() || "5"]}
                            onChange={(value) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    per_page: Number(value),
                                }))
                            }
                            placement="top"
                        />
                    </InlineStack>
                </BlockStack>
            )}
        </>
    );
};

export default DownloadLinks;

const HEADER = [
    __("File:", "ninja-drive"),
    __("Type & Name:", "ninja-drive"),
    __("Links:", "ninja-drive"),
    __("Action:", "ninja-drive"),
];
