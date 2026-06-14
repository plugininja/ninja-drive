import { useCustomAlert } from "~/components/molecules/Alert";
import Description from "~/components/molecules/Description";
import EmptyState from "~/components/molecules/EmptyState";
import BlockStack from "~/components/molecules/BlockStack";
import { noFoundIconSvg } from "~/utils/icons";
import { __ } from "@wordpress/i18n";

const NotExist = ({ onClose }: { onClose: () => void }) => {
    return (
        <BlockStack gap="20px" align="center" inlineAlign="center">
            <EmptyState
                icon={<img src={noFoundIconSvg} alt="" style={{ width: "200px", height: "200px" }} />}
                title={__("Not Exist", "ninja-drive")}
            />

            <Description
                align="center"
                text={__(
                    "All users and roles already have assigned access rules, so new rules cannot be created. Please edit the existing rules instead.",
                    "ninja-drive",
                )}
            />
        </BlockStack>
    );
};

export const useNotExist = () => {
    const { showAlert, closeAlert } = useCustomAlert();

    const openNotExist = () => {
        showAlert({
            id: "not-exist-modal",
            type: "info",
            showIcon: false,
            showConfirmButton: false,
            allowEscapeKey: false,
            width: "500px",
            height: "fit-content",
            html: <NotExist onClose={() => closeAlert("not-exist-modal")} />,
        });
    };

    return { openNotExist };
};
