import { updateStyle } from "~/store/features/widgetBuilderSlice";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import AutoFillInput from "~/components/molecules/AutoFillInput";
import { FILE_LOADING_TYPE_BUTTONS } from "~/constants/widget";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import Switcher from "~/components/atoms/Switcher";
import Checkbox from "~/components/atoms/Checkbox";
import Divider from "~/components/atoms/Divider";
import Slider from "~/components/atoms/Slider";
import Note from "~/components/molecules/Note";
import Radio from "~/components/atoms/Radio";
import Input from "~/components/atoms/Input";
import Tabs from "~/components/atoms/Tabs";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import {
    MBStyle,
    StyleFileUploader,
    TPreviewStyle,
} from "~/types/widget.types";

const FileUploader = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { file_uploader } = edit_data?.data?.style || {};

    const dispatch = useAppDispatch();

    const {
        folder_upload,
        multiple_upload,
        upload_preview,
        label_text,
        rename_file,
        upload_immediately,
        show_upload_confirmation,
        confirmation_message,
    } = file_uploader || {};

    const handleUpdate = (
        key: keyof StyleFileUploader,
        value: StyleFileUploader[keyof StyleFileUploader],
    ) => {
        if (!file_uploader) return;

        dispatch(
            updateStyle({
                key: "file_uploader",
                value: { ...file_uploader, [key]: value },
            }),
        );
    };

    return (
        <>
            <PageContainer
                compact
                style={{ margin: "0 auto" }}
                title={__("Upload Settings", "ninja-drive")}
                docLink={DOCS?.MODULE_BUILDER?.style?.link}
            >
                <SettingsField>
                    <BlockStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Upload Box Label", "ninja-drive")}
                        </Text>

                        <Input
                            size="small"
                            background="gray-50"
                            color="gray-200"
                            value={label_text || ""}
                            onChange={(value) =>
                                handleUpdate("label_text", value as string)
                            }
                        />
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Folder Upload", "ninja-drive")}
                            titleSize="sm"
                            checked={folder_upload}
                            onChange={() =>
                                handleUpdate("folder_upload", !folder_upload)
                            }
                        />

                        <Description
                            text={__(
                                "Allow users to upload multiple files at once.",
                                "ninja-drive",
                            )}
                        />
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={10}>
                        <Switcher
                            title={__("Multiple Selection", "ninja-drive")}
                            titleSize="sm"
                            checked={multiple_upload}
                            onChange={() =>
                                handleUpdate(
                                    "multiple_upload",
                                    !multiple_upload,
                                )
                            }
                        />

                        <Description
                            text={__(
                                "Allow users to select multiple files at once.",
                                "ninja-drive",
                            )}
                        />
                    </BlockStack>

                    <Divider width="100%" height="1px" />

                    <BlockStack gap={20}>
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("Upload Type", "ninja-drive")}
                            </Text>

                            <InlineStack gap={10}>
                                {UPLOAD_TYPE?.map(({ key, title }, index) => (
                                    <Radio
                                        key={key ?? index}
                                        title={title}
                                        checked={
                                            key === "upload_immediately"
                                                ? upload_immediately
                                                : show_upload_confirmation
                                        }
                                        onChange={() => {
                                            dispatch(
                                                updateStyle({
                                                    key: "file_uploader",
                                                    value: {
                                                        ...file_uploader!,
                                                        upload_immediately:
                                                            key ===
                                                            "upload_immediately",
                                                        show_upload_confirmation:
                                                            key !==
                                                            "upload_immediately",
                                                    },
                                                }),
                                            );
                                        }}
                                    />
                                ))}
                            </InlineStack>
                        </InlineStack>

                        {show_upload_confirmation && (
                            <SettingsField gap={10} background="gray-50">
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Confirmation Message", "ninja-drive")}
                                </Text>

                                <Input
                                    size="small"
                                    value={confirmation_message || ""}
                                    onChange={(value) =>
                                        handleUpdate(
                                            "confirmation_message",
                                            value as string,
                                        )
                                    }
                                />
                            </SettingsField>
                        )}
                    </BlockStack>
                </SettingsField>
            </PageContainer>

            <PageContainer
                compact
                style={{ margin: "20px auto 0" }}
                title={__("Uploader Preview Mode", "ninja-drive")}
                docLink={DOCS?.MODULE_BUILDER?.style?.link}
            >
                <SettingsField
                    description={__(
                        "Allow users to upload multiple files at once.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__("Uploader Preview Mode", "ninja-drive")}
                            titleSize="sm"
                            checked={upload_preview?.enable}
                            onChange={() => {
                                if (!file_uploader) return;
                                handleUpdate("upload_preview", {
                                    ...file_uploader?.upload_preview,
                                    enable: !file_uploader?.upload_preview
                                        ?.enable,
                                });
                            }}
                        />
                    }
                >
                    {file_uploader?.upload_preview?.enable && (
                        <>
                            <Divider width="100%" height="1px" />

                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("File Loading Type", "ninja-drive")}
                                </Text>

                                <Tabs
                                    size="small"
                                    rounded="md"
                                    tabRounded="sm"
                                    tabs={FILE_LOADING_TYPE_BUTTONS}
                                    active={
                                        edit_data?.data?.style?.files
                                            ?.loading_type || "load_more"
                                    }
                                    onTabClick={(value) => {
                                        if (!edit_data) return;
                                        dispatch(
                                            updateStyle({
                                                key: "files",
                                                value: {
                                                    ...edit_data?.data?.style
                                                        ?.files,
                                                    loading_type:
                                                        value as MBStyle["files"]["loading_type"],
                                                },
                                            }),
                                        );
                                    }}
                                />
                            </InlineStack>

                            <Divider width="100%" height="1px" />

                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Files in First Render", "ninja-drive")}
                                </Text>

                                <Slider
                                    onlyInput
                                    min={2}
                                    max={50}
                                    defaultValue={10}
                                    value={
                                        edit_data?.data?.style?.files
                                            ?.per_page ?? 20
                                    }
                                    onChange={(value) => {
                                        if (!edit_data) return;
                                        dispatch(
                                            updateStyle({
                                                key: "files",
                                                value: {
                                                    ...edit_data?.data?.style
                                                        ?.files,
                                                    per_page: value,
                                                },
                                            }),
                                        );
                                    }}
                                    reset
                                />
                            </InlineStack>

                            <Divider width="100%" height="1px" />

                            <BlockStack gap={15}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Default View Style", "ninja-drive")}
                                </Text>

                                <Tabs
                                    size="small"
                                    rounded="md"
                                    tabRounded="sm"
                                    tabs={VIEW_STYLE_TABS}
                                    active={
                                        upload_preview?.preview_style || "grid"
                                    }
                                    onTabClick={(value) => {
                                        if (!file_uploader) return;

                                        handleUpdate("upload_preview", {
                                            ...file_uploader?.upload_preview,
                                            preview_style:
                                                value as TPreviewStyle,
                                        });
                                    }}
                                />
                            </BlockStack>

                            <Divider width="100%" height="1px" />

                            <BlockStack gap={10}>
                                <Checkbox
                                    rounded="sm"
                                    title={__(
                                        "Table Column Names",
                                        "ninja-drive",
                                    )}
                                    checked={
                                        file_uploader?.upload_preview
                                            ?.list_view_table_head?.enable
                                    }
                                    onChange={() => {
                                        if (!file_uploader) return;
                                        dispatch(
                                            updateStyle({
                                                key: "file_uploader",
                                                value: {
                                                    ...file_uploader,
                                                    upload_preview: {
                                                        ...file_uploader?.upload_preview,
                                                        list_view_table_head: {
                                                            ...file_uploader
                                                                ?.upload_preview
                                                                ?.list_view_table_head,
                                                            enable: !file_uploader
                                                                ?.upload_preview
                                                                ?.list_view_table_head
                                                                ?.enable,
                                                        },
                                                    },
                                                },
                                            }),
                                        );
                                    }}
                                />

                                <Description
                                    text={__(
                                        "Enable or disable table column names.",
                                        "ninja-drive",
                                    )}
                                />

                                {file_uploader?.upload_preview
                                    ?.list_view_table_head?.enable && (
                                    <InlineStack
                                        gap={10}
                                        wrap={false}
                                        marginTop={5}
                                    >
                                        {[
                                            "name",
                                            "type",
                                            "size",
                                            "updated",
                                            "action",
                                        ]?.map((key) => (
                                            <BlockStack key={key} gap={10}>
                                                <Text
                                                    color="gray-700"
                                                    size="sm"
                                                    weight="medium"
                                                    textTransform="capitalize"
                                                >
                                                    {`File ${key} column`}
                                                </Text>

                                                <Input
                                                    size="small"
                                                    background="gray-50"
                                                    color="gray-200"
                                                    fullWidth={false}
                                                    className="flex-1"
                                                    value={
                                                        upload_preview
                                                            ?.list_view_table_head?.[
                                                            key as
                                                                | "name"
                                                                | "type"
                                                                | "size"
                                                                | "updated"
                                                                | "action"
                                                        ] || ""
                                                    }
                                                    onChange={(value) =>
                                                        handleUpdate(
                                                            "upload_preview",
                                                            {
                                                                ...upload_preview,
                                                                list_view_table_head:
                                                                    {
                                                                        ...upload_preview?.list_view_table_head,
                                                                        [key]: value,
                                                                    },
                                                            },
                                                        )
                                                    }
                                                />
                                            </BlockStack>
                                        ))}
                                    </InlineStack>
                                )}
                            </BlockStack>

                            <Divider width="100%" height="1px" />

                            <BlockStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {__("Header Options", "ninja-drive")}
                                </Text>

                                <BlockStack gap={15} marginTop={5}>
                                    {HEADER_OPTIONS?.map(
                                        ({ key, title }, index) => (
                                            <Checkbox
                                                key={key ?? index}
                                                rounded="sm"
                                                title={title}
                                                checked={
                                                    file_uploader
                                                        ?.upload_preview
                                                        ?.show_header?.[key]
                                                }
                                                onChange={() => {
                                                    if (!file_uploader) return;
                                                    dispatch(
                                                        updateStyle({
                                                            key: "file_uploader",
                                                            value: {
                                                                ...file_uploader,
                                                                upload_preview:
                                                                    {
                                                                        ...file_uploader?.upload_preview,
                                                                        show_header:
                                                                            {
                                                                                ...file_uploader
                                                                                    ?.upload_preview
                                                                                    ?.show_header,
                                                                                [key]: !file_uploader
                                                                                    ?.upload_preview
                                                                                    ?.show_header?.[
                                                                                    key
                                                                                ],
                                                                            },
                                                                    },
                                                            },
                                                        }),
                                                    );
                                                }}
                                            />
                                        ),
                                    )}
                                </BlockStack>
                            </BlockStack>
                        </>
                    )}
                </SettingsField>
            </PageContainer>

            <PageContainer
                compact
                style={{ margin: "20px auto 0" }}
                title={__("Rename On Upload", "ninja-drive")}
                docLink={DOCS?.MODULE_BUILDER?.style?.link}
            >
                <SettingsField
                    title={__("File Rename", "ninja-drive")}
                    titleSize="sm"
                >
                    <AutoFillInput
                        max={5}
                        defaultSeparator="hyphen"
                        example
                        value={rename_file || ""}
                        onChange={(value) => handleUpdate("rename_file", value)}
                    >
                        <AutoFillInput.Options
                            title={
                                <Text
                                    color="gray-700"
                                    size="sm"
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

                        <AutoFillInput.Options
                            options={FILE_RENAME_TAGS_POST}
                        />

                        <AutoFillInput.Options
                            title={
                                <Note>
                                    <Note.Title
                                        title={__("Note", "ninja-drive")}
                                    />

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
                                    <Note.Title
                                        title={__("Note", "ninja-drive")}
                                    />

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
            </PageContainer>
        </>
    );
};

export default FileUploader;

const UPLOAD_TYPE: {
    key: "upload_immediately" | "show_upload_confirmation";
    title: string;
}[] = [
    {
        key: "upload_immediately",
        title: __("Upload Immediately", "ninja-drive"),
    },
    {
        key: "show_upload_confirmation",
        title: __("Click Submit Button to Upload", "ninja-drive"),
    },
];

const VIEW_STYLE_TABS: {
    key: "grid" | "list";
    title: string;
    icon: string;
}[] = [
    {
        key: "grid",
        title: __("Grid", "ninja-drive"),
        icon: "grid_view",
    },
    {
        key: "list",
        title: __("List", "ninja-drive"),
        icon: "dehaze",
    },
];

const HEADER_OPTIONS: {
    key: "breadcrumb" | "sorting";
    title: string;
}[] = [
    {
        key: "breadcrumb",
        title: __("Breadcrumb", "ninja-drive"),
    },
    {
        key: "sorting",
        title: __("Sorting", "ninja-drive"),
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
