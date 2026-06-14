import Uploader from "~/components/organisms/Uploader/Uploader";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import SelectBox from "~/components/molecules/SelectBox";
import Dropdown from "~/components/molecules/Dropdown";
import Divider from "~/components/atoms/Divider";
import Button from "~/components/atoms/Button";
import Card from "~/components/molecules/Card";
import { useState } from "@wordpress/element";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { File } from "~/types/file.types";
import clsx from "clsx";
import {
    selectMediaLibrary,
    setBulkSelect,
    setCreateFolder,
    setQueryArgs,
} from "~/store/features/mediaLibrarySlice";

const TreeAction = ({
    files,
    disabled,
}: {
    files: File[];
    disabled: boolean;
}) => {
    const {
        active_folder,
        selected_folders,
        create_folder,
        bulk_select,
        query_args,
    } = useAppSelector(selectMediaLibrary);
    const [upload, setUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const deleteEnabled = bulk_select
        ? selected_folders.length > 0
        : !!active_folder;

    return (
        <div>
            <Card
                padding={5}
                background="white"
                flex
                align="between"
                style={{
                    borderRadius: "6px",
                }}
            >
                <InlineStack gap={5}>
                    <Button
                        variant="primary"
                        size="extrasmall"
                        startIcon="cloud_upload"
                        onClick={() => {
                            PNPNDHelper.openUpgradePopUp();
                        }}
                        disabled={!active_folder || bulk_select || disabled}
                    >
                        Upload
                    </Button>

                    <Button
                        variant="error"
                        size="extrasmall"
                        startIcon="delete"
                        onClick={() => {
                            PNPNDHelper.openUpgradePopUp();
                        }}
                        disabled={!deleteEnabled || disabled}
                    >
                        Delete
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <IconButton
                                variant="secondary"
                                size="extrasmall"
                                name="sort_by_alpha"
                                disabled={disabled}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                right: 0,
                                top: "115%",
                            }}
                        >
                            <BlockStack padding={10} gap={10}>
                                <Text size="md" weight="medium" wrap={false}>
                                    File Order
                                </Text>

                                <BlockStack gap={5}>
                                    <Text color="gray-800" size="sm">
                                        Sort By
                                    </Text>

                                    <SelectBox
                                        style={{
                                            width: "150px",
                                        }}
                                        size="extrasmall"
                                        options={SORT_OPTIONS}
                                        value={[query_args.order_by || "name"]}
                                        onChange={(value) =>
                                            dispatch(
                                                setQueryArgs({
                                                    order_by: value[0],
                                                }),
                                            )
                                        }
                                    />
                                </BlockStack>

                                <BlockStack gap={5}>
                                    <Text color="gray-800" size="sm">
                                        Order By
                                    </Text>

                                    <Card
                                        padding={5}
                                        background="primary-extralight"
                                        flex
                                        align="center"
                                        gap={5}
                                        style={{
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {ORDER_OPTIONS.map((option) => (
                                            <Card
                                                key={option?.key}
                                                padding={8}
                                                rounded="sm"
                                                flex
                                                align="center"
                                                blockAlign="center"
                                                background={
                                                    query_args.order ===
                                                    option?.key
                                                        ? "primary"
                                                        : "white"
                                                }
                                                style={{
                                                    height: "28px",
                                                }}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    dispatch(
                                                        setQueryArgs({
                                                            order: option?.key,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name={option?.icon}
                                                    color={
                                                        query_args.order ===
                                                        option?.key
                                                            ? "white"
                                                            : "black"
                                                    }
                                                />
                                            </Card>
                                        ))}
                                    </Card>
                                </BlockStack>
                            </BlockStack>
                        </Dropdown.Content>
                    </Dropdown>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <IconButton
                                variant="secondary"
                                size="extrasmall"
                                name="more_vert"
                                disabled={disabled}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                right: 0,
                                top: "115%",
                            }}
                        >
                            <Dropdown.MenuItem
                                isActive={bulk_select}
                                onClick={() =>
                                    dispatch(setBulkSelect(!bulk_select))
                                }
                            >
                                <Icon
                                    name="select_all"
                                    color={bulk_select ? "black" : "gray-500"}
                                />
                                Bulk Select
                            </Dropdown.MenuItem>

                            <Dropdown.MenuItem
                                onClick={() => {
                                    PNPNDHelper.openUpgradePopUp();
                                }}
                            >
                                <Icon name="folder_check_2" color="gray-500" />
                                Add Folder
                            </Dropdown.MenuItem>
                        </Dropdown.Content>
                    </Dropdown>
                </InlineStack>
            </Card>

            <Divider marginTop={10} marginBottom={10} />

            <InlineStack align="between" gap={5}>
                <Text
                    weight="semibold"
                    wrap={false}
                    ellipsis
                    style={{ minWidth: 0 }}
                >
                    Folders
                </Text>

                <InlineStack gap={5} wrap={false}>
                    <Button
                        variant="secondary"
                        size="extrasmall"
                        startIcon="create_new_folder"
                        onClick={() => {
                            PNPNDHelper.openUpgradePopUp();
                        }}
                        disabled={bulk_select || !active_folder || disabled}
                    >
                        New Folder
                    </Button>

                    {active_folder && (
                        <IconButton
                            variant="primary"
                            size="extrasmall"
                            name="cached"
                            iconClassName={clsx(loading && "loading")}
                            onClick={() => {
                                PNPNDHelper.openUpgradePopUp();
                            }}
                            disabled={disabled}
                        />
                    )}
                </InlineStack>
            </InlineStack>

            {upload && (
                <Uploader
                    heightFull={false}
                    background="white"
                    borderStyle="dashed"
                    shadow
                    data={{
                        minFileSize: 0,
                        maxFileSize: pnpnd.is_pro !== "1" ? 5 : 0,
                        activeFolder: active_folder?.file_key,
                        onFileUpload: () => handleUploadComplete(),
                        setIsUploading: setUpload,
                        uploadImmediately: true,
                        enableFolderUpload: true,
                    }}
                    onClose={() => setUpload(false)}
                />
            )}
        </div>
    );
};

export default TreeAction;

export const SORT_OPTIONS: {
    name: string;
    value: "name" | "size" | "created_at" | "updated_at";
}[] = [
    {
        name: "Name",
        value: "name",
    },
    {
        name: "Size",
        value: "size",
    },
    {
        name: "Created At",
        value: "created_at",
    },
    {
        name: "Updated At",
        value: "updated_at",
    },
];

export const ORDER_OPTIONS: {
    key: "ASC" | "DESC";
    icon: string;
}[] = [
    {
        key: "ASC",
        icon: "arrow_warm_up",
    },
    {
        key: "DESC",
        icon: "arrow_cool_down",
    },
];
