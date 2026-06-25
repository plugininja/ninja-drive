import { getUsedStorage, toBoolean } from "~kernel/utils/functions";
import { formatFileSize } from "~features/file-browser/utils/file";
import useAuth from "~features/auth/hooks/useAuth";
import { googleIcon } from "~kernel/utils/icons";
import { useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { ProgressBar } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Avatar } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { userCan } from "~kernel/utils/permissions";
import clsx from "clsx";
import {
    ProfileCardFullInfoProps,
    ProfileCardInfoProps,
    ProfileCardProps,
} from "./ProfileCard.type";

const ProfileCard = ({
    id,
    style,
    className,
    accounts,
    fullInfo = true,
    title,
    addAccount,
    small = false,
    connection_type,
}: ProfileCardProps) => {
    const { handleAddNewAccount } = useAuth();

    return (
        <BlockStack
            id={id}
            gap={fullInfo ? 20 : 10}
            style={style}
            className={className}
        >
            {title && (
                <Text weight="semibold" align="center">
                    {title}
                </Text>
            )}

            {accounts?.map((account) => {
                const { id: account_id, account_key } = account || {};

                return (
                    <BlockStack key={account_id ?? account_key}>
                        {fullInfo ? (
                            <ProfileCard.FullInfo
                                account={account}
                                connection_type={connection_type}
                            />
                        ) : (
                            <ProfileCard.Info
                                account={account}
                                connection_type={connection_type}
                            />
                        )}
                    </BlockStack>
                );
            })}

            {userCan("accounts_connect") &&
                addAccount &&
                (!accounts?.length || toBoolean(pnpnd.is_pro)) && (
                    <BlockStack align="center" inlineAlign="center">
                        <Card
                            padding={10}
                            background="gray-50"
                            border="gray-200"
                            flex
                            align="center"
                            blockAlign="center"
                            gap={small ? 7 : 10}
                            style={{
                                height: small ? "40px" : "50px",
                                cursor: "pointer",
                                width: "fit-content",
                                borderRadius: small ? "8px" : "10px",
                            }}
                            onClick={() =>
                                handleAddNewAccount(
                                    "",
                                    "",
                                    "",
                                    false,
                                    connection_type,
                                )
                            }
                        >
                            <img
                                src={googleIcon}
                                alt={__("Google Icon", "ninja-drive")}
                                style={{
                                    width: small ? "20px" : "30px",
                                    height: small ? "20px" : "30px",
                                }}
                            />

                            <Text size={small ? "sm" : "md"}>
                                {__("Sign in with Google", "ninja-drive")}
                            </Text>
                        </Card>
                    </BlockStack>
                )}
        </BlockStack>
    );
};

ProfileCard.FullInfo = ({
    account,
    connection_type,
}: ProfileCardFullInfoProps) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const { name, email, photo, storage, active, lost, user, account_key } =
        account || {};
    const {
        handleAddNewAccount,
        handleAccountSwitch,
        handleSyncAccount,
        handleAccountRemove,
        isGettingAuthUrl,
        isSwitchingAccount,
        isSyncingAccount,
        isRemovingAccount,
    } = useAuth();

    const switchEnabled = userCan("has_full_access") && toBoolean(pnpnd.is_pro);

    return (
        <Card
            background="gray-50"
            className={clsx(
                active && "pn-profile-card--active",
                lost && "pn-profile-card--lost",
            )}
        >
            <InlineStack align="between" gap={10}>
                <InlineStack gap={30}>
                    <InlineStack gap={10}>
                        <Avatar
                            src={photo}
                            alt={name}
                            width="50px"
                            height="50px"
                            rounded="full"
                        />

                        <BlockStack gap={5}>
                            <Text color="gray-700" size="sm" weight="semibold">
                                {name}
                            </Text>

                            <Text color="gray-500" size="sm">
                                {email}
                            </Text>
                        </BlockStack>
                    </InlineStack>

                    <Divider
                        variant="vertical"
                        height="60px"
                        color="gray-300"
                    />

                    <BlockStack gap={7}>
                        <InlineStack gap={10}>
                            <Icon
                                name="cloud"
                                color="gray-600"
                                fontSize="lg"
                                fontWeight="medium"
                            />

                            <Text color="gray-600" size="sm" weight="medium">
                                Storage
                            </Text>
                        </InlineStack>

                        <ProgressBar
                            progress={getUsedStorage(
                                Number(storage?.limit),
                                Number(storage?.usage),
                            )}
                        />

                        <Text color="gray-600" size="xs">
                            {sprintf(
                                __("%1$s of %2$s %3$s%% used", "ninja-drive"),
                                formatFileSize(Number(storage?.usage)),
                                formatFileSize(Number(storage?.limit)),
                                getUsedStorage(
                                    Number(storage?.limit),
                                    Number(storage?.usage),
                                ).toFixed(2),
                            )}
                        </Text>
                    </BlockStack>
                </InlineStack>

                <InlineStack gap={10}>
                    {userCan("accounts_manage") && (
                        <Button
                            variant="secondary"
                            size="small"
                            startIcon="sync"
                            onClick={() => {
                                setCurrentAccount(account?.account_key);
                                handleSyncAccount(account_key);
                            }}
                            loading={
                                currentAccount === account?.account_key &&
                                isSyncingAccount
                            }
                        >
                            {__("Sync", "ninja-drive")}
                        </Button>
                    )}

                    <Button
                        variant="error"
                        size="small"
                        startIcon="person_remove"
                        onClick={async () => {
                            setCurrentAccount(account?.account_key);
                            try {
                                await handleAccountRemove(account);
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setCurrentAccount("");
                            }
                        }}
                        loading={
                            currentAccount === account?.account_key &&
                            isRemovingAccount
                        }
                    >
                        {__("Remove", "ninja-drive")}
                    </Button>

                    {userCan("accounts_manage") && (
                        <InlineStack gap={10}>
                            {switchEnabled && !active && !lost ? (
                                <Button
                                    variant="warning"
                                    size="small"
                                    startIcon="autorenew"
                                    onClick={async () => {
                                        setCurrentAccount(account?.account_key);
                                        try {
                                            await handleAccountSwitch(account);
                                        } catch (err) {
                                            console.error(err);
                                        } finally {
                                            setCurrentAccount("");
                                        }
                                    }}
                                    loading={
                                        currentAccount === account?.account_key
                                            ? isSwitchingAccount
                                            : false
                                    }
                                >
                                    {__("Activate It", "ninja-drive")}
                                </Button>
                            ) : lost ? (
                                <Button
                                    variant="error"
                                    size="small"
                                    startIcon="no_accounts"
                                    onClick={async () => {
                                        if (!lost) return;
                                        setCurrentAccount(account?.account_key);
                                        try {
                                            await handleAddNewAccount(
                                                account.account_key,
                                                "",
                                                "",
                                                true,
                                                connection_type,
                                            );
                                        } catch (err) {
                                            console.error(err);
                                        } finally {
                                            setCurrentAccount("");
                                        }
                                    }}
                                    loading={
                                        currentAccount === account?.account_key
                                            ? isGettingAuthUrl
                                            : false
                                    }
                                >
                                    {__("Re authenticate", "ninja-drive")}
                                </Button>
                            ) : active ? (
                                <Button
                                    variant="primary"
                                    size="small"
                                    startIcon="check"
                                >
                                    {__("Active", "ninja-drive")}
                                </Button>
                            ) : null}
                        </InlineStack>
                    )}
                </InlineStack>
            </InlineStack>

            <Divider marginTop={15} marginBottom={15} />

            <InlineStack gap={10}>
                <InlineStack gap={5}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Account added by:", "ninja-drive")}
                    </Text>

                    <Button
                        variant="outlined"
                        size="extrasmall"
                        color="primary"
                        textTransform="lowercase"
                    >
                        {user?.name ?? __("Unknown", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Email:", "ninja-drive")}
                    </Text>

                    <Button
                        variant="outlined"
                        size="extrasmall"
                        color="primary"
                        textTransform="lowercase"
                    >
                        {user?.email ?? __("Unknown", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Status:", "ninja-drive")}
                    </Text>

                    <Button
                        variant={
                            lost ? "error" : active ? "outlined" : "warning"
                        }
                        size="extrasmall"
                        color={lost ? "error" : active ? "primary" : "warning"}
                    >
                        {lost
                            ? __("Lost", "ninja-drive")
                            : active
                            ? __("Active", "ninja-drive")
                            : __("Inactive", "ninja-drive")}
                    </Button>
                </InlineStack>
            </InlineStack>
        </Card>
    );
};

ProfileCard.Info = ({ account, connection_type }: ProfileCardInfoProps) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const { name, email, photo, active, lost } = account || {};
    const {
        handleAddNewAccount,
        handleAccountSwitch,
        handleAccountRemove,
        isGettingAuthUrl,
        isSwitchingAccount,
        isRemovingAccount,
    } = useAuth();

    const switchEnabled = userCan("has_full_access") && toBoolean(pnpnd.is_pro);

    return (
        <Card
            padding={12}
            flex
            blockAlign="center"
            gap={10}
            borderStyle="none"
            rounded="md"
            className="pn-profile-card-status"
        >
            <Avatar
                src={photo}
                alt={name}
                width="50px"
                height="50px"
                rounded="sm"
            />

            <BlockStack gap={5}>
                <Text size="sm" weight="semibold">
                    {name}
                </Text>

                <Text color="gray-500" size="sm">
                    {email}
                </Text>
            </BlockStack>

            {userCan("accounts_manage") && (
                <InlineStack
                    gap={5}
                    wrap={false}
                    className="pn-profile-card-status__info"
                >
                    {switchEnabled && !active && !lost ? (
                        <IconButton
                            variant="warning"
                            size="microsmall"
                            name="autorenew"
                            borderColor="warning-50"
                            fontSize="lg"
                            onClick={async () => {
                                setCurrentAccount(account?.account_key);
                                try {
                                    await handleAccountSwitch(account);
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setCurrentAccount("");
                                }
                            }}
                            loading={
                                currentAccount === account?.account_key
                                    ? isSwitchingAccount
                                    : false
                            }
                        />
                    ) : lost ? (
                        <IconButton
                            variant="error"
                            size="microsmall"
                            name="no_accounts"
                            fontSize="lg"
                            borderColor="error-50"
                            onClick={async () => {
                                if (active && !lost) return;
                                setCurrentAccount(account?.account_key);
                                try {
                                    await handleAddNewAccount(
                                        account.account_key,
                                        "",
                                        "",
                                        true,
                                        connection_type,
                                    );
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setCurrentAccount("");
                                }
                            }}
                            loading={
                                currentAccount === account?.account_key
                                    ? isGettingAuthUrl
                                    : false
                            }
                        />
                    ) : active ? (
                        <IconButton
                            variant="primary"
                            size="microsmall"
                            name="check"
                            fontSize="lg"
                        />
                    ) : null}

                    <IconButton
                        variant="error"
                        size="microsmall"
                        name="person_remove"
                        fontSize="lg"
                        borderColor="error-50"
                        onClick={async () => {
                            setCurrentAccount(account?.account_key);
                            try {
                                await handleAccountRemove(account);
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setCurrentAccount("");
                            }
                        }}
                        loading={
                            currentAccount === account?.account_key &&
                            isRemovingAccount
                        }
                    />
                </InlineStack>
            )}
        </Card>
    );
};

export default ProfileCard;
