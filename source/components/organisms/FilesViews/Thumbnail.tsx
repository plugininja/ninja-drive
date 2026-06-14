import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { isAudio, isFolder, isShortcut } from "~/utils/file";
import IconButton from "~/components/molecules/IconButton";
import { MENU_KEYS, MenuKey } from "~/types/Types";
import Card from "~/components/molecules/Card";
import { useFilesContext } from "./FilesViews";
import { useState } from "@wordpress/element";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const Thumbnail = ({
    style,
    file,
    compact,
    suggested,
}: {
    style?: React.CSSProperties;
    file: File;
    compact?: boolean;
    suggested?: boolean;
}) => {
    const { widget_id } = useFilesContext();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const _isFolder = isFolder(file.mime_type);
    const _isAudio = isAudio(file.extension || "");
    const _isShortcut = isShortcut(file.extension || "");

    let thumbnail = _isFolder
        ? file.icon
        : PNPNDHelper.getUrl(
              "thumbnail",
              file.file_key,
              file.name,
              widget_id,
              "md",
              file.extension,
          );
    thumbnail = MENU_KEYS.includes(file.file_key as MenuKey)
        ? file.icon
        : thumbnail;

    const shouldShowSkeleton = !!thumbnail && !imageLoaded && !imageError;

    return (
        <Card
            padding={0}
            rounded="sm"
            style={style}
            className={clsx(
                "pnpnd-file-thumbnail",
                compact && "pnpnd-file-thumbnail--compact",
                suggested && "pnpnd-file-thumbnail--suggested",
                !shouldShowSkeleton &&
                    (_isFolder || _isAudio) &&
                    "pnpnd-file-thumbnail--icon",
            )}
        >
            {shouldShowSkeleton && (
                <SkeletonLoader width="100%" height="100%" />
            )}

            {_isShortcut && !compact && (
                <div
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "12px",
                        width: "40px",
                        height: "40px",
                    }}
                >
                    <IconButton
                        name="switch_access_shortcut"
                        size="small"
                        variant="white"
                        title={__("Shortcut File", "ninja-drive")}
                    />
                </div>
            )}
            {!imageError && thumbnail && (
                <img
                    src={thumbnail}
                    alt={file.name}
                    referrerPolicy="no-referrer"
                    className="rounded-sm"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}
        </Card>
    );
};

export default Thumbnail;
