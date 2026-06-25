import { useEffect, useMemo, useState } from "@wordpress/element";
import { File } from "~features/file-browser/types/file.types";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Switcher } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Status } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    SelectControl,
    __experimentalInputControl as InputControl,
    SVG,
    Path,
    Button as ButtonV2,
    __experimentalTruncate as Truncate,
} from "@wordpress/components";
import {
    ShareLinkRequest,
    useShareLinkMutation,
} from "~features/file-browser/api/fileApi";

interface ShareLinkContentProps {
    file: File;
    onConfirm: (file_key: string) => Promise<void>;
    onCancel: () => void;
    widget_id?: string;
    meta_data?: any;
}

const validityOptions: { value: string; label: string }[] = [
    { value: "3600", label: __("1 Hour", "ninja-drive") },
    { value: "18000", label: __("5 Hours", "ninja-drive") },
    { value: "86400", label: __("1 Day", "ninja-drive") },
    { value: "604800", label: __("1 Week", "ninja-drive") },
    { value: "2419200", label: __("1 Month", "ninja-drive") },
    { value: "29030400", label: __("1 Year", "ninja-drive") },
    { value: "0", label: __("Permanent", "ninja-drive") },
    { value: "custom", label: __("Custom", "ninja-drive") },
];

const MIN_PASSWORD_LEN = 6;

export function ShareLinkContent({
    file,
    widget_id,
    meta_data,
    onConfirm,
    onCancel,
}: ShareLinkContentProps) {
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [link, setLink] = useState("");
    const [pwd, setPwd] = useState("");
    const [validity, setValidity] = useState<string>("3600");
    const [customValidity, setCustomValidity] = useState<number>(3600); // Default 1 hour in seconds
    const [isCopied, setIsCopied] = useState(false);
    const [passVisible, setPassVisible] = useState(false);

    const { showAlert } = useCustomAlert();

    const [
        generateLink,
        { isLoading: isGenerating, error: genError, reset: resetMutation },
    ] = useShareLinkMutation();

    useEffect(() => {
        if (!meta_data) return;

        const { expiry, password } = meta_data;

        const exp = Number(expiry);

        setIsEncrypted(!!password);

        if (!!password) {
            setPwd("******");
        }

        if (exp === 0) {
            setValidity("0");
        } else if (exp) {
            const matchedOption = validityOptions.find(
                (option) => option.value === String(exp),
            );

            if (matchedOption) {
                setValidity(matchedOption.value);
            } else {
                const remaining = exp - Math.floor(Date.now() / 1000);
                setValidity("custom");
                setCustomValidity(remaining);
            }
        } else {
            setValidity("3600");
        }
    }, [meta_data]);

    useEffect(() => {
        if (isCopied) {
            const t = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(t);
        }
    }, [isCopied]);

    useEffect(() => {
        setLink("");
        resetMutation();
    }, [
        validity,
        customValidity,
        isEncrypted,
        pwd,
        file?.file_key,
        resetMutation,
    ]);

    const passwordError = useMemo(() => {
        if (!isEncrypted) return "";
        if (!pwd) return __("Password required.", "ninja-drive");
        if (pwd.length < MIN_PASSWORD_LEN)
            return `${__(
                "Password must be at least",
                "ninja-drive",
            )} ${MIN_PASSWORD_LEN} ${__("characters.", "ninja-drive")}`;
        return "";
    }, [isEncrypted, pwd]);

    const customValidityError = useMemo(() => {
        if (validity !== "custom") return "";
        if (!Number.isFinite(customValidity) || isNaN(customValidity))
            return __("Enter a valid number.", "ninja-drive");
        if (customValidity <= 0)
            return __("Must be greater than 0 seconds.", "ninja-drive");
        if (customValidity > 60 * 60 * 24 * 365 * 5)
            // 5 years in seconds
            return __(
                "Keep under 5 years (~157,680,000 seconds).",
                "ninja-drive",
            );
        return "";
    }, [validity, customValidity]);

    const canGenerate = !isGenerating && !passwordError && !customValidityError;

    const handleGenerateLink = async () => {
        if (!canGenerate) {
            showAlert({
                toast: true,
                type: "error",
                text: __(
                    "Please fix errors before generating the link.",
                    "ninja-drive",
                ),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        const config: ShareLinkRequest = {
            file_key: file?.file_key || "",
            password: isEncrypted
                ? meta_data
                    ? pwd === "******"
                        ? undefined
                        : pwd
                    : pwd
                : undefined,
        };

        if (validity !== "0") {
            config.expire_in =
                validity === "custom" ? customValidity.toString() : validity;
        }

        if (widget_id) {
            config.widget_id = widget_id;
        }

        if (meta_data) {
            config.update = true;
        }

        if (meta_data?.key) {
            config.share_link_id = meta_data.key;
        }

        try {
            const data = await generateLink(config).unwrap();

            if (data?.data) {
                setLink(data?.data?.link);

                if (meta_data) {
                    window.dispatchEvent(
                        new CustomEvent("SHARE_LINK_UPDATED", {
                            detail: {
                                updated_link: data?.data?.updated_data,
                            },
                        }),
                    );

                    onCancel();
                }

                showAlert({
                    toast: true,
                    type: "success",
                    text:
                        data?.message ||
                        __("Link generated successfully!", "ninja-drive"),
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            }
        } catch {
            setLink("");
            showAlert({
                toast: true,
                type: "error",
                text: __("Failed to generate link.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setIsCopied(true);

            showAlert({
                toast: true,
                type: "success",
                text: __("Link copied to clipboard!", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch {
            setIsCopied(false);
            showAlert({
                toast: true,
                type: "error",
                text: __("Failed to copy link.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const handleCustomValidityChange = (value?: string) => {
        const numValue = Number(value);
        if (value === "" || isNaN(numValue)) {
            setCustomValidity(0);
        } else {
            setCustomValidity(Math.max(1, Math.floor(numValue)));
        }
    };

    const validateCustomValidity = (value: string): string | undefined => {
        const numValue = Number(value);

        if (value === "" || isNaN(numValue)) {
            return __("Please enter a valid number.", "ninja-drive");
        }

        if (numValue <= 0) {
            return __("Must be greater than 0 seconds.", "ninja-drive");
        }

        if (numValue > 60 * 60 * 24 * 365 * 5) {
            return __(
                "Keep under 5 years (~157,680,000 seconds).",
                "ninja-drive",
            );
        }

        return undefined;
    };

    const validatePassword = (value: string): string | undefined => {
        if (!isEncrypted) return undefined;
        if (!value) return __("Password required.", "ninja-drive");
        if (value.length < MIN_PASSWORD_LEN)
            return `${__(
                "Password must be at least",
                "ninja-drive",
            )} ${MIN_PASSWORD_LEN} ${__("characters.", "ninja-drive")}`;
        return undefined;
    };

    return (
        <BlockStack gap={15} padding={0}>
            <InlineStack gap={10} align="between" wrap={false}>
                <Truncate
                    as="h4"
                    style={{
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    className="text-black text-sm"
                >
                    {__("Share", "ninja-drive")} "{file?.name}"
                </Truncate>

                <IconButton
                    variant="error"
                    size="supersmall"
                    name="close"
                    onClick={onCancel}
                />
            </InlineStack>

            <Card background="primary-extralight" flex direction="col" gap={15}>
                {link && (
                    <InputControl
                        value={link}
                        __next40pxDefaultSize
                        label={__("Shareable Link", "ninja-drive")}
                        onClick={handleCopyLink}
                        onKeyDown={handleCopyLink}
                        prefix={
                            <ButtonV2
                                icon={
                                    <SVG
                                        onClick={handleCopyLink}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <Path d="M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" />
                                    </SVG>
                                }
                            />
                        }
                        help={
                            isCopied
                                ? __("Copied to clipboard!", "ninja-drive")
                                : ""
                        }
                        readOnly
                    />
                )}

                <Button
                    variant="primary"
                    onClick={handleGenerateLink}
                    disabled={!canGenerate}
                    loading={isGenerating}
                >
                    {meta_data
                        ? __("Update Share Link", "ninja-drive")
                        : __("Generate Share Link", "ninja-drive")}
                </Button>

                {!!genError && (
                    <Text color="error" size="sm">
                        {__(
                            "Failed to generate link. Please try again.",
                            "ninja-drive",
                        )}
                    </Text>
                )}
            </Card>
        </BlockStack>
    );
}

export function useShareLink() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openShareLink = ({
        file,
        widget_id,
        meta_data,
        onConfirm,
    }: {
        file: File;
        widget_id?: string;
        meta_data?: any;
        onConfirm: (file_key: string) => Promise<void>;
    }) => {
        showAlert({
            id: "share-link-modal",
            type: "info",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "450px",
            html: (
                <ShareLinkContent
                    file={file}
                    widget_id={widget_id}
                    meta_data={meta_data}
                    onCancel={() => {
                        closeAlert("share-link-modal");
                    }}
                    onConfirm={async (file_key) => {
                        await onConfirm(file_key);

                        showAlert({
                            toast: true,
                            type: "success",
                            text: __("Shared successfully", "ninja-drive"),
                            timer: 3000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }}
                />
            ),
        });
    };

    return { openShareLink };
}
