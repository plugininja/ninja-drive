import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { useAppSelector } from "~kernel/store/hooks";
import { toBoolean } from "~kernel/utils/functions";
import { Input, Text, Button } from "~/ui/atoms";
import { Description } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { SelectBox } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import {
    useEmbedWidgetMutation,
    useGetPagesQuery,
} from "~features/widget-builder/api/widgetApi";
import {
    completeStep,
    resetSteps,
} from "~features/widget-builder/hooks/useOnboardingStep";

type Action = "options" | "select" | "create";

const EmbedPage = ({ setAction }: { setAction: (action: Action) => void }) => {
    return (
        <BlockStack padding={15} align="center" inlineAlign="center" gap={15}>
            <Text size="xl" weight="medium" align="center">
                {__("Embed in a Page", "ninja-drive")}
            </Text>

            <Description
                align="center"
                text={__(
                    "Would you like to embed your form in an existing page, or create a new one?",
                    "ninja-drive",
                )}
            />

            <InlineStack gap={10} align="center">
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => setAction("select")}
                >
                    {__("Select Existing Page", "ninja-drive")}
                </Button>

                <Button
                    variant="outlined"
                    size="small"
                    style={{
                        color: "var(--pnpnd-primary)",
                    }}
                    onClick={() => setAction("create")}
                >
                    {__("Create New Page", "ninja-drive")}
                </Button>
            </InlineStack>

            <Text color="gray-500" size="xs" align="center">
                {__("You can also", "ninja-drive")}{" "}
                <a
                    href=""
                    target="_blank"
                    style={{
                        color: "var(--pnpnd-gray-500)",
                    }}
                >
                    <Text color="gray-800" size="xs" align="center">
                        {__("embed your form manually", "ninja-drive")}
                    </Text>
                </a>{" "}
                {__("or", "ninja-drive")}{" "}
                <a
                    href=""
                    target="_blank"
                    style={{
                        color: "var(--pnpnd-gray-500)",
                    }}
                >
                    <Text color="gray-800" size="xs" align="center">
                        {__("use a shortcode", "ninja-drive")}
                    </Text>
                </a>
            </Text>
        </BlockStack>
    );
};

const SelectPage = ({
    selectedPage,
    setSelectedPage,
    setAction,
    onSubmit,
    loading,
}: {
    selectedPage: string;
    setSelectedPage: (page: string) => void;
    setAction: (action: Action) => void;
    onSubmit: () => void;
    loading: boolean;
}) => {
    const { data: pages, isLoading } = useGetPagesQuery();

    const options = pages?.map((page) => ({
        name: page?.title?.rendered,
        value: String(page?.id),
    }));

    return (
        <BlockStack padding={15} align="center" inlineAlign="center" gap={15}>
            <Text size="xl" weight="medium" align="center">
                {__("Embed in a Page", "ninja-drive")}
            </Text>

            <Description
                align="center"
                text={__(
                    "Select the page you would like to embed your form in.",
                    "ninja-drive",
                )}
            />

            <InlineStack gap={5} align="center" className="w-full">
                <SelectBox
                    size="small"
                    background="gray-50"
                    color="gray-200"
                    className="w-full flex-1"
                    options={options || []}
                    value={selectedPage ? [selectedPage] : []}
                    onChange={(value) => {
                        setSelectedPage(String(value[0]));
                        completeStep(7);
                    }}
                    loading={isLoading}
                />

                <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                        if (!selectedPage) return;
                        onSubmit();
                    }}
                    loading={loading}
                    disabled={!selectedPage}
                >
                    {__("Let’s Go!", "ninja-drive")}
                </Button>
            </InlineStack>

            <Button
                color="black"
                size="small"
                onClick={() => setAction("options")}
            >
                {__("Go Back", "ninja-drive")}
            </Button>
        </BlockStack>
    );
};

const CreatePage = ({
    pageName,
    setPageName,
    setAction,
    onSubmit,
    loading,
}: {
    pageName: string;
    setPageName: (name: string) => void;
    setAction: (action: Action) => void;
    onSubmit: () => void;
    loading: boolean;
}) => {
    return (
        <BlockStack padding={15} align="center" inlineAlign="center" gap={15}>
            <Text size="xl" weight="medium" align="center">
                {__("Embed in a Page", "ninja-drive")}
            </Text>

            <Description
                align="center"
                text={__(
                    "Select the page you would like to embed your form in.",
                    "ninja-drive",
                )}
            />

            <InlineStack gap={5} align="center" className="w-full">
                <Input
                    value={pageName}
                    onChange={(value) => {
                        setPageName(String(value));
                        completeStep(7);
                    }}
                    size="small"
                    background="gray-50"
                    color="gray-200"
                    className="w-full flex-1"
                    placeholder={__("Name your page", "ninja-drive")}
                />

                <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                        if (!pageName) return;
                        onSubmit();
                    }}
                    loading={loading}
                    disabled={!pageName}
                >
                    {__("Let’s Go!", "ninja-drive")}
                </Button>
            </InlineStack>

            <Button
                color="black"
                size="small"
                onClick={() => setAction("options")}
            >
                {__("Go Back", "ninja-drive")}
            </Button>
        </BlockStack>
    );
};

const EmbedPageContainer = ({ onClose }: { onClose: () => void }) => {
    const [selectedPage, setSelectedPage] = useState<string>("");
    const [pageName, setPageName] = useState<string>("");
    const [action, setAction] = useState<Action>("options");
    const [animation, setAnimation] = useState("pnpnd-embed-scale");
    const [loading, setLoading] = useState(false);
    const { edit_data } = useAppSelector((state) => state?.widget_builder);
    const { showAlert } = useCustomAlert();

    const [embedWidget] = useEmbedWidgetMutation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "Enter" &&
                !loading &&
                (action === "select" ? selectedPage : pageName)
            ) {
                handleSubmit();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPage, pageName, action, loading]);

    const handleActionChange = (nextAction: Action) => {
        if (nextAction === "options") {
            setAnimation("pnpnd-embed-scale");
        }

        if (nextAction === "select") {
            setAnimation("pnpnd-embed-slide-left");
        }

        if (nextAction === "create") {
            setAnimation("pnpnd-embed-slide-right");
        }

        setAction(nextAction);
    };

    const handleSubmit = async () => {
        if (!selectedPage && action === "select") return;
        if (!pageName && action === "create") return;

        setLoading(true);

        try {
            const response = await embedWidget({
                widget_id: edit_data?.id || "",
                page_id: selectedPage,
                page_name: pageName,
            }).unwrap();

            setLoading(false);

            if (toBoolean(pnpnd?.onboarding)) {
                resetSteps();
            }

            onClose();

            showAlert({
                toast: true,
                type: "success",
                text: __("Embed successful", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            window.open(response?.data?.page_url, "_blank");
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Something went wrong", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    return (
        <BlockStack
            style={{
                animationDuration: "300ms",
                animationTimingFunction: "ease",
                animationFillMode: "both",
            }}
            className={animation}
        >
            {action === "options" ? (
                <EmbedPage setAction={handleActionChange} />
            ) : action === "select" ? (
                <SelectPage
                    selectedPage={selectedPage}
                    setSelectedPage={setSelectedPage}
                    setAction={handleActionChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            ) : (
                <CreatePage
                    pageName={pageName}
                    setPageName={setPageName}
                    setAction={handleActionChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            )}
        </BlockStack>
    );
};

export function useEmbedPage() {
    const { showAlert, closeAlert } = useCustomAlert();

    const openEmbedPage = () => {
        showAlert({
            id: "pnpnd-embed-page",
            width: "450px",
            showIcon: false,
            showConfirmButton: false,
            showCancelButton: false,
            html: (
                <EmbedPageContainer
                    onClose={() => closeAlert("pnpnd-embed-page")}
                />
            ),
        });
    };

    return { openEmbedPage };
}
