import { StyleGallery } from "~features/widget-builder/types/widget.types";
import { File } from "~features/file-browser/types/file.types";

export interface GalleryTemplateProps {
    images: File[];
    onImageClick: (image: File) => void;
    thumbnail_quality: StyleGallery["thumbnail_quality"];
}
