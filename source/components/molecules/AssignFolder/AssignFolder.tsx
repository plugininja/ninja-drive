import { useGetFilesByKeysQuery } from "~/store/api/fileApi";
import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { AssignFolderProps } from "./AssignFolder.type";
import { File } from "~/types/file.types";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import SelectBox from "~/components/molecules/SelectBox";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";

const AssignFolder = ({
    title,
    actionText,
    description,
    selected,
    showNotExistMediaFolder,
    showNotExistMediaFolderWarning,
    mediaLibraryFolderKeys,
    onSelect,
    onAssignFolder,
}: AssignFolderProps) => {
    const [allFiles, setAllFiles] = useState<File[]>([]);
    const { data: filesData, isLoading } = useGetFilesByKeysQuery(
        {
            fileKeys: selected,
        },
        {
            skip: selected.length === 0,
        },
    );

    useEffect(() => {
        if (filesData?.data?.files) {
            const filterDuplicate = filesData.data.files.filter(
                (file) => !allFiles.some((f) => f.fileKey === file.fileKey),
            );
            setAllFiles((prev) => [...prev, ...filterDuplicate]);
        }
    }, [filesData]);

    const handleSelect = (files: { fileKey: string; name: string }[]) => {
        const folders = files.map((file) => file.fileKey);

        onSelect(folders);
    };

    const mediaLibraryNotExistFolders = showNotExistMediaFolder
        ? allFiles?.filter((f) => !mediaLibraryFolderKeys?.includes(f.fileKey))
        : [];

    return (
        <BlockStack gap={10}>
            <InlineStack gap={10}>
                <Text weight="medium">{title}</Text>

                <Button
                    variant="primary"
                    size="small"
                    startIcon="folder_check_2"
                    onClick={() => {
                        PNPNDHelper.openFileSelector({
                            fileTypes: ["folder"],
                            prevSelectedFiles: selected?.map((file) => ({
                                fileKey: file,
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
            </InlineStack>

            {showNotExistMediaFolder &&
                mediaLibraryNotExistFolders.length > 0 && (
                    <Text size="sm">{ __( "All Folders", "ninja-drive" ) }</Text>
                )}

            <SelectBox
                options={
                    allFiles?.map((file) => ({
                        name: file?.name,
                        value: file?.fileKey,
                        icon: "folder",
                        warning:
                            showNotExistMediaFolderWarning &&
                            !mediaLibraryFolderKeys?.includes(file?.fileKey),
                    })) || []
                }
                size="small"
                multiple
                optionIcon
                value={selected}
                waiting={isLoading}
                onChange={(value) => {
                    onSelect(value);
                }}
            />

            <Description text={description} />

            {showNotExistMediaFolder &&
                mediaLibraryNotExistFolders.length > 0 && (
                    <>
                        <Text size="sm">
                            {__("The following folders are missing from Media Library", "ninja-drive")}
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
                                                f.fileKey,
                                            ),
                                    )
                                    .map((f) => ({
                                        name: f.name,
                                        value: f.fileKey,
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
                                        allFiles.map((f) => f.fileKey),
                                    )
                                }
                            >
                                {__("Assign", "ninja-drive")}
                            </Button>
                        </InlineStack>

                        <Description text={__("These folders have been assigned but do not currently exist in the Media Library. To make them available, click 'Select Folders' under Assign Folder, re-select the missing folders, and save your changes — they will then be visible in the Media Library.", "ninja-drive")} />
                    </>
                )}
        </BlockStack>
    );
};

export default AssignFolder;
