import { useEffect, useRef, useState } from "@wordpress/element";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";
import {
    selectMediaLibrary,
    setCreateFolder,
} from "~/store/features/mediaLibrarySlice";

const CreateFolder = ({
    variant = "root",
    setFolder,
}: {
    variant?: "root" | "child";
    setFolder?: React.Dispatch<React.SetStateAction<File[] | null>>;
}) => {
    const [folderName, setFolderName] = useState<string>("Untitled folder");
    const { active_folder } = useAppSelector(selectMediaLibrary);
    const [loading, setLoading] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleAddFolder = async () => {
        PNPNDHelper.openUpgradePopUp();
    };

    return (
        <BlockStack
            style={{
                marginTop: variant === "child" ? 8 : 0,
                paddingLeft: variant === "child" ? 15 : 0,
            }}
        >
            <Input
                ref={inputRef}
                size="small"
                placeholder={__("Enter folder name…", "ninja-drive")}
                value={folderName}
                onChange={(value) => {
                    setFolderName(String(value));
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleAddFolder();
                    }
                }}
            />

            <InlineStack
                gap={10}
                style={{
                    marginTop: 8,
                }}
            >
                <Button
                    variant="secondary"
                    size="extrasmall"
                    onClick={() => dispatch(setCreateFolder(false))}
                    disabled={loading}
                >
                    {__("Cancel", "ninja-drive")}
                </Button>

                <Button
                    variant="primary"
                    size="extrasmall"
                    onClick={handleAddFolder}
                    loading={loading}
                >
                    {__("Create", "ninja-drive")}
                </Button>
            </InlineStack>
        </BlockStack>
    );
};

export default CreateFolder;
