import { useGetUserListQuery, useGetUserRolesQuery } from "~/store/api/authApi";
import { updateConfiguration } from "~/store/features/widgetBuilderSlice";
import SettingsField from "~/components/molecules/SettingsField";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import Description from "~/components/molecules/Description";
import BlockStack from "~/components/molecules/BlockStack";
import SelectBox from "~/components/molecules/SelectBox";
import { useEffect, useState } from "@wordpress/element";
import { MBConfiguration } from "~/types/widget.types";
import Disabled from "~/components/molecules/Disabled";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import Radio from "~/components/atoms/Radio";
import Text from "~/components/atoms/Text";
import Tabs from "~/components/atoms/Tabs";
import { __ } from "@wordpress/i18n";

const DisplayFor = () => {
    const { data: userList } = useGetUserListQuery({
        hide_current_user: true,
    });
    const { data: userRoles } = useGetUserRolesQuery();
    const { edit_data } = useAppSelector((state) => state?.widget_builder);

    const { security } = edit_data?.data?.configuration || {};
    const display_for = security?.display_for;
    const { who_can_view_module, logged_in_user_type } =
        security?.display_for || {};
    const selectedUserType = logged_in_user_type || "users";

    const [localUserType, setLocalUserType] = useState(selectedUserType);

    const dispatch = useAppDispatch();

    const rolesOptions =
        userRoles?.data?.roles.map((user) => ({
            name: user?.role_name,
            value: user?.role_key,
        })) || [];

    const usersOptions =
        userList?.data?.users?.map((user) => ({
            name: user?.user_login,
            value: user?.user_login,
        })) || [];

    useEffect(() => {
        setLocalUserType(selectedUserType);
    }, [selectedUserType]);

    const handleUpdateDisplay = (
        key: keyof MBConfiguration["security"],
        value: MBConfiguration["security"][keyof MBConfiguration["security"]],
    ) => {
        dispatch(
            updateConfiguration({
                key: "security",
                value: {
                    ...security!,
                    [key]: value,
                },
            }),
        );
    };

    return (
        <BlockStack gap={20}>
            <InlineStack gap={10}>
                <Text color="gray-700" size="sm" weight="medium">
                    {__("Display For", "ninja-drive")}
                </Text>

                {["everyone", "logged"]?.map((type) => (
                    <Radio
                        key={type}
                        title={type}
                        checked={who_can_view_module === type}
                        onChange={() =>
                            handleUpdateDisplay("display_for", {
                                ...display_for!,
                                who_can_view_module: type as
                                    | "everyone"
                                    | "logged",
                            })
                        }
                    />
                ))}
            </InlineStack>

            {who_can_view_module === "logged" && (
                <>
                    <SettingsField background="gray-50">
                        <InlineStack gap={10}>
                            <Text color="gray-700" size="sm" weight="medium">
                                {__("User Type", "ninja-drive")}
                            </Text>

                            <Tabs
                                background="white"
                                size="small"
                                rounded="md"
                                tabRounded="sm"
                                tabs={LOGGED_IN_USER_TYPES}
                                active={localUserType}
                                onTabClick={(value) => {
                                    setLocalUserType(
                                        value as "users" | "roles",
                                    );
                                    handleUpdateDisplay("display_for", {
                                        ...display_for!,
                                        logged_in_user_type: value as
                                            | "users"
                                            | "roles",
                                        display_for: [],
                                    });
                                }}
                            />
                        </InlineStack>

                        <BlockStack gap={10}>
                            <InlineStack gap={10}>
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                >
                                    {`${__("Select", "ninja-drive")} ${
                                        localUserType === "roles"
                                            ? __("Roles", "ninja-drive")
                                            : __("Users", "ninja-drive")
                                    }`}
                                </Text>

                                <SelectBox
                                    options={
                                        localUserType === "roles"
                                            ? rolesOptions
                                            : usersOptions
                                    }
                                    value={
                                        localUserType === "roles"
                                            ? [
                                                  ...display_for?.display_for!,
                                                  "administrator",
                                              ]
                                            : display_for?.display_for || []
                                    }
                                    requiredValue={
                                        localUserType === "roles"
                                            ? ["administrator"]
                                            : []
                                    }
                                    skipValues={["administrator"]}
                                    onChange={(value) =>
                                        handleUpdateDisplay("display_for", {
                                            ...display_for!,
                                            display_for: value as string[],
                                        })
                                    }
                                    size="small"
                                    multiple
                                    style={{
                                        minWidth: "150px",
                                    }}
                                />
                            </InlineStack>

                            <Description
                                text={__(
                                    "Select users to allow access. left empty to allow all logged in users.",
                                    "ninja-drive",
                                )}
                            />
                        </BlockStack>
                    </SettingsField>

                    <SettingsField
                        background="gray-50"
                        description={__(
                            "Display a message for users who don't have access to the widget.",
                            "ninja-drive",
                        )}
                        action={
                            <Switcher
                                id="access_denied_message"
                                title={__(
                                    "Show Access Denied Message",
                                    "ninja-drive",
                                )}
                                titleSize="sm"
                                checked={
                                    display_for?.show_access_denied_message
                                }
                                onChange={() =>
                                    handleUpdateDisplay("display_for", {
                                        ...display_for!,
                                        show_access_denied_message:
                                            !display_for?.show_access_denied_message,
                                    })
                                }
                            />
                        }
                    >
                        <Disabled
                            depend={!display_for?.show_access_denied_message}
                            dependOn="access_denied_message"
                        >
                            <Input
                                size="small"
                                helperText={__(
                                    "This message will be shown to users who don't have access.",
                                    "ninja-drive",
                                )}
                                value={display_for?.access_denied_message || ""}
                                onChange={(value) =>
                                    handleUpdateDisplay("display_for", {
                                        ...display_for!,
                                        access_denied_message: String(value),
                                    })
                                }
                                disabled={
                                    !display_for?.show_access_denied_message
                                }
                            />
                        </Disabled>
                    </SettingsField>
                </>
            )}
        </BlockStack>
    );
};

export default DisplayFor;

const LOGGED_IN_USER_TYPES: {
    key: "roles" | "users";
    title: string;
    icon: string;
}[] = [
    {
        key: "roles",
        title: __("Roles", "ninja-drive"),
        icon: "manage_accounts",
    },
    {
        key: "users",
        title: __("Users", "ninja-drive"),
        icon: "person",
    },
];
