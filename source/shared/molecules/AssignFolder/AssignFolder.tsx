import { useGetFilesByKeysQuery } from "~features/file-browser/api/fileApi";
import { File } from "~features/file-browser/types/file.types";
import { useEffect, useState } from "@wordpress/element";
import { AssignFolderProps } from "./AssignFolder.type";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const AssignFolder = ({
    title,
    actionText,
    description,
    sync,
    selected,
    enable = false,
    showNotExistMediaFolder,
    showNotExistMediaFolderWarning,
    mediaLibraryFolderKeys,
    extraContent,
    onSelect,
    onAssignFolder,
}: AssignFolderProps) => {
    const [allFiles, setAllFiles] = useState<File[]>([]);
    const { data: filesData, isLoading } = useGetFilesByKeysQuery(
        {
            file_keys: selected,
        },
        {
            skip: selected.length === 0,
        },
    );

    useEffect(() => {
        if (filesData?.data?.files) {
            const filterDuplicate = filesData.data.files.filter(
                (file) => !allFiles.some((f) => f.file_key === file.file_key),
            );
            setAllFiles((prev) => [...prev, ...filterDuplicate]);
        }
    }, [filesData]);

    const handleSelect = (files: { file_key: string; name: string }[]) => {
        const folders = files.map((file) => file.file_key);

        onSelect(folders);
    };

    const mediaLibraryNotExistFolders = showNotExistMediaFolder
        ? allFiles?.filter((f) => !mediaLibraryFolderKeys?.includes(f.file_key))
        : [];

    return (
        <BlockStack gap={10}>
            <InlineStack gap={10} align="between">
                <InlineStack gap={10}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {title}
                    </Text>

                    <Button
                        variant="primary"
                        size="small"
                        startIcon="folder_check_2"
                        onClick={() => {
                            if (enable === false) return;
                            PNPNDHelper.openFileSelector({
                                fileTypes: ["folder"],
                                prevSelectedFiles: selected?.map((file) => ({
                                    file_key: file,
                                })) as File[],
                                onConfirm: (files) => {
                                    handleSelect(files);
                                },
                                onClose: () => {},
                            });
                        }}
                    >
                        {actionText || __("Select Folders", "ninja-drive")}
                    </Button>

                    {sync && sync}
                </InlineStack>

                {extraContent && extraContent}
            </InlineStack>

            {showNotExistMediaFolder &&
                mediaLibraryNotExistFolders.length > 0 && (
                    <Text size="sm">{__("All Folders", "ninja-drive")}</Text>
                )}

            <SelectBox
                options={
                    allFiles?.map((file) => ({
                        name: file?.name,
                        value: file?.file_key,
                        icon: "folder",
                        warning:
                            showNotExistMediaFolderWarning &&
                            !mediaLibraryFolderKeys?.includes(file?.file_key),
                    })) || []
                }
                background="gray-50"
                color="gray-200"
                size="small"
                multiple
                optionIcon
                value={selected}
                waiting={isLoading}
                onChange={(value) => {
                    onSelect(value);
                }}
                disabled={enable === false}
            />

            <Description text={description} />

            {showNotExistMediaFolder &&
                mediaLibraryNotExistFolders.length > 0 && (
                    <>
                        <Text size="sm">
                            {__(
                                "The following folders are missing from Media Library",
                                "ninja-drive",
                            )}
                        </Text>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            align="between"
                            blockAlign="center"
                        >
                            <SelectBox
                                className="flex-1"
                                options={allFiles
                                    ?.filter(
                                        (f) =>
                                            !mediaLibraryFolderKeys?.includes(
                                                f.file_key,
                                            ),
                                    )
                                    .map((f) => ({
                                        name: f.name,
                                        value: f.file_key,
                                        icon: "folder",
                                        warning: true,
                                    }))}
                                value={selected?.filter(
                                    (key) =>
                                        !mediaLibraryFolderKeys?.includes(key),
                                )}
                                size="small"
                                readonly
                                multiple
                                optionIcon
                                waiting={isLoading}
                            />

                            <Button
                                variant="primary"
                                size="small"
                                startIcon="folder_check_2"
                                onClick={() =>
                                    onAssignFolder?.(
                                        allFiles.map((f) => f.file_key),
                                    )
                                }
                            >
                                {__("Assign", "ninja-drive")}
                            </Button>
                        </InlineStack>

                        <Description
                            text={__(
                                "These folders have been assigned but do not currently exist in the Media Library. To make them available, click 'Select Folders' under Assign Folder, re-select the missing folders, and save your changes — they will then be visible in the Media Library.",
                                "ninja-drive",
                            )}
                        />
                    </>
                )}
        </BlockStack>
    );
};

export default AssignFolder;
