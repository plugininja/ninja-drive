import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import SettingsField from "~/components/molecules/SettingsField";
import AutoFillInput from "~/components/molecules/AutoFillInput";
import Disabled from "~/components/molecules/Disabled";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Slider from "~/components/atoms/Slider";
import Switcher from "~/components/atoms/Switcher";
import Note from "~/components/molecules/Note";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import {
    AdvancedFileUploader,
    MBAdvanced,
    TPreviewStyle,
} from "~/types/widget.types";
import {
    FILE_LOADING_TYPE_BUTTONS,
    VIEW_STYLE_BUTTONS,
} from "~/constants/widget";

const FileUploader = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { fileUploader } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const {
        folderUpload,
        multipleUpload,
        uploadPreview,
        showBoxLabel,
        labelText,
        renameFile,
        uploadImmediately,
        showUploadConfirmation,
        confirmationMessage,
        secureVideoPlayback,
    } = fileUploader || {};

    const handleUpdate = (
        key: keyof AdvancedFileUploader,
        value: AdvancedFileUploader[keyof AdvancedFileUploader],
    ) => {
        if (!fileUploader) return;

        dispatch(
            updateAdvanced({
                key: "fileUploader",
                value: { ...fileUploader, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                title={__("Configurations", "ninja-drive")}
            >
                <SettingsField.SubField
                    description={__(
                        "Allow users to upload multiple files at once.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__(
                                "Folder Upload",
                                "ninja-drive",
                            )}
                            checked={folderUpload}
                            onChange={() =>
                                handleUpdate("folderUpload", !folderUpload)
                            }
                        />
                    }
                />

                <SettingsField.SubField
                    description={__(
                        "Allow users to select multiple files at once.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__(
                                "Multiple Selection",
                                "ninja-drive",
                            )}
                            checked={multipleUpload}
                            onChange={() =>
                                handleUpdate("multipleUpload", !multipleUpload)
                            }
                        />
                    }
                />
            </SettingsField>

            <SettingsField
                description={__(
                    "Allow users to upload multiple files at once.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__(
                            "Uploader Preview Mode",
                            "ninja-drive",
                        )}
                        checked={uploadPreview?.enable}
                        onChange={() => {
                            if (!fileUploader) return;
                            handleUpdate("uploadPreview", {
                                ...fileUploader?.uploadPreview,
                                enable: !fileUploader?.uploadPreview?.enable,
                            });
                        }}
                    />
                }
            >
                {fileUploader?.uploadPreview?.enable && (
                    <>
                        <SettingsField.SubField
                            title={__(
                                "File Loading Type",
                                "ninja-drive",
                            )}
                            description={__(
                                "Choose how files are loaded in the widget.",
                                "ninja-drive",
                            )}
                        >
                            <ButtonGroup
                                buttons={FILE_LOADING_TYPE_BUTTONS}
                                selectedKey={
                                    editData?.data?.advanced?.files
                                        ?.loadingType || "load_more"
                                }
                                onChange={(value) => {
                                    if (!editData) return;
                                    dispatch(
                                        updateAdvanced({
                                            key: "files",
                                            value: {
                                                ...editData?.data?.advanced
                                                    ?.files,
                                                loadingType:
                                                    value as MBAdvanced["files"]["loadingType"],
                                            },
                                        }),
                                    );
                                }}
                            />

                            <SettingsField
                                title={__(
                                    "Files in First Render",
                                    "ninja-drive",
                                )}
                                description={__(
                                    "How many files to display initially.",
                                    "ninja-drive",
                                )}
                            >
                                <Slider
                                    min={5}
                                    max={50}
                                    defaultValue={20}
                                    value={
                                        editData?.data?.advanced?.files
                                            ?.perPage ?? 20
                                    }
                                    onChange={(value) => {
                                        if (!editData) return;
                                        dispatch(
                                            updateAdvanced({
                                                key: "files",
                                                value: {
                                                    ...editData?.data?.advanced
                                                        ?.files,
                                                    perPage: value,
                                                },
                                            }),
                                        );
                                    }}
                                    reset
                                />
                            </SettingsField>
                        </SettingsField.SubField>

                        <SettingsField
                            title={__(
                                "Default View Style",
                                "ninja-drive",
                            )}
                            description={__(
                                "Choose default view style for the file browser",
                                "ninja-drive",
                            )}
                        >
                            <ButtonGroup
                                background="primary-extralight"
                                buttons={VIEW_STYLE_BUTTONS}
                                selectedKey={
                                    uploadPreview?.previewStyle || "grid"
                                }
                                onChange={(value) => {
                                    if (!fileUploader) return;

                                    handleUpdate("uploadPreview", {
                                        ...fileUploader?.uploadPreview,
                                        previewStyle: value as TPreviewStyle,
                                    });
                                }}
                            />
                        </SettingsField>

                        <SettingsField.SubField
                            description={__(
                                "Show/ hide the file browser header.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    title={__(
                                        "Show Header",
                                        "ninja-drive",
                                    )}
                                    checked={
                                        fileUploader?.uploadPreview?.showHeader
                                            ?.enable
                                    }
                                    onChange={() => {
                                        if (!fileUploader) return;
                                        dispatch(
                                            updateAdvanced({
                                                key: "fileUploader",
                                                value: {
                                                    ...fileUploader,
                                                    uploadPreview: {
                                                        ...fileUploader?.uploadPreview,
                                                        showHeader: {
                                                            ...fileUploader
                                                                ?.uploadPreview
                                                                ?.showHeader,
                                                            enable: !fileUploader
                                                                ?.uploadPreview
                                                                ?.showHeader
                                                                ?.enable,
                                                        },
                                                    },
                                                },
                                            }),
                                        );
                                    }}
                                />
                            }
                        >
                            {uploadPreview?.showHeader?.enable &&
                                FILE_UPLOADER_HEADER_OPTIONS.map(
                                    ({ key, title, description }) => (
                                        <SettingsField
                                            key={key}
                                            description={description}
                                            action={
                                                <Switcher
                                                    title={title}
                                                    checked={
                                                        uploadPreview
                                                            ?.showHeader?.[key]
                                                    }
                                                    onChange={() =>
                                                        handleUpdate(
                                                            "uploadPreview",
                                                            {
                                                                ...uploadPreview,
                                                                showHeader: {
                                                                    ...uploadPreview?.showHeader,
                                                                    [key]: !uploadPreview
                                                                        ?.showHeader?.[
                                                                        key
                                                                    ],
                                                                },
                                                            },
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                    ),
                                )}
                        </SettingsField.SubField>

                        <SettingsField.SubField
                            description={__(
                                "Set the widget container width and height. You  can use any valid CSS unit (pixels, percentage), eg '360px', '780px',  '80%'. Keep blank for default value.",
                                "ninja-drive",
                            )}
                            action={
                                <Switcher
                                    title={__(
                                        "List View Table Header Names",
                                        "ninja-drive",
                                    )}
                                    checked={
                                        uploadPreview?.listViewTableHead?.enable
                                    }
                                    onChange={() => {
                                        if (!uploadPreview) return;

                                        handleUpdate("uploadPreview", {
                                            ...uploadPreview,
                                            listViewTableHead: {
                                                ...uploadPreview?.listViewTableHead,
                                                enable: !uploadPreview
                                                    ?.listViewTableHead?.enable,
                                            },
                                        });
                                    }}
                                />
                            }
                        >
                            {uploadPreview?.listViewTableHead?.enable &&
                                FILE_LIST_HEADER_OPTIONS.map(
                                    ({ key, title, description }) => (
                                        <SettingsField
                                            key={key}
                                            secondaryAction={
                                                <Input
                                                    size="small"
                                                    label={title}
                                                    helperText={description}
                                                    value={
                                                        uploadPreview
                                                            ?.listViewTableHead?.[
                                                            key
                                                        ] || ""
                                                    }
                                                    onChange={(value) =>
                                                        handleUpdate(
                                                            "uploadPreview",
                                                            {
                                                                ...uploadPreview,
                                                                listViewTableHead:
                                                                    {
                                                                        ...uploadPreview?.listViewTableHead,
                                                                        [key]: value,
                                                                    },
                                                            },
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                    ),
                                )}
                        </SettingsField.SubField>
                    </>
                )}
            </SettingsField>

            <SettingsField
                description={__(
                    "Show a label text above the upload box.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        id="showBoxUploadLabel"
                        title={__(
                            "Show Upload Box Label",
                            "ninja-drive",
                        )}
                        checked={showBoxLabel}
                        onChange={() =>
                            handleUpdate("showBoxLabel", !showBoxLabel)
                        }
                    />
                }
            >
                <SettingsField.SubField
                    depend={!showBoxLabel}
                    dependOn="showBoxUploadLabel"
                    title={__("Label Text", "ninja-drive")}
                    description={__(
                        "Enter the uploader label text.",
                        "ninja-drive",
                    )}
                    secondaryAction={
                        <Input
                            size="small"
                            fullWidth={false}
                            value={labelText || ""}
                            onChange={(value) =>
                                handleUpdate("labelText", value as string)
                            }
                        />
                    }
                />
            </SettingsField>

            <SettingsField
                title={__("File Rename", "ninja-drive")}
            >
                <AutoFillInput
                    max={5}
                    defaultSeparator="hyphen"
                    example
                    value={renameFile || ""}
                    onChange={(value) => handleUpdate("renameFile", value)}
                >
                    <AutoFillInput.Options
                        title={
                            <Text
                                weight="medium"
                                style={{
                                    marginBottom: "5px",
                                }}
                            >
                                {__(
                                    "Available tags (click to insert/remove, max 5)",
                                    "ninja-drive",
                                )}
                            </Text>
                        }
                        options={FILE_RENAME_TAGS_FILE}
                    />

                    <AutoFillInput.Options options={FILE_RENAME_TAGS_POST} />

                    <AutoFillInput.Options
                        title={
                            <Note>
                                <Note.Title title="Note" />

                                <Note.Text>
                                    {__(
                                        "Those tags are only available for the login users.",
                                        "ninja-drive",
                                    )}
                                </Note.Text>
                            </Note>
                        }
                        options={FILE_RENAME_TAGS_USER}
                    />

                    <AutoFillInput.Options
                        title={
                            <Note>
                                <Note.Title title="Note" />

                                <Note.Text>
                                    {__(
                                        "Those tags are only available on the WooCommerce Single Product page.",
                                        "ninja-drive",
                                    )}
                                </Note.Text>
                            </Note>
                        }
                        options={FILE_RENAME_TAGS_WC}
                        disabled
                    />
                </AutoFillInput>
            </SettingsField>

            <SettingsField
                description={__(
                    "Start uploading files immediately after they are selected.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        id="uploadImmediately"
                        title={__(
                            "Upload Immediately",
                            "ninja-drive",
                        )}
                        checked={uploadImmediately}
                        onChange={() =>
                            handleUpdate(
                                "uploadImmediately",
                                !uploadImmediately,
                            )
                        }
                    />
                }
            />

            <Disabled depend={uploadImmediately} dependOn="uploadImmediately">
                <SettingsField
                    description={__(
                        "Show/ hide the upload confirmation message after upload is complete.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__(
                                "Show Upload Confirmation",
                                "ninja-drive",
                            )}
                            checked={showUploadConfirmation}
                            onChange={() =>
                                handleUpdate(
                                    "showUploadConfirmation",
                                    !showUploadConfirmation,
                                )
                            }
                        />
                    }
                >
                    {showUploadConfirmation && (
                        <SettingsField.SubField
                            title={__(
                                "Confirmation Message",
                                "ninja-drive",
                            )}
                            description={__(
                                "Enter the upload confirmation message.",
                                "ninja-drive",
                            )}
                        >
                            <Input
                                size="small"
                                value={confirmationMessage || ""}
                                onChange={(value) =>
                                    handleUpdate(
                                        "confirmationMessage",
                                        value as string,
                                    )
                                }
                            />
                        </SettingsField.SubField>
                    )}
                </SettingsField>
            </Disabled>

        </>
    );
};

export default FileUploader;

const FILE_UPLOADER_HEADER_OPTIONS: {
    key: "breadcrumb" | "sorting";
    title: string;
    description: string;
}[] = [
    {
        key: "breadcrumb",
        title: __("Breadcrumb", "ninja-drive"),
        description: __(
            "Enable it to show breadcrumb in header.",
            "ninja-drive",
        ),
    },
    {
        key: "sorting",
        title: __("Sorting", "ninja-drive"),
        description: __(
            "Enable it to show sorting options in header.",
            "ninja-drive",
        ),
    },
];

const FILE_LIST_HEADER_OPTIONS: {
    key: "name" | "type" | "size" | "updated" | "action";
    title: string;
    description: string;
}[] = [
    {
        key: "name",
        title: __("File Name Column", "ninja-drive"),
        description: __(
            "File name column text here.",
            "ninja-drive",
        ),
    },
    {
        key: "type",
        title: __("File Type Column", "ninja-drive"),
        description: __(
            "File type column text here.",
            "ninja-drive",
        ),
    },
    {
        key: "size",
        title: __("File Size Column", "ninja-drive"),
        description: __(
            "File size column text here.",
            "ninja-drive",
        ),
    },
    {
        key: "updated",
        title: __("File Updated Column", "ninja-drive"),
        description: __(
            "File updated column text here.",
            "ninja-drive",
        ),
    },
    {
        key: "action",
        title: __("File Actions Column", "ninja-drive"),
        description: __(
            "File action column text here.",
            "ninja-drive",
        ),
    },
];

const FILE_RENAME_TAGS_FILE: {
    name: string;
    value: string;
    example?: string;
}[] = [
    {
        name: __("file_name", "ninja-drive"),
        value: "{file_name}",
        example: __("sample", "ninja-drive"),
    },
    {
        name: __("file_extension", "ninja-drive"),
        value: "{file_extension}",
        example: __("txt", "ninja-drive"),
    },
    {
        name: __("queue_index", "ninja-drive"),
        value: "{queue_index}",
        example: __("1", "ninja-drive"),
    },
    {
        name: __("current_date", "ninja-drive"),
        value: "{current_date}",
        example: __("2024-01-31", "ninja-drive"),
    },
    {
        name: __("current_time", "ninja-drive"),
        value: "{current_time}",
        example: __("14-30-15", "ninja-drive"),
    },
    {
        name: __("unique_id", "ninja-drive"),
        value: "{unique_id}",
        example: __("abc123", "ninja-drive"),
    },
];

const FILE_RENAME_TAGS_POST: {
    name: string;
    value: string;
    example?: string;
}[] = [
    {
        name: __("post_id", "ninja-drive"),
        value: "{post_id}",
        example: __("42", "ninja-drive"),
    },
    {
        name: __("post_title", "ninja-drive"),
        value: "{post_title}",
        example: __("example-post", "ninja-drive"),
    },
    {
        name: __("post_slug", "ninja-drive"),
        value: "{post_slug}",
        example: __("example-post-slug", "ninja-drive"),
    },
    {
        name: __("post_author", "ninja-drive"),
        value: "{post_author}",
        example: __("John Doe", "ninja-drive"),
    },
    {
        name: __("post_date", "ninja-drive"),
        value: "{post_date}",
        example: __("2024-01-31", "ninja-drive"),
    },
    {
        name: __("post_modified", "ninja-drive"),
        value: "{post_modified}",
        example: __("2024-01-31", "ninja-drive"),
    },
    {
        name: __("post_status", "ninja-drive"),
        value: "{post_status}",
        example: __("published", "ninja-drive"),
    },
    {
        name: __("post_type", "ninja-drive"),
        value: "{post_type}",
        example: __("blog", "ninja-drive"),
    },
    {
        name: __("post_category", "ninja-drive"),
        value: "{post_category}",
        example: __("tech", "ninja-drive"),
    },
    {
        name: __("post_tags", "ninja-drive"),
        value: "{post_tags}",
        example: __("AI,React", "ninja-drive"),
    },
    {
        name: __("post_meta_{key}", "ninja-drive"),
        value: "{post_meta_{key}}",
        example: __("AI,ReactmetaValue", "ninja-drive"),
    },
];

const FILE_RENAME_TAGS_USER: {
    name: string;
    value: string;
    example?: string;
}[] = [
    {
        name: __("user_login", "ninja-drive"),
        value: "{user_login}",
        example: __("johndoe", "ninja-drive"),
    },
    {
        name: __("user_email", "ninja-drive"),
        value: "{user_email}",
        example: __("john@example.com", "ninja-drive"),
    },
    {
        name: __("first_name", "ninja-drive"),
        value: "{first_name}",
        example: __("John", "ninja-drive"),
    },
    {
        name: __("last_name", "ninja-drive"),
        value: "{last_name}",
        example: __("Doe", "ninja-drive"),
    },
    {
        name: __("display_name", "ninja-drive"),
        value: "{display_name}",
        example: __("JohnD", "ninja-drive"),
    },
    {
        name: __("user_id", "ninja-drive"),
        value: "{user_id}",
        example: __("7", "ninja-drive"),
    },
    {
        name: __("user_role", "ninja-drive"),
        value: "{user_role}",
        example: __("editor", "ninja-drive"),
    },
    {
        name: __("user_meta_{key}", "ninja-drive"),
        value: "{user_meta_{key}}",
        example: __("userMetaValue", "ninja-drive"),
    },
];

const FILE_RENAME_TAGS_WC: { name: string; value: string }[] = [
    {
        name: __("wc_product_name", "ninja-drive"),
        value: "{wc_product_name}",
    },
    {
        name: __("wc_product_id", "ninja-drive"),
        value: "{wc_product_id}",
    },
    {
        name: __("wc_product_sku", "ninja-drive"),
        value: "{wc_product_sku}",
    },
    {
        name: __("wc_product_slug", "ninja-drive"),
        value: "{wc_product_slug}",
    },
    {
        name: __("wc_product_price", "ninja-drive"),
        value: "{wc_product_price}",
    },
    {
        name: __("wc_product_sale_price", "ninja-drive"),
        value: "{wc_product_sale_price}",
    },
    {
        name: __("wc_product_regular_price", "ninja-drive"),
        value: "{wc_product_regular_price}",
    },
    {
        name: __("wc_product_tags", "ninja-drive"),
        value: "{wc_product_tags}",
    },
    {
        name: __("wc_product_type", "ninja-drive"),
        value: "{wc_product_type}",
    },
    {
        name: __("wc_product_status", "ninja-drive"),
        value: "{wc_product_status}",
    },
];
