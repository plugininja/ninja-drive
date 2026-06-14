import { updateStyle } from "~/store/features/widgetBuilderSlice";
import PageContainer from "~/components/molecules/PageContainer";
import SettingsField from "~/components/molecules/SettingsField";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import { StyleEmbedDocuments } from "~/types/widget.types";
import BlockStack from "~/components/molecules/BlockStack";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Slider from "~/components/atoms/Slider";
import Note from "~/components/molecules/Note";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";

const EmbedDocuments = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { embed_documents } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const handleUpdate = (
        key: keyof StyleEmbedDocuments,
        value: StyleEmbedDocuments[keyof StyleEmbedDocuments],
    ) => {
        if (!embed_documents) return;

        dispatch(
            updateStyle({
                key: "embed_documents",
                value: { ...embed_documents, [key]: value },
            }),
        );
    };

    return (
        <PageContainer
            compact
            style={{ margin: "0 auto" }}
            title={__("Embed Settings", "ninja-drive")}
            docLink={DOCS?.MODULE_BUILDER?.style?.link}
        >
            <SettingsField
                description={__(
                    "Show or hide the file name below the embedded document.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Show File Name", "ninja-drive")}
                        titleSize="sm"
                        checked={embed_documents?.show_file_name}
                        onChange={() =>
                            handleUpdate(
                                "show_file_name",
                                !embed_documents?.show_file_name,
                            )
                        }
                    />
                }
            >
                <Divider width="100%" height="1px" />

                <InlineStack gap={50}>
                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Iframe Width", "ninja-drive")}
                        </Text>

                        <Slider
                            onlyInput
                            min={
                                embed_documents?.width?.unit === "%" ? 30 : 600
                            }
                            max={
                                embed_documents?.width?.unit === "%"
                                    ? 100
                                    : 1920
                            }
                            defaultValue={100}
                            value={embed_documents?.width?.value ?? 100}
                            onChange={(value, unit) =>
                                handleUpdate("width", {
                                    value,
                                    unit: unit as string,
                                })
                            }
                            unit
                            unitOptions={[
                                {
                                    name: "px",
                                    value: "px",
                                    defaultValue: 700,
                                },
                                {
                                    name: "%",
                                    value: "%",
                                    defaultValue: 100,
                                },
                            ]}
                            defaultUnit="%"
                            unitValue={[embed_documents?.width?.unit || "%"]}
                            reset
                        />
                    </InlineStack>

                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Iframe Height", "ninja-drive")}
                        </Text>

                        <Slider
                            onlyInput
                            min={
                                embed_documents?.height?.unit === "px"
                                    ? 300
                                    : 30
                            }
                            max={
                                embed_documents?.height?.unit === "px"
                                    ? 1080
                                    : 100
                            }
                            defaultValue={600}
                            value={embed_documents?.height?.value ?? 600}
                            onChange={(value, unit) =>
                                handleUpdate("height", {
                                    value,
                                    unit: unit as string,
                                })
                            }
                            unit
                            unitOptions={[
                                {
                                    name: "px",
                                    value: "px",
                                    defaultValue: 600,
                                },
                                {
                                    name: "%",
                                    value: "%",
                                    defaultValue: 100,
                                },
                            ]}
                            defaultUnit="px"
                            unitValue={[embed_documents?.height?.unit || "px"]}
                            reset
                        />
                    </InlineStack>
                </InlineStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={10}>
                    <Switcher
                        title={__("Allow Pop Out", "ninja-drive")}
                        titleSize="sm"
                        checked={embed_documents?.allow_pop_out}
                        onChange={() =>
                            handleUpdate(
                                "allow_pop_out",
                                !embed_documents?.allow_pop_out,
                            )
                        }
                    />

                    <Description
                        text={__(
                            "Allow the document to be opened in a new tab.",
                            "ninja-drive",
                        )}
                    />

                    <Note type="info">
                        <Note.Normal>
                            {__(
                                "If the pop-out option is disabled, users will be able to view the embedded document only on your website and not on Google Drive.",
                                "ninja-drive",
                            )}
                        </Note.Normal>
                    </Note>
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default EmbedDocuments;
