import { updateConfiguration } from "~/store/features/widgetBuilderSlice";
import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import { useEffect, useState } from "@wordpress/element";
import { MBConfiguration } from "~/types/widget.types";
import Switcher from "~/components/atoms/Switcher";
import { validatePassword } from "~/utils/widget";
import Divider from "~/components/atoms/Divider";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import DisplayFor from "./DisplayFor";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";

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
            docLink={DOCS?.MODULE_BUILDER?.configuration?.link}
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
