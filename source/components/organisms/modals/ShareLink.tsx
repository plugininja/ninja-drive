import { ShareLinkRequest, useShareLinkMutation } from "~/store/api/fileApi";
import { useEffect, useMemo, useState } from "@wordpress/element";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import Switcher from "~/components/atoms/Switcher";
import Card from "~/components/molecules/Card";
import Status from "~/components/atoms/Status";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { File } from "~/types/file.types";
import { __ } from "@wordpress/i18n";
import {
    SelectControl,
    __experimentalInputControl as InputControl,
    SVG,
    Path,
    Button as ButtonV2,
    __experimentalTruncate as Truncate,
} from "@wordpress/components";

interface ShareLinkContentProps {
    file: File;
    onConfirm: (file_key: string) => Promise<void>;
    onCancel: () => void;
    widget_id?: string;
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
    onConfirm,
    onCancel,
    widget_id,
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
            password: isEncrypted ? pwd : undefined,
        };

        if (validity !== "0") {
            config.expire_in =
                validity === "custom" ? customValidity.toString() : validity;
        }

        if (widget_id) {
            config.widget_id = widget_id;
        }

        try {
            const data = await generateLink(config).unwrap();

            if (data.data) {
                setLink(data.data);
                showAlert({
                    toast: true,
                    type: "success",
                    text: __("Link generated successfully!", "ninja-drive"),
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
                    {__("Generate Share Link", "ninja-drive")}
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
        onConfirm,
        widget_id,
    }: {
        file: File;
        widget_id?: string;
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
