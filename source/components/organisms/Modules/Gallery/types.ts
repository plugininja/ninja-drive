import { StyleGallery } from "~/types/widget.types";
import { File } from "~/types/file.types";

export interface GalleryTemplateProps {
    images: File[];
    onImageClick: (image: File) => void;
    thumbnail_quality: StyleGallery["thumbnail_quality"];
}
