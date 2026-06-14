import { NotificationsHeaderProps } from "./Notifications.type";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import Dropdown from "~/components/molecules/Dropdown";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const Header = ({
    mode,
    setMode,
    all,
    unread,
    allRead,
    refresh,
    deleteAll,
}: NotificationsHeaderProps) => {
    return (
        <BlockStack gap={10} className="pnpnd-notifications__header">
            <InlineStack align="between" gap={10} wrap={false}>
                <Text weight="semibold">
                    {__("Notifications", "ninja-drive")}
                </Text>

                <Button
                    variant="outlined"
                    size="extrasmall"
                    startIcon="done_all"
                    onClick={allRead}
                    disabled={unread === 0}
                >
                    {__("Mark all as read", "ninja-drive")}
                </Button>
            </InlineStack>

            <InlineStack align="between" gap={10} wrap={false}>
                <InlineStack wrap={false}>
                    <Button
                        size="small"
                        className={clsx(
                            "pnpnd-notifications__header-button",
                            mode === "all" &&
                                "pnpnd-notifications__header-button--active",
                            mode !== "all" &&
                                "pnpnd-notifications__header-button--inactive",
                        )}
                        onClick={() => setMode("all")}
                    >
                        {__("All", "ninja-drive")}
                        <Button variant="primary" size="microsmall">
                            {all || 0}
                        </Button>
                    </Button>

                    <Button
                        size="small"
                        className={clsx(
                            "pnpnd-notifications__header-button",
                            mode === "unread" &&
                                "pnpnd-notifications__header-button--active",
                            mode !== "unread" &&
                                "pnpnd-notifications__header-button--inactive",
                        )}
                        onClick={() => setMode("unread")}
                    >
                        {__("Unread", "ninja-drive")}
                        <Button variant="primary" size="microsmall">
                            {unread || 0}
                        </Button>
                    </Button>
                </InlineStack>

                <InlineStack gap={10} wrap={false}>
                    <IconButton
                        variant="secondary"
                        size="supersmall"
                        name="autorenew"
                        color="primary"
                        onClick={refresh}
                    />

                    <Dropdown>
                        <Dropdown.Trigger>
                            <IconButton
                                variant="secondary"
                                size="supersmall"
                                name="more_vert"
                                color="primary"
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                right: "0",
                                top: "115%",
                                width: "fit-content",
                            }}
                        >
                            <Button
                                variant="error"
                                size="extrasmall"
                                className="text-nowrap"
                                onClick={deleteAll}
                                disabled={all === 0}
                            >
                                {__("Clear All", "ninja-drive")}
                            </Button>
                        </Dropdown.Content>
                    </Dropdown>
                </InlineStack>
            </InlineStack>
        </BlockStack>
    );
};

export default Header;
