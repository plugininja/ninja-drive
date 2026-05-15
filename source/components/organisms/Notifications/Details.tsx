import { NotificationDetailsProps } from "./Notifications.type";
import Description from "~/components/molecules/Description";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import Dropdown from "~/components/molecules/Dropdown";
import Button from "~/components/atoms/Button";
import { __ } from "@wordpress/i18n";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";

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
                    onClick={() => setDetails(null)}
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
                        background={`${type}extralight`}
                        border={`${type}light`}
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
                        <Icon name={iconName} color={type} />
                    </Card>

                    <Text weight="semibold">{title}</Text>
                </InlineStack>

                {htmlContent ? htmlContent : <Description text={description} />}
            </BlockStack>
        </BlockStack>
    );
};

export default Details;
