import { updateConfiguration } from "~features/widget-builder/state/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import DisplayFor from "./DisplayFor";
import { Switcher } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    MBConfiguration,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";
import {
    getModuleDocLink,
    validatePassword,
} from "~features/widget-builder/utils/widget";

const Security = () => {
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const [error, setError] = useState<string | null>(null);

    const { security } = edit_data?.data.configuration || {};

    const { password_protect } = security || {};

    const { enable, password } = password_protect || {};

    const dispatch = useAppDispatch();

    const { showAlert } = useCustomAlert();

    useEffect(() => {
        setError(validatePassword(password || ""));
    }, [password, enable]);

    const randInt = (max: number) => {
        const a = new Uint32Array(1);
        crypto.getRandomValues(a);
        return a[0] % max;
    };

    const shuffle = (arr: string[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = randInt(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const generatePassword = (length = 16): string => {
        const lowers = "abcdefghijkmnopqrstuvwxyz";
        const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const digits = "23456789";
        const symbols = "!@#$%^&*()-_=+[]{};:,.?";
        const required = [
            lowers[randInt(lowers.length)],
            uppers[randInt(uppers.length)],
            digits[randInt(digits.length)],
            symbols[randInt(symbols.length)],
        ];
        const all = lowers + uppers + digits + symbols;
        const rest: string[] = [];
        for (let i = required.length; i < length; i++)
            rest.push(all[randInt(all.length)]);
        return shuffle([...required, ...rest]).join("");
    };

    const handleGenerate = () => {
        const next = generatePassword(16);

        handleUpdateSecurity("password_protect", {
            ...security?.password_protect!,
            password: next,
        });

        window.navigator.clipboard.writeText(next);

        showAlert({
            toast: true,
            type: "success",
            text: __(
                "Password generated and copied to clipboard.",
                "ninja-drive",
            ),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    const handleUpdateSecurity = (
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
        <PageContainer
            compact
            style={{
                margin: "20px auto 0",
            }}
            title={__("Security", "ninja-drive")}
            docLink={getModuleDocLink(edit_data?.type as ModuleKey)}
        >
            <SettingsField
                description={__(
                    "Set the password for this module.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Password Protection", "ninja-drive")}
                        titleSize="sm"
                        checked={enable}
                        onChange={() =>
                            handleUpdateSecurity("password_protect", {
                                ...password_protect!,
                                enable: !enable,
                            })
                        }
                    />
                }
            >
                {enable && (
                    <InlineStack gap={10} marginTop={10} blockAlign="start">
                        <Text
                            color="gray-700"
                            size="sm"
                            weight="medium"
                            style={{
                                marginTop: "7px",
                            }}
                        >
                            {__("Set Password", "ninja-drive")}
                        </Text>

                        <Input
                            size="small"
                            fullWidth={false}
                            autoComplete="new-password"
                            placeholder={__(
                                "Enter password here",
                                "ninja-drive",
                            )}
                            value={password || ""}
                            onChange={(value) =>
                                handleUpdateSecurity("password_protect", {
                                    ...password_protect!,
                                    password: value as string,
                                })
                            }
                            aria-invalid={!!error}
                            aria-describedby="password-help password-error"
                            error={!!error}
                            errorText={error ?? ""}
                        />

                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            style={{
                                backgroundColor:
                                    "var(--pnpnd-primary-extralight)",
                            }}
                            onClick={handleGenerate}
                        >
                            {__("Generate", "ninja-drive")}
                        </Button>
                    </InlineStack>
                )}

                <Divider width="100%" height="1px" />

                <DisplayFor />
            </SettingsField>
        </PageContainer>
    );
};

export default Security;
