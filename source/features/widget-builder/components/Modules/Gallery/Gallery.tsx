import { useModuleFiles } from "~features/widget-builder/hooks/useModuleFiles";
import { useFileActions } from "~features/file-browser/hooks/useFileActions";
import { checkPermission } from "~features/widget-builder/utils/widget";
import { useGallery } from "~features/file-browser/hooks/useGallery";
import { File } from "~features/file-browser/types/file.types";
import { noFoundIconSvg } from "~kernel/utils/icons";
import { EmptyState } from "~/ui/molecules";
import { toBoolean } from "~/kernel/utils";
import type { CSSProperties } from "react";
import ModuleBottom from "../ModuleBottom";
import { __ } from "@wordpress/i18n";
import Thumbnail from "./Thumbnail";
import clsx from "clsx";
import {
    ModuleConfig,
    StyleGallery,
} from "~features/widget-builder/types/widget.types";

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
                icon={
                    <img
                        src={noFoundIconSvg}
                        alt=""
                        style={{ width: "200px", height: "200px" }}
                    />
                }
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
                        "--itemGapDesktop": `${gallery?.thumbnail_spacing.desktop.value}${gallery?.thumbnail_spacing.desktop.unit}`,
                        "--itemGapLaptop": `${gallery?.thumbnail_spacing.laptop.value}${gallery?.thumbnail_spacing.laptop.unit}`,
                        "--itemGapTablet": `${gallery?.thumbnail_spacing.tablet.value}${gallery?.thumbnail_spacing.tablet.unit}`,
                        "--itemGapMobile": `${gallery?.thumbnail_spacing.mobile.value}${gallery?.thumbnail_spacing.mobile.unit}`,
                        "--itemRadiusDesktop": `${gallery?.thumbnail_radius.desktop.value}${gallery?.thumbnail_radius.desktop.unit}`,
                        "--itemRadiusLaptop": `${gallery?.thumbnail_radius.laptop.value}${gallery?.thumbnail_radius.laptop.unit}`,
                        "--itemRadiusTablet": `${gallery?.thumbnail_radius.tablet.value}${gallery?.thumbnail_radius.tablet.unit}`,
                        "--itemRadiusMobile": `${gallery?.thumbnail_radius.mobile.value}${gallery?.thumbnail_radius.mobile.unit}`,
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
                                    toBoolean(pnpnd?.is_pro) &&
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
