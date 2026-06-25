import { Item, Menu, Separator, Submenu } from "~/ui/molecules";
import { File } from "~features/file-browser/types/file.types";
import { userCan } from "~kernel/utils/permissions";
import { Fragment } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Status } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    getDocumentExportTypes,
    isExportDocument,
    isFolder,
} from "~features/file-browser/utils/file";

export const FILE_CONTEXT_MENU_LISTS: {
    id:
        | "preview"
        | "open"
        | "view-details"
        | "share"
        | "download"
        | "downloadLink"
        | "import"
        | "copy"
        | "move"
        | "rename"
        | "hide"
        | "delete";
    label: string;
    icon?: string;
    fileOnly?: boolean;
    separator?: boolean;
    isPro?: boolean;
    className?: string;
    isVisible?: boolean;
}[] = [
    {
        id: "preview",
        label: __("Preview", "ninja-drive"),
        icon: "eye_tracking",
        fileOnly: true,
        isVisible: userCan("files_preview"),
    },
    {
        id: "open",
        label: __("Open in Google Drive", "ninja-drive"),
        icon: "open_in_new",
    },
    {
        id: "share",
        label: __("Share", "ninja-drive"),
        icon: "share",
        isVisible: userCan("files_share"),
    },
    {
        id: "download",
        label: __("Download", "ninja-drive"),
        icon: "cloud_download",
        fileOnly: true,
        isVisible: userCan("files_download"),
    },
    {
        id: "downloadLink",
        label: __("Download Link", "ninja-drive"),
        icon: "download",
        fileOnly: true,
        isVisible: userCan("files_download"),
    },
    {
        id: "rename",
        label: __("Rename", "ninja-drive"),
        icon: "text_select_start",
        separator: true,
        isVisible: userCan("files_rename"),
    },
    {
        id: "hide",
        label: __("Hide", "ninja-drive"),
        icon: "close",
        className: "destructive",
    },
    {
        id: "delete",
        label: __("Delete", "ninja-drive"),
        icon: "delete",
        className: "destructive",
        isVisible: userCan("files_delete"),
    },
];

const FileContextMenu = ({
    menuList = FILE_CONTEXT_MENU_LISTS,
    onMenuClick,
    skipMenus = [],
}: {
    menuList?: typeof FILE_CONTEXT_MENU_LISTS;
    onMenuClick: (id: string, file: File, subId?: string) => void;
    skipMenus?: Array<
        | "preview"
        | "open"
        | "view-details"
        | "share"
        | "download"
        | "downloadLink"
        | "import"
        | "copy"
        | "move"
        | "rename"
        | "hide"
        | "delete"
    >;
}) => {
    return (
        <Menu id="file-menu">
            {({ props }) => {
                const downloadNotAllowed = [
                    "form",
                    "jam",
                    "map",
                    "addon",
                    "vid",
                ].includes(props?.file?.extension?.toLowerCase() || "");

                const filteredMenuList = menuList
                    .filter((menu) => !skipMenus.includes(menu.id))
                    .filter((menu) => {
                        if (
                            (menu.id === "download" ||
                                menu.id === "downloadLink" ||
                                menu.id === "import") &&
                            downloadNotAllowed
                        ) {
                            return false;
                        }
                        return true;
                    })
                    .filter((menu) => {
                        if (menu.id === "hide") {
                            return !!props?.suggested;
                        }
                        return true;
                    })
                    .filter((menu) => menu.isVisible !== false);

                return filteredMenuList
                    .filter(
                        (item) =>
                            !item.fileOnly || !isFolder(props?.file.mime_type),
                    )
                    .map((item, index) => {
                        const file = props?.file;
                        const isDoc = isExportDocument(file);
                        const exportTypes = getDocumentExportTypes(file);

                        const shouldShowExportSubmenu =
                            (item.id === "import" || item.id === "download") &&
                            isDoc;

                        const { id, label, icon, className, isPro, separator } =
                            item || {};

                        const lastItem = filteredMenuList.length - 1 === index;

                        return (
                            <Fragment key={id ?? index}>
                                {shouldShowExportSubmenu ? (
                                    <Status
                                        isPro={isPro}
                                        size="extrasmall"
                                        placement="right-center"
                                        right={8}
                                    >
                                        <Submenu
                                            label={
                                                <InlineStack gap={8}>
                                                    {icon && (
                                                        <Icon
                                                            name={icon}
                                                            color={
                                                                id ===
                                                                    "delete" ||
                                                                id === "hide"
                                                                    ? "error"
                                                                    : "black"
                                                            }
                                                        />
                                                    )}
                                                    {label}
                                                    {__(" as", "ninja-drive")}
                                                </InlineStack>
                                            }
                                        >
                                            {exportTypes.map(
                                                ({ label, extension }) => (
                                                    <Item
                                                        key={extension}
                                                        onClick={() => {
                                                            onMenuClick(
                                                                item.id,
                                                                file,
                                                                extension,
                                                            );
                                                        }}
                                                    >
                                                        <Icon
                                                            name={
                                                                id ===
                                                                "download"
                                                                    ? "file_download"
                                                                    : "import_export"
                                                            }
                                                            color="black"
                                                        />

                                                        {label}
                                                    </Item>
                                                ),
                                            )}
                                        </Submenu>
                                    </Status>
                                ) : (
                                    <Status
                                        isPro={isPro}
                                        size="extrasmall"
                                        placement="right-center"
                                        right={8}
                                    >
                                        <Item
                                            className={className || ""}
                                            onClick={() =>
                                                onMenuClick(id, file)
                                            }
                                        >
                                            {icon && (
                                                <Icon
                                                    name={icon}
                                                    color={
                                                        id === "delete" ||
                                                        id === "hide"
                                                            ? "error"
                                                            : "black"
                                                    }
                                                />
                                            )}

                                            {label}
                                        </Item>
                                    </Status>
                                )}

                                {separator && !lastItem && <Separator />}
                            </Fragment>
                        );
                    });
            }}
        </Menu>
    );
};

export default FileContextMenu;
