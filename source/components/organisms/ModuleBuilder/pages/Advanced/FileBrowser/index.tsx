import { AdvancedFileBrowser, TPreviewStyle } from "~/types/widget.types";
import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { VIEW_STYLE_BUTTONS } from "~/constants/widget";
import SettingsField from "~/components/molecules/SettingsField";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Note from "~/components/molecules/Note";

const FileBrowser = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { fileBrowser } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const {
        folderView,
        headerOptions,
        listViewTableHead,
        secureVideoPlayback,
    } = fileBrowser || {};

    const handleUpdate = (
        key: keyof AdvancedFileBrowser,
        value: AdvancedFileBrowser[keyof AdvancedFileBrowser],
    ) => {
        dispatch(
            updateAdvanced({
                key: "fileBrowser",
                value: {
                    ...fileBrowser,
                    [key]: value,
                },
            }),
        );
    };

    return (
        <>
            {folderView && (
                <SettingsField
                    title="Default View Style"
                    description="Choose default view style for the file browser"
                >
                    <ButtonGroup
                        background="primary-extralight"
                        buttons={VIEW_STYLE_BUTTONS}
                        selectedKey={folderView || "grid"}
                        onChange={(value) =>
                            handleUpdate("folderView", value as TPreviewStyle)
                        }
                    />
                </SettingsField>
            )}

            {folderView === "list" && (
                <SettingsField
                    description={__(
                        "Set the widget container width and height. You  can use any valid CSS unit (pixels, percentage), eg '360px', '780px',  '80%'. Keep blank for default value.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__(
                                "List View Table Head Fields Name",
                                "ninja-drive",
                            )}
                            checked={listViewTableHead?.enable}
                            onChange={() =>
                                handleUpdate("listViewTableHead", {
                                    ...listViewTableHead,
                                    enable: !listViewTableHead?.enable,
                                })
                            }
                        />
                    }
                >
                    {fileBrowser?.listViewTableHead?.enable && (
                        <>
                            <SettingsField.SubField
                                secondaryAction={
                                    <Input
                                        size="small"
                                        label={__(
                                            "File Name Column",
                                            "ninja-drive",
                                        )}
                                        helperText={__(
                                            "File name column text here.",
                                            "ninja-drive",
                                        )}
                                        value={listViewTableHead?.name || ""}
                                        onChange={(value) =>
                                            handleUpdate("listViewTableHead", {
                                                ...listViewTableHead,
                                                name: value as string,
                                            })
                                        }
                                    />
                                }
                            />

                            <SettingsField.SubField
                                secondaryAction={
                                    <Input
                                        size="small"
                                        label={__(
                                            "File Type Column",
                                            "ninja-drive",
                                        )}
                                        helperText={__(
                                            "File type column text here.",
                                            "ninja-drive",
                                        )}
                                        value={listViewTableHead?.type || ""}
                                        onChange={(value) =>
                                            handleUpdate("listViewTableHead", {
                                                ...listViewTableHead,
                                                type: value as string,
                                            })
                                        }
                                    />
                                }
                            />

                            <SettingsField.SubField
                                secondaryAction={
                                    <Input
                                        size="small"
                                        label={__(
                                            "File Size Column",
                                            "ninja-drive",
                                        )}
                                        helperText={__(
                                            "File size column text here.",
                                            "ninja-drive",
                                        )}
                                        value={listViewTableHead?.size || ""}
                                        onChange={(value) =>
                                            handleUpdate("listViewTableHead", {
                                                ...listViewTableHead,
                                                size: value as string,
                                            })
                                        }
                                    />
                                }
                            />

                            <SettingsField.SubField
                                secondaryAction={
                                    <Input
                                        size="small"
                                        label={__(
                                            "File Updated Column",
                                            "ninja-drive",
                                        )}
                                        helperText={__(
                                            "File updated column text here.",
                                            "ninja-drive",
                                        )}
                                        value={listViewTableHead?.updated || ""}
                                        onChange={(value) =>
                                            handleUpdate("listViewTableHead", {
                                                ...listViewTableHead,
                                                updated: value as string,
                                            })
                                        }
                                    />
                                }
                            />

                            <SettingsField.SubField
                                secondaryAction={
                                    <Input
                                        size="small"
                                        label={__(
                                            "File Action Column",
                                            "ninja-drive",
                                        )}
                                        helperText={__(
                                            "File action column text here.",
                                            "ninja-drive",
                                        )}
                                        value={listViewTableHead?.action || ""}
                                        onChange={(value) =>
                                            handleUpdate("listViewTableHead", {
                                                ...listViewTableHead,
                                                action: value as string,
                                            })
                                        }
                                    />
                                }
                            />
                        </>
                    )}
                </SettingsField>
            )}

        </>
    );
};

export default FileBrowser;
