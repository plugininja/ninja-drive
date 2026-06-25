import { Description } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";

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
                }}
            >
                {__("Select Folders", "ninja-drive")}
            </Button>
        </Card>
    );
};

export default AddFolders;
