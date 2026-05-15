import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { AdvancedEmbedDocuments } from "~/types/widget.types";
import SettingsField from "~/components/molecules/SettingsField";
import Slider from "~/components/atoms/Slider";
import Switcher from "~/components/atoms/Switcher";
import Note from "~/components/molecules/Note";
import { __ } from "@wordpress/i18n";

const EmbedDocuments = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { embedDocuments } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const handleUpdate = (
        key: keyof AdvancedEmbedDocuments,
        value: AdvancedEmbedDocuments[keyof AdvancedEmbedDocuments],
    ) => {
        if (!embedDocuments) return;

        dispatch(
            updateAdvanced({
                key: "embedDocuments",
                value: { ...embedDocuments, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                description={__(
                    "Show or hide the file name below the embedded document.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Show File Name", "ninja-drive")}
                        checked={embedDocuments?.showFileName}
                        onChange={() =>
                            handleUpdate(
                                "showFileName",
                                !embedDocuments?.showFileName,
                            )
                        }
                    />
                }
            />

            <SettingsField title={__("Iframe Dimensions", "ninja-drive")}>
                <SettingsField.SubField title={__("Width", "ninja-drive")}>
                    <Slider
                        min={embedDocuments?.width?.unit === "%" ? 30 : 600}
                        max={embedDocuments?.width?.unit === "%" ? 100 : 1920}
                        defaultValue={100}
                        value={embedDocuments?.width?.value ?? 100}
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
                        unitValue={[embedDocuments?.width?.unit || "%"]}
                        reset
                    />
                </SettingsField.SubField>

                <SettingsField.SubField title={__("Height", "ninja-drive")}>
                    <Slider
                        min={embedDocuments?.height?.unit === "px" ? 300 : 30}
                        max={embedDocuments?.height?.unit === "px" ? 1080 : 100}
                        defaultValue={600}
                        value={embedDocuments?.height?.value ?? 600}
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
                        unitValue={[embedDocuments?.height?.unit || "px"]}
                        reset
                    />
                </SettingsField.SubField>

                <SettingsField
                    description={__(
                        "Allow the document to be opened in a new tab.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__("Allow Pop Out", "ninja-drive")}
                            checked={embedDocuments?.allowPopOut}
                            onChange={() =>
                                handleUpdate(
                                    "allowPopOut",
                                    !embedDocuments?.allowPopOut,
                                )
                            }
                        />
                    }
                >
                    <Note type="info">
                        <Note.Normal>
                            {__(
                                "If the pop-out option is disabled, users will be able to view the embedded document only on your website and not on Google Drive.",
                                "ninja-drive",
                            )}
                        </Note.Normal>
                    </Note>
                </SettingsField>
            </SettingsField>
        </>
    );
};

export default EmbedDocuments;
