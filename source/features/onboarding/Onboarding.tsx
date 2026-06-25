import { useOnboardingStep } from "~features/widget-builder/hooks/useOnboardingStep";
import { BlockStack, Card, Collapse, InlineStack } from "~/ui/molecules";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { Button, Divider, Icon, Radio, Text } from "~/ui/atoms";
import { useCountdown } from "~kernel/hooks/useCountdown";
import { createPortal } from "@wordpress/element";
import LogoIcon from "~/ui/atoms/Logo/LogoIcon";
import { __ } from "@wordpress/i18n";

const Onboarding = () => {
    const { show, setShow, completedSteps } = useOnboardingStep();

    const [collapsed, setCollapsed] = useLocalStorage(
        "pnpnd-onboarding-steps-collapsed",
        false,
    );

    const { formatted, paused, isDone, toggle } = useCountdown();

    const closeDisabled = !window?.location?.hash?.includes("notifications");

    if (!show) return null;

    return createPortal(
        <div className="pnpnd-top-level-wrapper">
            <Card
                padding={0}
                background="white"
                border="gray-200"
                style={{
                    width: "fit-content",
                    height: "fit-content",
                    position: "fixed",
                    right: 20,
                    bottom: -1,
                    zIndex: 9999,
                    borderRadius: "12px 12px 0 0",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
            >
                <InlineStack
                    align="between"
                    gap={10}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                    }}
                >
                    <Text
                        size="sm"
                        style={{
                            opacity: collapsed ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                    >
                        {__("Onboarding Steps", "ninja-drive")}
                    </Text>

                    <InlineStack gap={7}>
                        <Icon
                            name="expand_circle_down"
                            fontSize="2xl"
                            style={{
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                            onClick={() => setCollapsed(!collapsed)}
                        />

                        <Icon
                            name="cancel"
                            fontSize="2xl"
                            style={{
                                opacity: closeDisabled ? 0.5 : 1,
                                cursor: closeDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                userSelect: "none",
                            }}
                            onClick={() => {
                                if (closeDisabled) return;

                                setShow(false);
                            }}
                        />
                    </InlineStack>
                </InlineStack>

                <Collapse collapse={collapsed}>
                    <BlockStack padding={20} marginTop={20} gap={10}>
                        {STEP_OPTIONS?.map(({ key, title }, index) => (
                            <InlineStack key={key ?? index} gap={10}>
                                <Radio
                                    variant="check"
                                    checked={completedSteps?.includes(index)}
                                />

                                <Text
                                    as={
                                        completedSteps?.includes(index)
                                            ? "s"
                                            : "span"
                                    }
                                    size="sm"
                                >
                                    {title}
                                </Text>
                            </InlineStack>
                        ))}
                    </BlockStack>
                </Collapse>

                <div
                    style={{
                        backgroundColor: "var(--pnpnd-primary)",
                        width: `${
                            ((completedSteps?.length ?? 0) /
                                STEP_OPTIONS?.length) *
                            100
                        }%`,
                        height: "8px",
                        transition: "width 0.3s ease, margin-top 0.3s ease",
                        marginTop: collapsed ? 40 : 0,
                    }}
                />

                <Card
                    padding={0}
                    background="black"
                    rounded="none"
                    borderStyle="none"
                >
                    <InlineStack padding={15} gap={10}>
                        <LogoIcon />

                        <BlockStack gap={5}>
                            <Text color="white" weight="medium">
                                {__("Ninja Challenge", "ninja-drive")}
                            </Text>

                            {isDone ? (
                                <Text
                                    color="white"
                                    size="sm"
                                    weight="medium"
                                    style={{
                                        opacity: isDone ? 1 : 0,
                                        transition: "opacity 0.3s ease",
                                    }}
                                >
                                    {__("Completed", "ninja-drive")}
                                </Text>
                            ) : (
                                <Text
                                    color="gray-400"
                                    size="sm"
                                    style={{
                                        opacity: isDone ? 0 : 1,
                                        transition: "opacity 0.3s ease",
                                    }}
                                >
                                    {formatted} {__("remaining", "ninja-drive")}
                                </Text>
                            )}
                        </BlockStack>
                    </InlineStack>

                    <Collapse collapse={isDone}>
                        <Divider color="gray-600" width="100%" height="1px" />

                        <InlineStack padding={15} align="center">
                            <Button
                                variant="white"
                                size="extrasmall"
                                onClick={toggle}
                            >
                                {paused
                                    ? __("Continue", "ninja-drive")
                                    : __("Pause", "ninja-drive")}
                            </Button>
                        </InlineStack>
                    </Collapse>
                </Card>
            </Card>
        </div>,
        document.body,
    );
};

export default Onboarding;

const STEP_OPTIONS: {
    key:
        | "type"
        | "name"
        | "files"
        | "configure"
        | "style"
        | "permissions"
        | "notifications"
        | "page";
    title: string;
}[] = [
    {
        key: "type",
        title: __("Select a widget type", "ninja-drive"),
    },
    {
        key: "name",
        title: __("Name your widget", "ninja-drive"),
    },
    {
        key: "files",
        title: __("Select files to show", "ninja-drive"),
    },
    {
        key: "configure",
        title: __("Configure the widget", "ninja-drive"),
    },
    {
        key: "style",
        title: __("Style the widget", "ninja-drive"),
    },
    {
        key: "permissions",
        title: __("Grant the Permissions", "ninja-drive"),
    },
    {
        key: "notifications",
        title: __("Check Notifications", "ninja-drive"),
    },
    {
        key: "page",
        title: __("Embed in a page", "ninja-drive"),
    },
];
