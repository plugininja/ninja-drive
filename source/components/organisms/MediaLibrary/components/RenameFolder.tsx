import { setRenameFolder } from "~/store/features/mediaLibrarySlice";
import { useEffect, useRef, useState } from "@wordpress/element";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import Button from "~/components/atoms/Button";
import { useAppDispatch } from "~/store/hooks";
import Input from "~/components/atoms/Input";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";

const RenameFolder = ({
    folder,
    setCurrentFolder,
    setFolderLoading,
}: {
    folder: File;
    setCurrentFolder?: (folder: File | null) => void;
    setFolderLoading: (loading: boolean) => void;
}) => {
    const [folderName, setFolderName] = useState<string>(folder.name);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleRenameFolder = async () => {
        PNPNDHelper.openUpgradePopUp();
    };

    return (
        <BlockStack gap={8}>
            <Input
                ref={inputRef}
                size="small"
                placeholder={__("Enter new name…", "ninja-drive")}
                value={folderName}
                onChange={(value) => setFolderName(String(value))}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleRenameFolder();
                    }
                }}
            />

            <InlineStack gap={10}>
                <Button
                    variant="secondary"
                    size="extrasmall"
                    onClick={() => dispatch(setRenameFolder(""))}
                >
                    {__("Cancel", "ninja-drive")}
                </Button>

                <Button
                    variant="primary"
                    size="extrasmall"
                    onClick={handleRenameFolder}
                >
                    {__("Rename", "ninja-drive")}
                </Button>
            </InlineStack>
        </BlockStack>
    );
};

export default RenameFolder;
