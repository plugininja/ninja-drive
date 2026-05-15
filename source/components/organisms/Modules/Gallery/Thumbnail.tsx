import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { useState } from "@wordpress/element";

const Thumbnail = ({ src, alt }: { src: string; alt: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <>
            {!imageLoaded && !imageError && (
                <SkeletonLoader
                    width="100%"
                    height="100%"
                    style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                    }}
                />
            )}

            {!imageError && src && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}
        </>
    );
};

export default Thumbnail;
