import { selectSettings } from "~features/settings/state/settingSlice";
import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { useAppSelector } from "~kernel/store/hooks";
import useDevice from "~kernel/hooks/useDevice";
import { ButtonGroup } from "~/ui/molecules";
import { GridStack } from "~/ui/molecules";
import DOCS from "~/kernel/utils/docs";
import OAuthSetup from "./OAuthSetup";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import Form from "./Form";
import Auto from "./Auto";

const Content = () => {
    const { data } = useAppSelector(selectSettings);

    const { saveAccounts } = useSaveSettings();

    const device = useDevice();

    const connection_type = data?.accounts?.connection_type || "automatic";

    return (
        <>
            <Card
                background="primary-extralight"
                flex
                direction="col"
                align="center"
                blockAlign="center"
            >
                <ButtonGroup
                    buttons={CONNECTION_TYPE_BUTTONS}
                    selectedKey={connection_type}
                    onChange={(value) =>
                        saveAccounts(
                            "connection_type",
                            value as "automatic" | "manual",
                        )
                    }
                />

                {connection_type === "automatic" ? (
                    <Auto />
                ) : (
                    <GridStack
                        columns={device === "desktop" ? 2 : 1}
                        marginTop={20}
                        gap={0}
                        style={{
                            width: "100%",
                        }}
                        className="border border-solid border-secondary rounded-lg"
                    >
                        <Form login />

                        <Card
                            padding={0}
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
                            <iframe
                                width="100%"
                                height="100%"
                                src={
                                    DOCS.FILE_BROWSER.login
                                        .manualConnectVideoLink
                                }
                                style={{
                                    borderRadius:
                                        device === "desktop"
                                            ? "0 12px 12px 0"
                                            : "0 0 12px 12px",
                                }}
                                title="Ninja Drive Login Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </Card>
                    </GridStack>
                )}
            </Card>

            <OAuthSetup />
        </>
    );
};

export default Content;

const CONNECTION_TYPE_BUTTONS: {
    key: "automatic" | "manual";
    title: string;
    startIcon: string;
}[] = [
    {
        key: "automatic",
        title: __("One Click", "ninja-drive"),
        startIcon: "engineering",
    },
    { key: "manual", title: __("Manual", "ninja-drive"), startIcon: "tune" },
];
