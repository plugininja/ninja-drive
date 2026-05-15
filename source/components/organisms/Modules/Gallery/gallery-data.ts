export interface GalleryImage {
  id: number;
  src: string;
  title: string;
  description: string;
  category: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/gallery/01.jpg",
    title: "Ocean Waves",
    description: "Turquoise waters meeting pristine shores",
    category: "Seascape",
  },
  {
    id: 2,
    src: "/gallery/02.jpg",
    title: "Alpine Mirror",
    description: "Mountain reflections on a still lake",
    category: "Landscape",
  },
  {
    id: 3,
    src: "/gallery/03.jpg",
    title: "Enchanted Forest",
    description: "Sunbeams piercing through ancient trees",
    category: "Nature",
  },
  {
    id: 4,
    src: "/gallery/04.jpg",
    title: "City Twilight",
    description: "Urban skyline at the golden hour",
    category: "Urban",
  },
  {
    id: 5,
    src: "/gallery/05.jpg",
    title: "Sky Voyage",
    description: "Hot air balloons drifting at sunrise",
    category: "Travel",
  },
  {
    id: 6,
    src: "/gallery/06.jpg",
    title: "Morning Dew",
    description: "Macro detail on a delicate petal",
    category: "Macro",
  },
  {
    id: 7,
    src: "/gallery/07.jpg",
    title: "Northern Lights",
    description: "Aurora dancing over frozen landscapes",
    category: "Night Sky",
  },
  {
    id: 8,
    src: "/gallery/08.jpg",
    title: "Golden Fields",
    description: "Wheat stretching to the horizon",
    category: "Countryside",
  },
  {
    id: 9,
    src: "/gallery/09.jpg",
    title: "Cherry Bloom",
    description: "Sakura petals in a serene temple garden",
    category: "Culture",
  },
  {
    id: 10,
    src: "/gallery/10.jpg",
    title: "Desert Curves",
    description: "Sand dunes sculpted by the wind",
    category: "Desert",
  },
  {
    id: 11,
    src: "/gallery/11.jpg",
    title: "Coral Kingdom",
    description: "Vibrant life beneath the surface",
    category: "Underwater",
  },
  {
    id: 12,
    src: "/gallery/12.jpg",
    title: "Autumn Road",
    description: "A winding path through fall foliage",
    category: "Landscape",
  },
];

export type TemplateType =
  | "grid"
  | "masonry"
  | "mosaic"
  | "carousel"
  | "polaroid"
  | "showcase";

export interface Template {
  id: TemplateType;
  label: string;
}

export const templates: Template[] = [
  { id: "grid", label: "Classic Grid" },
  { id: "masonry", label: "Masonry" },
  { id: "mosaic", label: "Mosaic" },
  { id: "carousel", label: "Carousel" },
  { id: "polaroid", label: "Polaroid" },
  { id: "showcase", label: "Showcase" },
];
