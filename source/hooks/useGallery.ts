import { useEffect, useRef } from "@wordpress/element";
import { isFolder, isImage, isVideo } from "../utils/file";
import { File } from "~/types/file.types";

export const useGallery = (
    currentFiles: File[],
    widgetId?: string,
    config?: {
        permissions?: { download: boolean };
        securePlayBack?: boolean;
        showThumbnails?: boolean;
    },
) => {
    const gallery = useRef<any>(null);
    // Filter out folders and audio files
    const mediaFiles = currentFiles?.filter(
        (file) => !isFolder(file.extension || ""),
    );

    const download = config?.permissions?.download || false;
    const securePlayBack = config?.securePlayBack || false;
    const showThumbnails = config?.showThumbnails ?? true;

    useEffect(() => {
        if (!mediaFiles || mediaFiles.length === 0) return;

        // Cleanup previous gallery instance
        if (gallery.current && gallery.current.destroy) {
            gallery.current.destroy();
            gallery.current = null;
        }

        // Map files to dynamic gallery items
        const dynamicEl = mediaFiles.map((file: File) => {
            const previewUrl = PNPNDHelper.getUrl(
                "preview",
                file.fileKey,
                file.name,
                widgetId,
                undefined,
                file.extension,
            );
            const imagePreviewUrl = PNPNDHelper.getUrl(
                "thumbnail",
                file.fileKey,
                file.name,
                widgetId,
                "5xl",
                file.extension,
            );
            const thumbnail = PNPNDHelper.getUrl(
                "thumbnail",
                file.fileKey,
                file.name,
                widgetId,
                "md",
                file.extension,
            );

            const downloadUrl = PNPNDHelper.getUrl(
                "download",
                file.fileKey,
                file.name,
                widgetId,
                undefined,
                file.extension,
            );

            if (isVideo(file.extension || "") && securePlayBack) {
                return {
                    download,
                    downloadUrl,
                    video: {
                        source: {
                            src: previewUrl,
                            type: file.mimeType,
                        },
                        attributes: {
                            preload: true,
                            controls: true,
                            autoplay: false,
                            playsinline: true,
                        },
                    },
                    thumb: thumbnail,
                    poster: imagePreviewUrl,
                };
            }
            // if (isAudio(file.extension || "")) {
            //     return {
            //         download,
            //         downloadUrl,
            //         audio: {
            //             source: {
            //                 src: previewUrl,
            //                 type: file.mimeType,
            //             },
            //             attributes: {
            //                 autoplay: false,
            //                 loop: false,
            //                 muted: false,
            //             },
            //         },
            //         alt: file.name,
            //     };
            // }
            if (isImage(file.extension || "")) {
                return {
                    download,
                    downloadUrl,
                    src: imagePreviewUrl,
                    thumb: thumbnail,
                    type: file.mimeType,
                };
            }

            return {
                download,
                downloadUrl,
                iframe: true,
                src: previewUrl,
                thumb: thumbnail,
            };
        });
        if (!dynamicEl.length) return;

        // Initialize gallery after React renders DOM
        // Use requestAnimationFrame for safety
        const frame = requestAnimationFrame(() => {
            gallery.current = new PNGallery({
                containerSelector: ".pnpnd-file-list",
                items: dynamicEl,
                autoplaySpeed: 2500,
                showThumbnails: showThumbnails,
            });
        });

        return () => {
            cancelAnimationFrame(frame);
            if (gallery.current && gallery.current.destroy) {
                gallery.current.destroy();
                gallery.current = null;
            }
        };
    }, [mediaFiles]);

    // Open gallery on specific file
    const viewFile = (key: string) => {
        if (!gallery.current) return;
        const index = mediaFiles.findIndex(
            (file: File) => file.fileKey === key,
        );
        if (index === -1) return;

        gallery.current.openGallery(index);
    };

    return { viewFile };
};
