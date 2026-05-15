import { __ } from "@wordpress/i18n";
import { selectSettings } from "~/store/features/settingSlice";
import useSaveSettings from "~/hooks/useSaveSettings";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import { useAppSelector } from "~/store/hooks";
import GridStack from "~/components/molecules/GridStack";
import useDevice from "~/hooks/useDevice";
import Card from "~/components/molecules/Card";
import Form from "./Form";
import Auto from "./Auto";
import OAuthSetup from "./OAuthSetup";

const Content = () => {
    const { data } = useAppSelector(selectSettings);

    const { saveAccounts } = useSaveSettings();

    const device = useDevice();

    const connectionType = data?.accounts?.connectionType || "automatic";

    return (
        <Card
            background="primary-extralight"
            flex
            direction="col"
            align="center"
            blockAlign="center"
        >
            <ButtonGroup
                buttons={CONNECTION_TYPE_BUTTONS}
                selectedKey={connectionType}
                onChange={(value) =>
                    saveAccounts(
                        "connectionType",
                        value as "automatic" | "manual",
                    )
                }
            />

            <GridStack
                columns={device === "desktop" ? 2 : 1}
                marginTop={20}
                gap={0}
                style={{
                    width: "100%",
                }}
                className="border border-solid border-secondary rounded-lg"
            >
                {connectionType === "automatic" ? <Auto /> : <Form login />}

                <Card
                    padding={20}
                    borderStyle="none"
                    style={{
                        borderRadius:
                            device === "desktop"
                                ? "0 12px 12px 0"
                                : "0 0 12px 12px",
                        height: "420px",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                    }}
                >
                    <OAuthSetup />
                </Card>
            </GridStack>
        </Card>
    );
};

export default Content;

const CONNECTION_TYPE_BUTTONS: {
    key: "automatic" | "manual";
    title: string;
    startIcon: string;
}[] = [
,
    { key: "manual", title: __("Manual", "ninja-drive"), startIcon: "tune" },
];
