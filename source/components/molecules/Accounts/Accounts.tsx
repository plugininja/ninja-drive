import { __ } from "@wordpress/i18n";
import { selectAuth } from "~/store/features/authSlice";
import { useAppSelector } from "~/store/hooks";
import { TextColor } from "~/types/styles";
import ProfileCard from "~/components/molecules/ProfileCard";
import Dropdown from "~/components/molecules/Dropdown";
import Avatar from "~/components/atoms/Avatar";
import Card from "~/components/molecules/Card";

const Accounts = ({
    position = { left: "auto", right: "0" },
    arrowColor = "black",
    mediaLibrary = false,
}: {
    position?: { left: string; right: string };
    arrowColor?: TextColor;
    mediaLibrary?: boolean;
}) => {
    const { loginAccounts, activeAccount } = useAppSelector(selectAuth);

    const { name, photo } = activeAccount || {};

    return (
        <Dropdown>
            <Dropdown.Trigger>
                {mediaLibrary ? (
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
                    accounts={loginAccounts || []}
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
