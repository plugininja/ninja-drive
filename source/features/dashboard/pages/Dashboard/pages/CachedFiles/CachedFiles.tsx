import { Pagination, PAGE_OPTIONS } from "~/ui/molecules/Pagination";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { formatFileSize } from "~features/file-browser/utils/file";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { File } from "~features/file-browser/types/file.types";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { noFoundIconSvg } from "~kernel/utils/icons";
import { SkeletonLoader } from "~/ui/molecules";
import { useNavigate } from "react-router-dom";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { EmptyState } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Avatar } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    useDeleteCachedFileMutation,
    useGetCachedFilesQuery,
} from "~features/dashboard";
import {
    selectDashboard,
    setCache,
} from "~features/dashboard/state/dashboardSlice";

const CachedFiles = ({
    width,
    overview,
}: {
    width?: string;
    overview?: boolean;
}) => {
    const { cached_files } = useAppSelector(selectDashboard);
    const [files, setFiles] = useState<File[]>(cached_files?.files || []);
    const [filter, setFilter] = useLocalStorage<{
        page: number;
        per_page: number;
    }>("pnpnd-cached-files-filter", {
        page: 1,
        per_page: 5,
    });

    const { data, isLoading, isFetching } = useGetCachedFilesQuery(
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

    const [deleteCachedFile] = useDeleteCachedFileMutation();

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const { showAlert } = useCustomAlert();

    useEffect(() => {
        if (!overview && data?.data?.files) {
            setFiles(data?.data?.files);
        } else if (overview && cached_files?.files) {
            setFiles(cached_files?.files);
        }
    }, [data, cached_files, overview, isLoading, isFetching]);

    useEffect(() => {
        if (!isLoading && !isFetching && data?.data?.files?.length === 0) {
            setFilter((prev) => ({
                ...prev,
                page: 1,
            }));
        }
    }, [data, isLoading, isFetching]);

    const handleDelete = (file_key: string) => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: __(
                "Are you sure you want to delete this cached file?",
                "ninja-drive",
            ),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response = await deleteCachedFile({
                        file_key,
                    }).unwrap();

                    if (overview) {
                        dispatch(
                            setCache({
                                cached_files: response?.data?.cached_files,
                                image_cache: response?.data?.image_cache,
                            }),
                        );
                    } else {
                        setFiles((prev) =>
                            prev.filter((file) => file.file_key !== file_key),
                        );
                    }

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __(
                                "Cached file deleted successfully",
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
                            __("Failed to delete cached file", "ninja-drive"),
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
                    style={{ minWidth: 0 }}
                >
                    <Text
                        color="gray-700"
                        weight="medium"
                        wrap={false}
                        ellipsis
                        style={{ minWidth: 0 }}
                    >
                        {__("Recent Cached Files", "ninja-drive")}
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
                            onClick={() => navigate("/dashboard/cached-files")}
                        >
                            {__("Full Report", "ninja-drive")}
                        </Button>
                    )}
                </InlineStack>

                <BlockStack gap={10}>
                    {!overview && (isLoading || isFetching) ? (
                        <BlockStack gap={10}>
                            {Array.from({ length: filter?.per_page }).map(
                                (_, index) => (
                                    <SkeletonLoader
                                        key={index}
                                        width="100%"
                                        height="67px"
                                    />
                                ),
                            )}
                        </BlockStack>
                    ) : files?.length > 0 ? (
                        files?.map((file, index) => {
                            const {
                                file_key,
                                name,
                                extension,
                                additional_data,
                                size,
                            } = file;

                            return (
                                <Card
                                    key={file_key ?? index}
                                    padding={11.8}
                                    background="primary-extralight"
                                    border="primary-light"
                                    rounded="md"
                                >
                                    <InlineStack
                                        gap={10}
                                        align="between"
                                        wrap={false}
                                    >
                                        <InlineStack
                                            gap={10}
                                            wrap={false}
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Card
                                                padding={0}
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

                                            <BlockStack
                                                gap={5}
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Text
                                                    size="sm"
                                                    wrap={false}
                                                    ellipsis
                                                    style={{
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    {name}
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
                                                    {extension?.toUpperCase()}
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>

                                        <InlineStack gap={20} wrap={false}>
                                            <Card
                                                padding={5}
                                                background="white"
                                                border="primary-light"
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
                                                    color="primary"
                                                    size="sm"
                                                    weight="medium"
                                                    wrap={false}
                                                    ellipsis
                                                    style={{
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    {formatFileSize(size)}
                                                </Text>
                                            </Card>

                                            <IconButton
                                                variant="error"
                                                rounded="md"
                                                name="delete"
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(file_key)
                                                }
                                            />
                                        </InlineStack>
                                    </InlineStack>
                                </Card>
                            );
                        })
                    ) : (
                        <EmptyState
                            icon={
                                <img
                                    src={noFoundIconSvg}
                                    alt=""
                                    style={{ width: "200px", height: "200px" }}
                                />
                            }
                            title={__("Files Not Found", "ninja-drive")}
                        />
                    )}
                </BlockStack>
            </SettingsField>

            {!overview && !(isLoading || isFetching) && (
                <BlockStack margin={15}>
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

export default CachedFiles;
