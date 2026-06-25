import { NotificationDetailsProps } from "./Notifications.type";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";

const Details = ({
    notification,
    setDetails,
    delete: deleteNotification,
}: NotificationDetailsProps) => {
    const { title, description, htmlContent, type } = notification;

    const iconName =
        type === "success"
            ? "notifications_active"
            : type === "warning"
            ? "settings_alert"
            : type === "error"
            ? "settings_alert"
            : "info";

    return (
        <BlockStack>
            <Card
                padding={10}
                borderStyle="none"
                rounded="none"
                flex
                align="between"
            >
                <IconButton
                    variant="secondary"
                    size="supersmall"
                    name="arrow_left_alt"
                    color="primary"
                    borderColor="secondary"
                    onClick={() => setDetails(null)}
                />

                <Dropdown>
                    <Dropdown.Trigger>
                        <IconButton
                            variant="secondary"
                            size="supersmall"
                            name="more_vert"
                            color="primary"
                            borderColor="secondary"
                        />
                    </Dropdown.Trigger>

                    <Dropdown.Content
                        position={{
                            right: "0",
                            top: "115%",
                            minWidth: 0,
                            width: "fit-content",
                        }}
                    >
                        <Button
                            variant="error"
                            size="extrasmall"
                            startIcon="delete"
                            onClick={() => {
                                deleteNotification(notification.id);
                                setDetails(null);
                            }}
                        >
                            {__("Delete", "ninja-drive")}
                        </Button>
                    </Dropdown.Content>
                </Dropdown>
            </Card>

            <BlockStack padding={10} gap={5}>
                <InlineStack gap={10} align="start">
                    <Card
                        padding={3}
                        background={
                            type === "success"
                                ? "primary-extralight"
                                : `${type}-50`
                        }
                        border={
                            type === "success" ? "primary-light" : `${type}-100`
                        }
                        flex
                        align="center"
                        blockAlign="center"
                        rounded="sm"
                        style={{
                            width: "30px",
                            height: "30px",
                            flexShrink: 0,
                        }}
                    >
                        <Icon
                            name={iconName}
                            color={type === "success" ? "primary" : type}
                        />
                    </Card>

                    <Text weight="semibold">{title}</Text>
                </InlineStack>

                {htmlContent ? htmlContent : <Description text={description} />}
            </BlockStack>
        </BlockStack>
    );
};

export default Details;
