import Description from "~/components/molecules/Description";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

const AddFolders = () => {

    return (
        <Card marginTop={10} flex direction="col" blockAlign="center" gap={10}>
            <Text weight="semibold" align="center">
                {__("You didn't select any folders yet.", "ninja-drive")}
            </Text>

            <Description
                align="center"
                text={__(
                    "Please select the folders that you want here in the media library.",
                    "ninja-drive",
                )}
            />

            <Button
                variant="primary"
                size="small"
                startIcon="folder_check_2"
                style={{
                    width: "fit-content",
                    whiteSpace: "nowrap",
                }}
                onClick={() => {
                    if (pnpnd.is_pro !== "1") {
                        PNPNDHelper.openUpgradePopUp();
                        return;
                    }
                    PNPNDHelper.openFileSelector({
                        fileTypes: ["folder"],
                        prevSelectedFiles: [],
                        onConfirm: (files) => {
                            addFolder(files?.map((file) => file.file_key));
                        },
                        onClose: () => {},
                    });
                }}
            >
                {__("Select Folders", "ninja-drive")}
            </Button>
        </Card>
    );
};

export default AddFolders;
