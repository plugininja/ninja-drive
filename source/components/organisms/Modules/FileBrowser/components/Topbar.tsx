import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import { ModuleConfig, QueryArgs } from "~/types/widget.types";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import { checkPermission } from "~/utils/widget";
import Tooltip from "~/components/atoms/Tooltip";
import Button from "~/components/atoms/Button";
import { TBreadcrumb } from "~/types/ui";
import { __ } from "@wordpress/i18n";
import Actions from "./Actions";
import FilesViews, {
    useFilesContext,
} from "~/components/organisms/FilesViews/FilesViews";

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
    createFolder: (activeFolderKey: string, widget_id?: string) => void;
    queryArgs: QueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<QueryArgs>>;
    breadcrumbs: TBreadcrumb[];
    goPrevious: () => void;
}) => {
    const { activeFolder, showUploader, setShowUploader } = useFilesContext();
    const { style } = data.data;
    const { upload, new_folder, search } = data?.data?.permissions || {};

    const isRootUploadEnabled = style.file_browser?.header_options.root_upload;

    return (
        <InlineStack align={"between"} padding={10} gap={10}>
            {style?.["file_browser"]?.header_options.breadcrumb &&
            pnpnd?.is_pro ? (
                <FilesViews.Breadcrumbs />
            ) : (
                <Button
                    variant="outlined"
                    startIcon="arrow_left_alt"
                    onClick={goPrevious}
                    disabled={loading || loadingMore || breadcrumbs.length <= 1}
                >
                    {__("Previous", "ninja-drive")}
                </Button>
            )}

            <InlineStack gap={10} wrap={false} align="end">
                {checkPermission("search", search!) && (
                    <SearchBox
                        isSuperCompact
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
                                    ? __(
                                          "Upload is disabled for root folder",
                                          "ninja-drive",
                                      )
                                    : ""
                            }
                        />
                    </Tooltip>
                )}

                {checkPermission("new_folder", new_folder!) && (
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
                                    ? __(
                                          "Create folder is disabled for root folder",
                                          "ninja-drive",
                                      )
                                    : ""
                            }
                        />
                    </Tooltip>
                )}

                <Tooltip
                    title={
                        layout === "list"
                            ? __("Grid View", "ninja-drive")
                            : __("List View", "ninja-drive")
                    }
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

            </InlineStack>
        </InlineStack>
    );
};
