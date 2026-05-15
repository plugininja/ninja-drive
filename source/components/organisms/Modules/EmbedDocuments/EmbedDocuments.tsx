import { __ } from "@wordpress/i18n";
import { ModuleConfig } from "~/types/widget.types";
import BlockStack from "~/components/molecules/BlockStack";
import { File } from "~/types/file.types";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";

const EmbedDocuments = ({
    data,
    files,
}: {
    data: ModuleConfig;
    files: File[];
}) => {
    const { showFileName, width, height, allowPopOut } =
        data?.data?.advanced?.embedDocuments || {};

    const getIframeWidth = () => {
        if (width) return `${width?.value}${width?.unit}`;
        return "100%";
    };

    const getIframeHeight = () => {
        if (height) return `${height?.value}${height?.unit}`;
        return "600px";
    };

    return (
        <BlockStack gap={10}>
            {files.map((file) => (
                <Card
                    padding={0}
                    key={file.fileKey}
                    background="transparent"
                    borderStyle="none"
                >
                    {showFileName && <Text>{file.name}</Text>}

                    <iframe
                        src={PNPNDHelper.getUrl(
                            "preview",
                            file.fileKey,
                            file.name,
                            data?.id,
                            undefined,
                            file.extension,
                        )}
                        title={file.name}
                        width={getIframeWidth()}
                        height={getIframeHeight()}
                        allow="autoplay"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        aria-label={__("To enrich screen reader interactions, please activate Accessibility in Grammarly extension settings", "ninja-drive")}
                        referrerPolicy="no-referrer"
                        allowFullScreen
                        style={{
                            pointerEvents: allowPopOut ? "auto" : "none",
                            border: "none",
                            marginTop: showFileName ? "10px" : "0",
                        }}
                    />
                </Card>
            ))}
        </BlockStack>
    );
};

export default EmbedDocuments;
