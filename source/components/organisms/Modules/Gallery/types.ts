import { File } from "~/types/file.types";
import { AdvancedGallery } from "~/types/widget.types";

export interface GalleryTemplateProps {
    images: File[];
    onImageClick: (image: File) => void;
    thumbnailQuality: AdvancedGallery["thumbnailQuality"];
}
