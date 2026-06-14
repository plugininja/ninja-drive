import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import type { AvatarProps } from "./Avatar.type";
import { Spinner } from "@wordpress/components";
import Card from "~/components/molecules/Card";
import { useState } from "@wordpress/element";
import clsx from "clsx";

const Avatar = ({
    id,
    useKey = false,
    style,
    className,
    src,
    alt,
    width,
    height,
    compact = false,
    rounded = "none",
    objectFit = "cover",
    referrerPolicy = "no-referrer",
    fallback,
    fallBackLimit,
    fallBackBg = "white",
    userSelect = false,
    showSpinner = false,
    customSpinner,
    spinnerColor = "#0073e5",
    spinnerSize = "40px",
}: AvatarProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isCompact = compact && src && !imageError;

    const getFallbackContent = () => {
        if (typeof fallback === "string") {
            return fallback
                .split(/\s+/)
                .filter((word) => word.length > 0)
                .slice(0, fallBackLimit || Infinity)
                .map((word) => word[0].toUpperCase())
                .join("");
        }
        return fallback;
    };

    const styles = {
        width: width || "auto",
        height: height || "auto",
        ...style,
    };

    const imageStyle = {
        display: imageLoaded ? "block" : "none",
        width: isCompact ? "60%" : "100%",
        height: isCompact ? "80%" : "100%",
        objectFit: objectFit,
    };

    const shouldShowSpinner =
        showSpinner && !!src && !imageLoaded && !imageError;

    return (
        <BlockStack
            key={useKey ? src : undefined}
            id={id}
            style={styles}
            align="center"
            inlineAlign="center"
            className={className}
        >
            {shouldShowSpinner && (
                <BlockStack
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    align="center"
                    inlineAlign="center"
                >
                    {customSpinner ? (
                        customSpinner
                    ) : (
                        <Spinner
                            style={{
                                height: spinnerSize,
                                width: spinnerSize,
                                color: spinnerColor,
                            }}
                        />
                    )}
                </BlockStack>
            )}

            {src && !imageError && (
                <img
                    src={src}
                    alt={alt}
                    style={{
                        ...imageStyle,
                        userSelect: userSelect ? "auto" : "none",
                    }}
                    className={clsx(`rounded-${rounded}`)}
                    referrerPolicy={referrerPolicy}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}

            {(!src || imageError) && (
                <InlineStack align="center">
                    <Card
                        padding={0}
                        style={styles}
                        background={fallBackBg}
                        rounded={rounded}
                        flex
                        align="center"
                        blockAlign="center"
                        className="text-black font-semibold"
                    >
                        {getFallbackContent()}
                    </Card>
                </InlineStack>
            )}
        </BlockStack>
    );
};

export default Avatar;
