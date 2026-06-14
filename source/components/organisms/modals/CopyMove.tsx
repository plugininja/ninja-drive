import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import Card from "~/components/molecules/Card";
import { useState } from "@wordpress/element";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { File } from "~/types/file.types";
import { TBreadcrumb } from "~/types/ui";
import FolderTree from "../FolderTree";
import { __ } from "@wordpress/i18n";

export function CopyMoveContent({
    mode,
    file,
    widget_id,
    breadcrumbs,
    onSelect,
    onClose,
}: {
    mode: "copy" | "move";
    file: File;
    widget_id?: string;
    breadcrumbs?: TBreadcrumb[];
    onSelect: (folderKey: string) => void;
    onClose?: () => void;
}) {
    const [selectedFolder, setSelectedFolder] = useState<{
        folderKey: string;
        name: string;
    }>();

    const currentLocation =
        breadcrumbs?.[breadcrumbs.length - 1]?.name ||
        __("My Drive", "ninja-drive");

    const handleSelect = (folderKey: string, name: string) => {
        setSelectedFolder({ folderKey, name: name || "" });
        onSelect(folderKey);
    };

    return (
        <div
            style={{
                position: "relative",
            }}
            className="pnpnd-top-level-wrapper w-full"
        >
            <IconButton
                variant="error"
                size="microsmall"
                name="close"
                style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                }}
                onClick={onClose}
            />

            <InlineStack align="center" gap={8}>
                <Text size="xl" weight="medium">
                    {mode === "copy"
                        ? __("Copy", "ninja-drive")
                        : __("Move", "ninja-drive")}
                </Text>

                <Text size="xl" weight="medium">
                    {file?.name}
                </Text>
            </InlineStack>

            <InlineStack marginTop={10} gap={8} align="center">
                <Text color="gray-500" size="sm">
                    {__("Current Location:", "ninja-drive")}
                </Text>

                <Text size="sm">{currentLocation}</Text>

                <Card
                    padding={2}
                    rounded="sm"
                    flex
                    align="center"
                    blockAlign="center"
                    style={{
                        width: "fit-content",
                        aspectRatio: "1",
                    }}
                >
                    <Icon name="compare_arrows" color="primary" />
                </Card>

                <Text color="gray-500" size="sm">
                    {mode === "copy"
                        ? __("Copying to:", "ninja-drive")
                        : __("Moving to:", "ninja-drive")}
                </Text>

                <Text size="sm">
                    {selectedFolder?.name ||
                        __("Select a folder", "ninja-drive")}
                </Text>
            </InlineStack>

            <Card
                margin="20px 0"
                padding="0 10px 10px 10px"
                background="primary-extralight"
                rounded="md"
                style={{
                    height: "250px",
                    overflowX: "hidden",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                }}
                className="w-full"
            >
                <FolderTree
                    openFolder={() => {}}
                    onSelect={handleSelect}
                    activeFolder={selectedFolder?.folderKey || ""}
                    widget_id={widget_id}
                    skip={false}
                    modal
                    hideFade
                />
            </Card>
        </div>
    );
}

export function useCopyMoveAlert() {
    const { showAlert, closeAlert } = useCustomAlert();
    const openCopyMove = ({
        mode,
        file,
        widget_id,
        breadcrumbs,
        onConfirm,
    }: {
        mode: "copy" | "move";
        file: File;
        widget_id?: string;
        breadcrumbs?: TBreadcrumb[];
        onConfirm: (folderKey: string) => Promise<void>;
    }) => {
        const selectedFolderRef = { current: "" };

        showAlert({
            id: "copy-move-modal",
            type: "info",
            showIcon: false,
            showConfirmButton: true,
            confirmButtonText:
                mode === "copy"
                    ? __("Copy", "ninja-drive")
                    : __("Move", "ninja-drive"),
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: "450px",
            height: "fit-content",
            html: (
                <CopyMoveContent
                    mode={mode}
                    file={file}
                    widget_id={widget_id}
                    breadcrumbs={breadcrumbs}
                    onSelect={(folderKey) => {
                        selectedFolderRef.current = folderKey;
                    }}
                    onClose={() => {
                        closeAlert("copy-move-modal");
                    }}
                />
            ),
            onConfirm: async () => {
                await onConfirm(selectedFolderRef.current);
            },
        });
    };

    return { openCopyMove };
}
