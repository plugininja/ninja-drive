import { formatFileSize, getUsedStorage, toBoolean } from "~/utils/functions";
import { __, sprintf } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { googleIcon } from "~/assets/icons";
import ProgressBar from "~/components/atoms/ProgressBar";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import useAuth from "~/hooks/useAuth";
import Divider from "~/components/atoms/Divider";
import Button from "~/components/atoms/Button";
import Avatar from "~/components/atoms/Avatar";
import Text from "~/components/atoms/Text";
import Card from "~/components/molecules/Card";
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
    connectionType,
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
                const { id: accountId, accountKey } = account || {};

                return (
                    <BlockStack key={accountId ?? accountKey}>
                        {fullInfo ? (
                            <ProfileCard.FullInfo
                                account={account}
                                connectionType={connectionType}
                            />
                        ) : (
                            <ProfileCard.Info
                                account={account}
                                connectionType={connectionType}
                            />
                        )}
                    </BlockStack>
                );
            })}

            {addAccount && (!accounts?.length || toBoolean(pnpnd.isPro)) && (
                <BlockStack align="center" inlineAlign="center">
                    <Card
                        padding={10}
                        background="primary-extralight"
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
                                connectionType,
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
    connectionType,
}: ProfileCardFullInfoProps) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const { name, email, photo, storage, active, lost, user, accountKey } =
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

    const switchEnabled =
        pnpnd?.currentUser?.can?.hasFullAccess && toBoolean(pnpnd.isPro);

    return (
        <Card background={active ? "primary-light" : "primary-light"}>
            <InlineStack align="between" gap={10}>
                <InlineStack gap={10}>
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

                        <BlockStack gap={10}>
                            <Text color="gray-500" size="sm">
                                {email}
                            </Text>

                            <ProgressBar
                                progress={getUsedStorage(
                                    Number(storage?.limit),
                                    Number(storage?.usage),
                                )}
                            />

                            <Text size="xs" weight="semibold">
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
                    </BlockStack>
                </InlineStack>

                <InlineStack gap={10}>
                    <Button
                        variant="secondary"
                        size="small"
                        startIcon="sync"
                        onClick={() => handleSyncAccount(accountKey)}
                        loading={
                            currentAccount === account?.accountKey &&
                            isSyncingAccount
                        }
                    >
                        {__("Sync", "ninja-drive")}
                    </Button>

                    <Button
                        variant="error"
                        size="small"
                        startIcon="person_remove"
                        onClick={async () => {
                            setCurrentAccount(account?.accountKey);
                            try {
                                await handleAccountRemove(account);
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setCurrentAccount("");
                            }
                        }}
                        loading={
                            currentAccount === account?.accountKey &&
                            isRemovingAccount
                        }
                    >
                        {__("Remove", "ninja-drive")}
                    </Button>

                    {switchEnabled && !active && !lost ? (
                        <Button
                            variant="warning"
                            size="small"
                            startIcon="autorenew"
                            onClick={async () => {
                                setCurrentAccount(account?.accountKey);
                                try {
                                    await handleAccountSwitch(account);
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setCurrentAccount("");
                                }
                            }}
                            loading={
                                currentAccount === account?.accountKey
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
                                setCurrentAccount(account?.accountKey);
                                try {
                                    await handleAddNewAccount(
                                        account.accountKey,
                                        "",
                                        "",
                                        true,
                                        connectionType,
                                    );
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setCurrentAccount("");
                                }
                            }}
                            loading={
                                currentAccount === account?.accountKey
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
            </InlineStack>

            <Divider marginTop={15} marginBottom={15} />

            <InlineStack gap={10}>
                <InlineStack gap={5}>
                    <Text size="sm" weight="semibold">
                        {__("Account added by:", "ninja-drive")}
                    </Text>

                    <Button
                        variant="secondary"
                        size="extrasmall"
                        textTransform="lowercase"
                    >
                        {user?.name ?? __("Unknown", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Text size="sm" weight="semibold">
                        {__("Email:", "ninja-drive")}
                    </Text>

                    <Button
                        variant="secondary"
                        size="extrasmall"
                        textTransform="lowercase"
                    >
                        {user?.email ?? __("Unknown", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={5}>
                    <Text size="sm" weight="semibold">
                        {__("Status:", "ninja-drive")}
                    </Text>

                    <Button
                        variant={
                            lost ? "error" : active ? "secondary" : "warning"
                        }
                        size="extrasmall"
                    >
                        {lost ? __("Lost", "ninja-drive") : active ? __("Active", "ninja-drive") : __("Inactive", "ninja-drive")}
                    </Button>
                </InlineStack>
            </InlineStack>
        </Card>
    );
};

ProfileCard.Info = ({ account, connectionType }: ProfileCardInfoProps) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const { name, email, photo, active, lost } = account || {};
    const {
        handleAddNewAccount,
        handleAccountSwitch,
        isGettingAuthUrl,
        isSwitchingAccount,
    } = useAuth();

    const switchEnabled =
        pnpnd?.currentUser?.can?.hasFullAccess && toBoolean(pnpnd.isPro);

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

            {switchEnabled && !active && !lost ? (
                <IconButton
                    variant="warning"
                    size="microsmall"
                    name="autorenew"
                    fontSize="lg"
                    className="pn-profile-card-status__info"
                    onClick={async () => {
                        setCurrentAccount(account?.accountKey);
                        try {
                            await handleAccountSwitch(account);
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setCurrentAccount("");
                        }
                    }}
                    loading={
                        currentAccount === account?.accountKey
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
                    className="pn-profile-card-status__info"
                    onClick={async () => {
                        if (active && !lost) return;
                        setCurrentAccount(account?.accountKey);
                        try {
                            await handleAddNewAccount(
                                account.accountKey,
                                "",
                                "",
                                true,
                                connectionType,
                            );
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setCurrentAccount("");
                        }
                    }}
                    loading={
                        currentAccount === account?.accountKey
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
                    className="pn-profile-card-status__info"
                />
            ) : null}
        </Card>
    );
};

export default ProfileCard;
