import { AdvancedGallery, ModuleConfig } from "~/types/widget.types";
import { useFileActions } from "~/hooks/useFileActions";
import { useModuleFiles } from "~/hooks/useModuleFiles";
import NoFoundIcon from "~/assets/icons/NoFoundIcon";
import { checkPermission } from "~/utils/widget";
import EmptyState from "~/components/molecules/EmptyState";
import { useGallery } from "~/hooks/useGallery";
import ModuleBottom from "../ModuleBottom";
import { File } from "~/types/file.types";
import type { CSSProperties } from "react";
import { __ } from "@wordpress/i18n";
import Thumbnail from "./Thumbnail";
import clsx from "clsx";

const getThumbnailUrlByQuality = (
    file: File,
    quality: AdvancedGallery["thumbnailQuality"],
    widgetId?: string,
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
        file.fileKey,
        file.name,
        widgetId,
        size,
        file.extension,
    );

    return thumbnail;
};

const Gallery = ({ data }: { data: ModuleConfig }) => {
    const gallery = data.data.advanced.gallery;
    const activeView = gallery?.layout || "grid";
    const { desktop, mobile, tablet, laptop } = gallery?.columns || {};
    const { loadingType } = data?.data?.advanced.files || {};

    const { preview, download } = data?.data?.permissions || {};

    const enablePreview = checkPermission("preview", preview!);

    const enableDownload = checkPermission("download", download!);

    const {
        files,
        hasMore,
        loadingMore,
        loadMore,
        totalPages,
        loading,
        loadMoreRef,
        queryArgs,
    } = useModuleFiles(data);

    const { openGoogleDrive } = useFileActions();

    const { viewFile } = useGallery(files, data?.id, {
        permissions: {
            download: enableDownload,
        },
        showThumbnails: preview?.previewThumbnail,
    });

    if (!files.length && !loading)
        return (
            <EmptyState
                icon={<NoFoundIcon />}
                title={__("No files found", "ninja-drive")}
            />
        );

    return (
        <>
            <div
                className={clsx(
                    `gallery--${activeView}`,
                    "gallery-transition-enter",
                )}
                style={
                    {
                        "--desktopColumns": desktop,
                        "--laptopColumns": laptop,
                        "--tabletColumns": tablet,
                        "--mobileColumns": mobile,
                        "--itemGap": `${gallery?.thumbnailSpacing.value}${gallery?.thumbnailSpacing.unit}`,
                        "--itemRadius": `${gallery?.thumbnailRadius.value}${gallery?.thumbnailRadius.unit}`,
                    } as CSSProperties
                }
            >
                {files.map((image, index) => (
                    <div
                        key={image.fileKey}
                        className="gallery-item"
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
                                if (enablePreview && preview?.popOut) {
                                    openGoogleDrive(image, data?.id);
                                    return;
                                }
                                enablePreview &&
                                    preview?.inline &&
                                    viewFile(image.fileKey);
                            }
                        }}
                        style={{ "--i": index } as CSSProperties}
                    >
                        <Thumbnail
                            src={getThumbnailUrlByQuality(
                                image,
                                gallery?.thumbnailQuality || "medium",
                                data?.id,
                            )}
                            alt={image.name}
                        />

                    </div>
                ))}
            </div>

            <ModuleBottom
                fileLoadingType={loadingType}
                hasMore={hasMore}
                loadMore={loadMore}
                totalPages={totalPages}
                currentPage={queryArgs?.page || 1}
                isLoading={loading || loadingMore}
                loadMoreFileRef={loadMoreRef}
            />
        </>
    );
};

export default Gallery;
