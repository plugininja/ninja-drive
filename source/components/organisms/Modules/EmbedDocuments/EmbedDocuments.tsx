import BlockStack from "~/components/molecules/BlockStack";
import { ModuleConfig } from "~/types/widget.types";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";

const EmbedDocuments = ({
    data,
    files,
}: {
    data: ModuleConfig;
    files: File[];
}) => {
    const { show_file_name, width, height, allow_pop_out } =
        data?.data?.style?.embed_documents || {};

    const getIframeWidth = () => {
        if (width) return `${width?.value}${width?.unit}`;
        return "100%";
    };

    const getIframeHeight = () => {
        if (height) return `${height?.value}${height?.unit}`;
        return "600px";
    };

    const sandbox = ["allow-same-origin", "allow-scripts", "allow-forms"];

    if (allow_pop_out) {
        sandbox.push("allow-popups");
    }

    return (
        <BlockStack gap={10}>
            {files.map((file) => (
                <Card
                    padding={0}
                    key={file.file_key}
                    background="white"
                    borderStyle="none"
                    style={{ position: "relative" }}
                >
                    {show_file_name && <Text>{file.name}</Text>}

                    <iframe
                        src={PNPNDHelper.getUrl(
                            "preview",
                            file.file_key,
                            file.name,
                            data?.id,
                            undefined,
                            file.extension,
                        )}
                        title={file.name}
                        width={getIframeWidth()}
                        height={getIframeHeight()}
                        allow="autoplay"
                        sandbox={sandbox.join(" ")}
                        aria-label={__(
                            "To enrich screen reader interactions, please activate Accessibility in Grammarly extension settings",
                            "ninja-drive",
                        )}
                        referrerPolicy="no-referrer"
                        allowFullScreen
                        style={{
                            border: "none",
                            marginTop: show_file_name ? "10px" : "0",
                        }}
                    />
                </Card>
            ))}
        </BlockStack>
    );
};

export default EmbedDocuments;
