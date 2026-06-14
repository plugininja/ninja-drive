import { ModuleConfig, StyleGallery } from "~/types/widget.types";
import EmptyState from "~/components/molecules/EmptyState";
import { useFileActions } from "~/hooks/useFileActions";
import { useModuleFiles } from "~/hooks/useModuleFiles";
import { noFoundIconSvg } from "~/utils/icons";
import { checkPermission } from "~/utils/widget";
import { useGallery } from "~/hooks/useGallery";
import type { CSSProperties } from "react";
import ModuleBottom from "../ModuleBottom";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";
import Thumbnail from "./Thumbnail";
import clsx from "clsx";

const getThumbnailUrlByQuality = (
    file: File,
    quality: StyleGallery["thumbnail_quality"],
    widget_id?: string,
): string => {
    const suffixMap = {
        original: "5xl",
        large: "lg",
        medium: "md",
        thumbnail: "sm",
    };

    const size = (suffixMap[quality] || "md") as any;

    const thumbnail = PNPNDHelper.getUrl(
        "thumbnail",
        file.file_key,
        file.name,
        widget_id,
        size,
        file.extension,
    );

    return thumbnail;
};

const Gallery = ({ data }: { data: ModuleConfig }) => {
    const gallery = data?.data?.style?.gallery;
    const activeView = gallery?.layout || "grid";
    const { desktop, mobile, tablet, laptop } = gallery?.columns || {};
    const { loading_type } = data?.data?.style?.files || {};

    const { preview, download } = data?.data?.permissions || {};

    const enablePreview = checkPermission("preview", preview!);

    const enableDownload = checkPermission("download", download!);

    const {
        files,
        has_more,
        loadingMore,
        loadMore,
        total_pages,
        loading,
        loadMoreRef,
        queryArgs,
    } = useModuleFiles(data);

    const { openGoogleDrive } = useFileActions();

    const { viewFile } = useGallery(files, data?.id, {
        permissions: {
            download: enableDownload,
        },
        showThumbnails: preview?.preview_thumbnail,
    });

    if (!files.length && !loading)
        return (
            <EmptyState
                icon={<img src={noFoundIconSvg} alt="" style={{ width: "200px", height: "200px" }} />}
                title={__("No files found", "ninja-drive")}
            />
        );

    return (
        <>
            <div
                className={clsx(
                    `pnpnd-gallery--${activeView}`,
                    "pnpnd-gallery-transition-enter",
                )}
                style={
                    {
                        "--desktopColumns": desktop,
                        "--laptopColumns": laptop,
                        "--tabletColumns": tablet,
                        "--mobileColumns": mobile,
                        "--itemGap": `${gallery?.thumbnail_spacing.value}${gallery?.thumbnail_spacing.unit}`,
                        "--itemRadius": `${gallery?.thumbnail_radius.value}${gallery?.thumbnail_radius.unit}`,
                    } as CSSProperties
                }
            >
                {files.map((image, index) => (
                    <div
                        key={image.file_key}
                        className="pnpnd-gallery-item"
                        onClick={() => {
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${__("View", "ninja-drive")} ${
                            image.name
                        }`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (enablePreview && preview?.pop_out) {
                                    openGoogleDrive(image, data?.id);
                                    return;
                                }
                                enablePreview &&
                                    preview?.inline &&
                                    viewFile(image.file_key);
                            }
                        }}
                        style={{ "--i": index } as CSSProperties}
                    >
                        <Thumbnail
                            src={getThumbnailUrlByQuality(
                                image,
                                gallery?.thumbnail_quality || "medium",
                                data?.id,
                            )}
                            alt={image.name}
                        />

                    </div>
                ))}
            </div>

            <ModuleBottom
                fileLoadingType={loading_type}
                has_more={has_more}
                loadMore={loadMore}
                total_pages={total_pages}
                current_page={queryArgs?.page || 1}
                isLoading={loading || loadingMore}
                loadMoreFileRef={loadMoreRef}
            />
        </>
    );
};

export default Gallery;
