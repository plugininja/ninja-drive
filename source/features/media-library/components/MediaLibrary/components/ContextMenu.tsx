import { Item, Menu, Separator } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Icon } from "~/ui/atoms";
import clsx from "clsx";

const ContextMenu = ({
    activeTab,
}: {
    activeTab: "media_library" | "account" | "trash_bin";
}) => {

    const handleAction = async (
        action: "google_upload" | "upload" | "trash" | "restore" | "delete",
        attachments: any[],
    ) => {
    };

    return (
        <Menu id="media-attachment">
            {({ props }) => {
                const attachments = props?.attachments;

                if (!attachments || attachments.length === 0) return null;

                return (
                    <>
                        {MENUS.filter((menu) => menu.tab === activeTab).map(
                            ({ action, name, icon }, index, array) => (
                                <div key={action}>
                                    <Item
                                        className={clsx(
                                            (action === "delete" ||
                                                action === "trash") &&
                                                "destructive",
                                        )}
                                        onClick={() =>
                                            handleAction(action, attachments)
                                        }
                                    >
                                        <Icon
                                            name={icon}
                                            color={
                                                action === "delete" ||
                                                action === "trash"
                                                    ? "error"
                                                    : "black"
                                            }
                                        />

                                        {name}
                                    </Item>

                                    {index < array.length - 1 && <Separator />}
                                </div>
                            ),
                        )}
                    </>
                );
            }}
        </Menu>
    );
};

export default ContextMenu;

const MENUS: {
    tab: "media_library" | "account" | "trash_bin";
    action: "google_upload" | "upload" | "trash" | "restore" | "delete";
    name: string;
    icon: string;
}[] = [
    {
        tab: "media_library",
        action: "google_upload",
        name: __("Upload to Google Drive", "ninja-drive"),
        icon: "upload",
    },
    {
        tab: "account",
        action: "upload",
        name: __("Upload to Media Library", "ninja-drive"),
        icon: "upload",
    },
    {
        tab: "account",
        action: "trash",
        name: __("Trash", "ninja-drive"),
        icon: "delete",
    },
    {
        tab: "trash_bin",
        action: "restore",
        name: __("Restore", "ninja-drive"),
        icon: "upload",
    },
    {
        tab: "trash_bin",
        action: "delete",
        name: __("Delete", "ninja-drive"),
        icon: "delete",
    },
];

const getActionTexts = (
    action: "upload" | "trash" | "restore" | "delete",
    count: number,
) => {
    const fileText = count > 1 ? "files" : "file";

    switch (action) {
        case "upload":
            return {
                type: "question",
                title: `Upload ${count} ${fileText}`,
                text: `Are you sure you want to upload ${count} ${fileText} to the Media Library?`,
                confirm: "Upload",
                success: `Successfully uploaded ${count} ${fileText}.`,
                error: `There was an error while uploading the selected ${fileText}.`,
            };

        case "trash":
            return {
                type: "error",
                title: `Move ${count} ${fileText} to Trash`,
                text: `Are you sure you want to move ${count} ${fileText} to the Trash?`,
                confirm: "Trash",
                success: `Successfully moved ${count} ${fileText} to Trash.`,
                error: `There was an error while moving the selected ${fileText} to Trash.`,
            };

        case "restore":
            return {
                type: "question",
                title: `Restore ${count} ${fileText}`,
                text: `Are you sure you want to restore ${count} ${fileText} from the Trash?`,
                confirm: "Restore",
                success: `Successfully restored ${count} ${fileText}.`,
                error: `There was an error while restoring the selected ${fileText}.`,
            };

        case "delete":
            return {
                type: "error",
                title: `Delete ${count} ${fileText}`,
                text: `Are you sure you want to permanently delete ${count} ${fileText}?`,
                confirm: "Delete",
                success: `Successfully deleted ${count} ${fileText}.`,
                error: `There was an error while deleting the selected ${fileText}.`,
            };
    }
};
