import FilesViews, { useFilesContext } from "~/components/organisms/FilesViews/FilesViews";
import { ModuleConfig, QueryArgs } from "~/types/widget.types";
import InlineStack from "~/components/molecules/InlineStack";
import { checkPermission } from "~/utils/widget";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import IconButton from "~/components/molecules/IconButton";
import Tooltip from "~/components/atoms/Tooltip";
import Actions from "./Actions";
import { TBreadcrumb } from "~/types/ui";
import Button from "~/components/atoms/Button";
import { __ } from "@wordpress/i18n";

export const Topbar = ({
    data,
    layout,
    setLayout,
    refresh,
    loading,
    loadingMore,
    createFolder,
    queryArgs,
    setQueryArgs,
    breadcrumbs,
    goPrevious,
}: {
    data: ModuleConfig;
    refresh: () => void;
    loading: boolean;
    loadingMore: boolean;
    layout: string;
    setLayout: any;
    createFolder: (activeFolderKey: string, widgetId?: string) => void;
    queryArgs: QueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<QueryArgs>>;
    breadcrumbs: TBreadcrumb[];
    goPrevious: () => void;
}) => {
    const { activeFolder, showUploader, setShowUploader } = useFilesContext();
    const { advanced } = data.data;
    const { upload, newFolder, search } = data?.data?.permissions || {};

    const isRootUploadEnabled = advanced.fileBrowser?.headerOptions.rootUpload;

    return (
        <InlineStack align={"between"} padding={10} gap={10}>
            {advanced?.["fileBrowser"]?.headerOptions.breadcrumb
? (
                <FilesViews.Breadcrumbs />
            ) : (
                <Button
                    disabled={loading || loadingMore || breadcrumbs.length <= 1}
                    variant="outlined"
                    onClick={goPrevious}
                >
                    {__("Previous", "ninja-drive")}
                </Button>
            )}

            <InlineStack
                gap={10}
                wrap={false}
                style={{ width: "50%" }}
                align="end"
            >
                {checkPermission("search", search!) && (
                    <SearchBox
                        isCompact
                        activeFolder={activeFolder}
                        queryArgs={queryArgs}
                        setQueryArgs={setQueryArgs}
                    />
                )}

                {checkPermission("upload", upload!) && (
                    <Tooltip
                        title={__("Upload Files", "ninja-drive")}
                        wrap="no-wrap"
                        placement="top"
                        arrow
                    >
                        <IconButton
                            variant="outlined"
                            size="small"
                            name="upload"
                            onClick={() => setShowUploader(!showUploader)}
                            disabled={
                                loading ||
                                loadingMore ||
                                (activeFolder === "" && !isRootUploadEnabled)
                            }
                            title={
                                activeFolder === "" && !isRootUploadEnabled
                                    ? __("Upload is disabled for root folder", "ninja-drive")
                                    : ""
                            }
                        />
                    </Tooltip>
                )}

                {checkPermission("newFolder", newFolder!) && (
                    <Tooltip
                        title={__("New Folder", "ninja-drive")}
                        wrap="no-wrap"
                        placement="top"
                        arrow
                    >
                        <IconButton
                            variant="outlined"
                            size="small"
                            name="create_new_folder"
                            onClick={() => createFolder(activeFolder, data?.id)}
                            disabled={
                                loading ||
                                loadingMore ||
                                (activeFolder === "" && !isRootUploadEnabled)
                            }
                            title={
                                activeFolder === "" && !isRootUploadEnabled
                                    ? __("Create folder is disabled for root folder", "ninja-drive")
                                    : ""
                            }
                        />
                    </Tooltip>
                )}

                {advanced.fileBrowser?.headerOptions.refresh
&& (
                        <Tooltip
                            title={loading ? __("Refreshing...", "ninja-drive") : __("Refresh", "ninja-drive")}
                            wrap="no-wrap"
                            placement="top"
                            arrow
                        >
                            <IconButton
                                variant="outlined"
                                size="small"
                                name="refresh"
                                onClick={refresh}
                                disabled={loading}
                            />
                        </Tooltip>
                    )}

                <Tooltip
                    title={layout === "list" ? __("Grid View", "ninja-drive") : __("List View", "ninja-drive")}
                    wrap="no-wrap"
                    placement="top"
                    arrow
                >
                    <IconButton
                        variant="outlined"
                        size="small"
                        name={layout === "grid" ? "dehaze" : "grid_view"}
                        onClick={() =>
                            setLayout(layout === "grid" ? "list" : "grid")
                        }
                    />
                </Tooltip>

                {advanced.fileBrowser?.headerOptions.sorting
&& (
                        <Actions
                            queryArgs={queryArgs}
                            setQueryArgs={setQueryArgs}
                        />
                    )}
            </InlineStack>
        </InlineStack>
    );
};
