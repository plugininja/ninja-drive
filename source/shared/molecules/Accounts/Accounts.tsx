import { selectAuth } from "~features/auth/state/authSlice";
import ProfileCard from "~/shared/molecules/ProfileCard";
import { useAppSelector } from "~kernel/store/hooks";
import { TextColor } from "~kernel/types/styles";
import { userCan } from "~kernel/utils/permissions";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Avatar } from "~/ui/atoms";

const Accounts = ({
    position = { left: "auto", right: "0" },
    arrowColor = "black",
    media_library = false,
}: {
    position?: { left: string; right: string };
    arrowColor?: TextColor;
    media_library?: boolean;
}) => {
    const { login_accounts, active_account } = useAppSelector(selectAuth);

    const { name, photo } = active_account || {};

    if (
        !userCan("has_full_access") &&
        !userCan("accounts_connect") &&
        !userCan("accounts_manage")
    ) {
        return null;
    }

    return (
        <Dropdown>
            <Dropdown.Trigger>
                {media_library ? (
                    <div className="flex-center">
                        <Avatar
                            src={photo || ""}
                            alt={name || __("profile", "ninja-drive")}
                            rounded="full"
                            width="32px"
                            height="32px"
                            fallback={name}
                        />

                        <Dropdown.TriggerArrow
                            arrowColor={arrowColor}
                            arrowSize="2xl"
                        />
                    </div>
                ) : (
                    <Card
                        padding={5}
                        rounded="sm"
                        background="white"
                        flex
                        gap={2}
                    >
                        <Avatar
                            src={photo || ""}
                            alt={name || __("profile", "ninja-drive")}
                            width="25px"
                            height="25px"
                            rounded="sm"
                            fallback={name}
                            fallBackLimit={2}
                        />

                        <Dropdown.TriggerArrow arrowSize="xl" />
                    </Card>
                )}
            </Dropdown.Trigger>

            <Dropdown.Content
                position={{
                    ...position,
                    top: "115%",
                }}
                style={{
                    padding: "10px",
                    minWidth: "320px",
                }}
            >
                <ProfileCard
                    accounts={login_accounts || []}
                    fullInfo={false}
                    title={__("My Accounts", "ninja-drive")}
                    addAccount
                    small
                />
            </Dropdown.Content>
        </Dropdown>
    );
};

export default Accounts;
