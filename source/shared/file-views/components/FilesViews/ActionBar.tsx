import { useFileActions } from "~features/file-browser/hooks/useFileActions";
import { File } from "~features/file-browser/types/file.types";
import { useEffect, useState } from "@wordpress/element";
import { userCan } from "~kernel/utils/permissions";
import { useFilesContext } from "./FilesViews";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

const ActionBar = ({
    isCompact = false,
    onlyIcon = false,
    createFolder,
}: {
    isCompact?: boolean;
    onlyIcon?: boolean;
    createFolder: (activeFolderKey: string) => void;
}) => {
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const {
        breadcrumbs,
        activeFolder,
        setShowUploader,
        widget_id,
        openFolder,
    } = useFilesContext();

    const {
        rename,
        share,
        deleteFile: handleDelete,
        openGoogleDrive,
    } = useFileActions();

    useEffect(() => {
        if (
            [
                "home",
                "computers",
                "shared-drives",
                "shared",
                "starred",
                "/",
            ].includes(activeFolder ?? "")
        ) {
            setIsDisabled(true);
            setShowUploader(false);
        } else {
            setIsDisabled(false);
        }
        if (
            !userCan("has_full_access") &&
            ["my-drive"].includes(activeFolder)
        ) {
            setIsDisabled(true);
        }
    }, [activeFolder]);

    const BROWSER_ACTIONS = [
        {
            Key: "createFolder",
            title: __("Create Folder", "ninja-drive"),
            icon: "create_new_folder",
            onClick: () => createFolder(activeFolder),
            isVisible: userCan("folders_create"),
            isDisabled: isDisabled,
        },
    ];

    const currentBreadcrumb = breadcrumbs[breadcrumbs?.length - 1];
    const parentFolderKey =
        breadcrumbs[breadcrumbs?.length - 2]?.file_key ?? activeFolder;

    const getCurrentFolderFile = (): File => ({
        file_key: currentBreadcrumb?.file_key ?? activeFolder,
        name: currentBreadcrumb?.name ?? "",
        icon: "folder",
        mime_type: "application/vnd.google-apps.folder",
        size: 0,
        thumbnail: "",
        extension: null,
        is_dir: true,
        is_shared: false,
        is_starred: false,
        updated_at: "",
        created_at: "",
        additional_data: { base_name: currentBreadcrumb?.name ?? "" },
    });

    if (isCompact) {
        return (
            <InlineStack gap={10}>
                {BROWSER_ACTIONS?.map(
                    (
                        { Key, title, icon, onClick, isVisible, isDisabled },
                        index,
                    ) => {
                        if (!isVisible) {
                            return null;
                        }

                        if (onlyIcon) {
                            return (
                                <IconButton
                                    key={Key ?? index}
                                    variant="outlined"
                                    size="small"
                                    name={icon}
                                    onClick={onClick}
                                    disabled={isDisabled}
                                />
                            );
                        }

                        return (
                            <Button
                                key={Key ?? index}
                                variant="outlined"
                                size="small"
                                startIcon={icon}
                                onClick={onClick}
                                disabled={isDisabled}
                            >
                                {title}
                            </Button>
                        );
                    },
                )}
            </InlineStack>
        );
    }

    return (
        <InlineStack margin="0px 0px 20px 0px" align="between" gap={10}>
            <InlineStack>
                <Text color="gray-800" size="xl" weight="medium">
                    {currentBreadcrumb?.name}
                </Text>

                <Dropdown>
                    <Dropdown.Trigger disabled={isDisabled}>
                        <IconButton
                            variant="default"
                            color="black"
                            size="small"
                            rounded="sm"
                            name={"settings"}
                            disabled={activeFolder === "my-drive" || isDisabled}
                        />
                    </Dropdown.Trigger>

                    <Dropdown.Content
                        position={{ left: 0, top: "115%" }}
                        style={{ minWidth: "200px" }}
                    >
                        <Dropdown.MenuItem
                            onClick={() =>
                                openGoogleDrive(
                                    getCurrentFolderFile(),
                                    widget_id,
                                )
                            }
                        >
                            <InlineStack gap={8}>
                                <Icon name="open_in_new" color="black" />

                                <Text size="sm">
                                    {__("Open in Google Drive", "ninja-drive")}
                                </Text>
                            </InlineStack>
                        </Dropdown.MenuItem>

                        {userCan("files_rename") && (
                            <Dropdown.MenuItem
                                onClick={() =>
                                    rename(
                                        getCurrentFolderFile(),
                                        parentFolderKey,
                                        widget_id,
                                    )
                                }
                            >
                                <InlineStack gap={8}>
                                    <Icon
                                        name="text_select_start"
                                        color="black"
                                    />

                                    <Text size="sm">
                                        {__("Rename", "ninja-drive")}
                                    </Text>
                                </InlineStack>
                            </Dropdown.MenuItem>
                        )}

                        {userCan("files_share") && (
                            <Dropdown.MenuItem
                                onClick={() =>
                                    share(getCurrentFolderFile(), widget_id)
                                }
                            >
                                <InlineStack gap={8}>
                                    <Icon name="share" color="black" />

                                    <Text size="sm">
                                        {__("Share", "ninja-drive")}
                                    </Text>
                                </InlineStack>
                            </Dropdown.MenuItem>
                        )}

                        {userCan("files_delete") && (
                            <>
                                <Dropdown.MenuSeparator />

                                <Dropdown.MenuItem
                                    onClick={() =>
                                        handleDelete(
                                            [
                                                currentBreadcrumb?.file_key ??
                                                    activeFolder,
                                            ],
                                            parentFolderKey,
                                            widget_id,
                                            () => openFolder(parentFolderKey),
                                        )
                                    }
                                >
                                    <InlineStack gap={8}>
                                        <Icon name="delete" color="error" />

                                        <Text size="sm" color="error">
                                            {__("Delete", "ninja-drive")}
                                        </Text>
                                    </InlineStack>
                                </Dropdown.MenuItem>
                            </>
                        )}
                    </Dropdown.Content>
                </Dropdown>
            </InlineStack>

            <InlineStack gap={15}>
                {BROWSER_ACTIONS.map((action, index) => {
                    const { Key, title, icon, onClick, isVisible, isDisabled } =
                        action;

                    if (!isVisible) {
                        return null;
                    }

                    return (
                        <Card
                            key={Key ?? index}
                            padding={6}
                            flex
                            blockAlign="center"
                            gap={10}
                            background="white"
                            style={{
                                cursor: "pointer",
                                flex: "0 0 180px",
                                borderRadius: "7px",
                            }}
                            disabled={isDisabled}
                            onClick={onClick}
                        >
                            <IconButton
                                variant="light"
                                color="primary"
                                size="small"
                                rounded="sm"
                                name={icon}
                            />

                            <Text color="gray-800" size="sm" weight="medium">
                                {title}
                            </Text>
                        </Card>
                    );
                })}
            </InlineStack>
        </InlineStack>
    );
};

export default ActionBar;
