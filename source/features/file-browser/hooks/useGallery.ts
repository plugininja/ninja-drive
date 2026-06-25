import { isFolder, isImage, isVideo } from "~features/file-browser/utils/file";
import { File } from "~features/file-browser/types/file.types";
import { useEffect, useRef } from "@wordpress/element";

export const useGallery = (
    currentFiles: File[],
    widget_id?: string,
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
                file.file_key,
                file.name,
                widget_id,
                undefined,
                file.extension,
            );
            const imagePreviewUrl = PNPNDHelper.getUrl(
                "thumbnail",
                file.file_key,
                file.name,
                widget_id,
                "5xl",
                file.extension,
            );
            const thumbnail = PNPNDHelper.getUrl(
                "thumbnail",
                file.file_key,
                file.name,
                widget_id,
                "md",
                file.extension,
            );

            const downloadUrl = PNPNDHelper.getUrl(
                "download",
                file.file_key,
                file.name,
                widget_id,
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
                            type: file.mime_type,
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
            //                 type: file.mime_type,
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
                    type: file.mime_type,
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
            (file: File) => file.file_key === key,
        );
        if (index === -1) return;

        gallery.current.openGallery(index);
    };

    return { viewFile };
};
