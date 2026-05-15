import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { AdvancedFileList } from "~/types/widget.types";
import SettingsField from "~/components/molecules/SettingsField";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Note from "~/components/molecules/Note";

const FileList = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { fileList } = editData?.data?.advanced || {};
    const { name, thumbnail, actions, extension, date, size } =
        fileList?.listDisplay || {};

    const { secureVideoPlayback } = fileList || {};

    const dispatch = useAppDispatch();

    const handleUpdate = (
        key: keyof AdvancedFileList,
        value: AdvancedFileList[keyof AdvancedFileList],
    ) => {
        if (!fileList) return;

        dispatch(
            updateAdvanced({
                key: "fileList",
                value: { ...fileList, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                title={__("File List Style", "ninja-drive")}
                description={__(
                    "Configure the style of the file list.",
                    "ninja-drive",
                )}
            >
                <SettingsField.SubField
                    title={__(
                        "Select File List Preset",
                        "ninja-drive",
                    )}
                    description={__(
                        "Select a preset style for the file list.",
                        "ninja-drive",
                    )}
                >
                    <ButtonGroup
                        buttons={fileListViewList}
                        selectedKey={fileList?.activeView || "medium"}
                        onChange={(value) =>
                            handleUpdate(
                                "activeView",
                                value as AdvancedFileList["activeView"],
                            )
                        }
                    />
                </SettingsField.SubField>

                <SettingsField.SubField
                    title={__("File Info Display", "ninja-drive")}
                    description={__(
                        "Configure how the file list is displayed.",
                        "ninja-drive",
                    )}
                >
                    <SettingsField
                        description={__(
                            "Show the file thumbnail on the front-side file list.",
                            "ninja-drive",
                        )}
                        action={
                            <Switcher
                                title={__(
                                    "File Thumbnail",
                                    "ninja-drive",
                                )}
                                checked={thumbnail?.enable}
                                onChange={() => {
                                    if (!thumbnail || !fileList) return;
                                    handleUpdate("listDisplay", {
                                        ...fileList?.listDisplay,
                                        thumbnail: {
                                            ...thumbnail,
                                            enable: !thumbnail?.enable,
                                        },
                                    });
                                }}
                            />
                        }
                    />

                    {["list", "table"].includes(fileList?.activeView || "") && (
                        <SettingsField
                            title={__("File Name", "ninja-drive")}
                            description={__(
                                "Show the file name on the front-side file list.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    checked={name?.enable}
                                    onChange={() => {}}
                                    disabled={true}
                                />
                            }
                        >
                            <Input
                                size="small"
                                value={name?.text || ""}
                                onChange={(value) => {
                                    if (!name || !fileList) return;
                                    handleUpdate("listDisplay", {
                                        ...fileList?.listDisplay,
                                        name: {
                                            ...name,
                                            text: value as string,
                                        },
                                    });
                                }}
                                disabled={!name?.enable}
                            />
                        </SettingsField>
                    )}

                    <SettingsField
                        description={__(
                            "Limit the file information to display on the front-side file list. Enter a custom label if needed.",
                            "ninja-drive",
                        )}
                        action={
                            <Switcher
                                title={__(
                                    "File Size",
                                    "ninja-drive",
                                )}
                                checked={size?.enable}
                                onChange={() => {
                                    if (!size || !fileList) return;
                                    handleUpdate("listDisplay", {
                                        ...fileList?.listDisplay,
                                        size: {
                                            ...size,
                                            enable: !size?.enable,
                                        },
                                    });
                                }}
                            />
                        }
                    >
                        {["list", "table"].includes(
                            fileList?.activeView || "",
                        ) && (
                            <Input
                                size="small"
                                value={size?.text || ""}
                                onChange={(value) => {
                                    if (!size || !fileList) return;
                                    handleUpdate("listDisplay", {
                                        ...fileList?.listDisplay,
                                        size: {
                                            ...size,
                                            text: value as string,
                                        },
                                    });
                                }}
                                disabled={!size?.enable}
                            />
                        )}
                    </SettingsField>

                    {!["grid", "gallery", "compact"].includes(
                        fileList?.activeView || "",
                    ) && (
                        <SettingsField
                            description={__(
                                "Show or hide the file extension.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    title={__(
                                        "File Extension",
                                        "ninja-drive",
                                    )}
                                    checked={extension?.enable}
                                    onChange={() => {
                                        if (!extension || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            extension: {
                                                ...extension,
                                                enable: !extension?.enable,
                                            },
                                        });
                                    }}
                                />
                            }
                        >
                            {["list", "table"].includes(
                                fileList?.activeView || "",
                            ) && (
                                <Input
                                    size="small"
                                    value={extension?.text || ""}
                                    onChange={(value) => {
                                        if (!extension || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            extension: {
                                                ...extension,
                                                text: value as string,
                                            },
                                        });
                                    }}
                                    disabled={!extension?.enable}
                                />
                            )}
                        </SettingsField>
                    )}

                    {!["gallery", "compact"].includes(
                        fileList?.activeView || "",
                    ) && (
                        <SettingsField
                            description={__(
                                "Show the file date, either last changed or when added to the list.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    title={__(
                                        "File Date",
                                        "ninja-drive",
                                    )}
                                    checked={date?.enable}
                                    onChange={() => {
                                        if (!date || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            date: {
                                                ...date,
                                                enable: !date?.enable,
                                            },
                                        });
                                    }}
                                />
                            }
                        >
                            {["list", "table"].includes(
                                fileList?.activeView || "",
                            ) && (
                                <Input
                                    size="small"
                                    value={date?.text || ""}
                                    onChange={(value) => {
                                        if (!date || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            date: {
                                                ...date,
                                                text: value as string,
                                            },
                                        });
                                    }}
                                    disabled={!date?.enable}
                                />
                            )}
                        </SettingsField>
                    )}

                    {!["gallery"].includes(fileList?.activeView || "") && (
                        <SettingsField
                            description={__(
                                "Show or hide the file actions.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    title={__(
                                        "File Actions",
                                        "ninja-drive",
                                    )}
                                    checked={actions?.enable}
                                    onChange={() => {
                                        if (!actions || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            actions: {
                                                ...actions,
                                                enable: !actions?.enable,
                                            },
                                        });
                                    }}
                                />
                            }
                        >
                            {["list", "table"].includes(
                                fileList?.activeView || "",
                            ) && (
                                <Input
                                    size="small"
                                    value={actions?.text || ""}
                                    onChange={(value) => {
                                        if (!actions || !fileList) return;
                                        handleUpdate("listDisplay", {
                                            ...fileList?.listDisplay,
                                            actions: {
                                                ...actions,
                                                text: value as string,
                                            },
                                        });
                                    }}
                                    disabled={!actions?.enable}
                                />
                            )}
                        </SettingsField>
                    )}
                </SettingsField.SubField>
            </SettingsField>

        </>
    );
};

export default FileList;

export const fileListViewList: {
    key: AdvancedFileList["activeView"];
    title: string;
    startIcon: string;
}[] = [
    {
        key: "list",
        title: __("List", "ninja-drive"),
        startIcon: "list",
    },
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        startIcon: "grid_view",
    },
    {
        key: "compact",
        title: __("Compact", "ninja-drive"),
        startIcon: "table_rows",
    },
    {
        key: "table",
        title: __("Table", "ninja-drive"),
        startIcon: "table",
    },
    {
        key: "gallery",
        title: __("Gallery", "ninja-drive"),
        startIcon: "grid_view",
    },
    {
        key: "timeline",
        title: __("Timeline", "ninja-drive"),
        startIcon: "schedule",
    },
];
