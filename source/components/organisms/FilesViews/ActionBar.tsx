import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import { useFilesContext } from "./FilesViews";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import Dropdown from "~/components/molecules/Dropdown";
import Icon from "~/components/atoms/Icon";
import { useFileActions } from "~/hooks/useFileActions";
import { File } from "~/types/file.types";
import { toBoolean } from "~/utils/functions";

const ActionBar = ({
    isCompact = false,
    createFolder,
}: {
    isCompact?: boolean;
    createFolder: (activeFolderKey: string) => void;
}) => {
    const { breadcrumbs, activeFolder, setShowUploader, widgetId, openFolder } =
        useFilesContext();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
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
                "my-drive",
                "/",
            ].includes(activeFolder ?? "")
        ) {
            setIsDisabled(true);
            setShowUploader(false);
        } else {
            setIsDisabled(false);
        }
    }, [activeFolder]);

    const BROWSER_ACTIONS = [
        {
            Key: "createFolder",
            title: __("Create Folder", "ninja-drive"),
            icon: "create_new_folder",
            isDisabled: isDisabled,
            onClick: () => createFolder(activeFolder),
        },
    ];

    const currentBreadcrumb = breadcrumbs[breadcrumbs?.length - 1];
    const parentFolderKey =
        breadcrumbs[breadcrumbs?.length - 2]?.fileKey ?? activeFolder;

    const getCurrentFolderFile = (): File => ({
        fileKey: currentBreadcrumb?.fileKey ?? activeFolder,
        name: currentBreadcrumb?.name ?? "",
        icon: "folder",
        mimeType: "application/vnd.google-apps.folder",
        size: 0,
        thumbnail: "",
        extension: null,
        isDir: true,
        isShared: false,
        isStarred: false,
        updatedAt: "",
        createdAt: "",
        additionalData: { baseName: currentBreadcrumb?.name ?? "" },
    });

    if (isCompact) {
        return (
            <InlineStack gap={10}>
                {BROWSER_ACTIONS?.map(
                    ({ Key, title, icon, onClick, isDisabled }, index) => (
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
                    ),
                )}
            </InlineStack>
        );
    }

    return (
        <InlineStack margin={"0px 0px 20px 0px"} align="between" gap={10}>
            <InlineStack>
                <Text size="xl" weight="medium">
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
                            disabled={isDisabled}
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
                                    widgetId,
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
                        <Dropdown.MenuItem
                            onClick={() =>
                                rename(
                                    getCurrentFolderFile(),
                                    parentFolderKey,
                                    widgetId,
                                )
                            }
                        >
                            <InlineStack gap={8}>
                                <Icon name="text_select_start" color="black" />
                                <Text size="sm">
                                    {__("Rename", "ninja-drive")}
                                </Text>
                            </InlineStack>
                        </Dropdown.MenuItem>

                        <Dropdown.MenuItem
                            onClick={() =>
                                share(getCurrentFolderFile(), widgetId)
                            }
                        >
                            <InlineStack gap={8}>
                                <Icon name="share" color="black" />
                                <Text size="sm">
                                    {__("Share", "ninja-drive")}
                                </Text>
                            </InlineStack>
                        </Dropdown.MenuItem>
                        <Dropdown.MenuSeparator />
                        <Dropdown.MenuItem
                            onClick={() =>
                                handleDelete(
                                    [
                                        currentBreadcrumb?.fileKey ??
                                            activeFolder,
                                    ],
                                    parentFolderKey,
                                    widgetId,
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
                    </Dropdown.Content>
                </Dropdown>
            </InlineStack>

            <InlineStack gap={15}>
                {BROWSER_ACTIONS.map((action, index) => {
                    const { Key, title, icon, isDisabled, onClick } = action;

                    return (
                        <Card
                            key={Key ?? index}
                            padding={6}
                            flex
                            blockAlign="center"
                            gap={10}
                            background="white"
                            style={{ cursor: "pointer", flex: "0 0 180px" }}
                            disabled={isDisabled}
                            onClick={onClick}
                            rounded="md"
                        >
                            <IconButton
                                variant="secondary"
                                color="primary"
                                size="small"
                                rounded="sm"
                                name={icon}
                            />

                            <Text color="black" size="sm">
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
