import SettingsField from "~/components/molecules/SettingsField";
import PageContainer from "~/components/molecules/PageContainer";
import { selectSettings } from "~/store/features/settingSlice";
import InlineStack from "~/components/molecules/InlineStack";
import { css as codemirrorCss } from "@codemirror/lang-css";
import IconButton from "~/components/molecules/IconButton";
import BlockStack from "~/components/molecules/BlockStack";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { saveToLocalStorage } from "~/utils/localStorage";
import { useEffect, useState } from "@wordpress/element";
import GridStack from "~/components/molecules/GridStack";
import ColorPicker from "~/components/atoms/ColorPicker";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import useSaveSettings from "~/hooks/useSaveSettings";
import { PRELOADERS } from "~/constants/preloaders";
import ReactCodeMirror from "@uiw/react-codemirror";
import Divider from "~/components/atoms/Divider";
import { useAppSelector } from "~/store/hooks";
import Card from "~/components/molecules/Card";
import Status from "~/components/atoms/Status";
import useDebounce from "~/hooks/useDebounce";
import { toBoolean } from "~/utils/functions";
import Tabs from "~/components/atoms/Tabs";
import Info from "~/components/atoms/Info";
import Text from "~/components/atoms/Text";
import { CSS_VAR } from "~/types/tokens";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const Appearance = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveAppearance } = useSaveSettings();

    const { preloader, primary_color, custom_css } = data?.appearance || {};

    const [cssValue, setCssValue] = useState<string>(custom_css as string);
    const [color, setColor] = useState<string>(primary_color || "#1F6CFA");
    console.log(custom_css, "cssValue");
    const [themeStyle, setThemeStyle] = useLocalStorage<
        "light" | "dark" | "system"
    >("pnpnd-theme-status", "light");

    useEffect(() => {
        const root = document.documentElement;

        if (themeStyle === "system") {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            root.setAttribute(
                "pnpnd-theme-status",
                prefersDark ? "dark" : "light",
            );
        } else {
            root.setAttribute("pnpnd-theme-status", themeStyle);
        }
    }, [themeStyle]);

    useDebounce(
        () => {
            if (custom_css === cssValue) return;
            saveAppearance("custom_css", cssValue);
        },
        [cssValue],
        800,
    );

    useDebounce(
        () => {
            if (!toBoolean(pnpnd?.is_pro)) return;

            saveAppearance("primary_color", color);

            const root = document.documentElement;

            if (root && data?.appearance?.primary_color) {
                root.style.setProperty(CSS_VAR.PRIMARY, color);
            }
        },
        [color],
        800,
    );

    return (
        <PageContainer compact style={{ margin: "0 auto" }}>
            <SettingsField>

                <BlockStack gap={15}>
                    <Text color="gray-700" size="sm" weight="medium">
                        {__("Theme Style", "ninja-drive")}
                    </Text>

                    <Tabs
                        size="small"
                        rounded="md"
                        tabRounded="sm"
                        tabs={[
                            {
                                key: "light",
                                title: __("Light Mode", "ninja-drive"),
                                icon: "light_mode",
                            },
                            {
                                key: "dark",
                                title: __("Dark Mode", "ninja-drive"),
                                icon: "dark_mode",
                            },
                            {
                                key: "system",
                                title: __("System Theme", "ninja-drive"),
                                icon: "contrast",
                            },
                        ]}
                        active={themeStyle}
                        onTabClick={(value) =>
                            setThemeStyle(value as "light" | "dark" | "system")
                        }
                    />
                </BlockStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={15}>
                    <InlineStack gap={10}>
                        <Text color="gray-700" size="sm" weight="medium">
                            {__("Preloader", "ninja-drive")}
                        </Text>

                        <Info
                            title={__(
                                "Preloader is shown while content is loading.",
                                "ninja-drive",
                            )}
                        />
                    </InlineStack>

                    <GridStack columns="auto-fit" min="150px" gap={15}>
                        <Card
                            padding={"15px 15px 10px 15px"}
                            background="white"
                            flex
                            direction="col"
                            align="center"
                            blockAlign="center"
                            gap={10}
                            border="gray-200"
                        >
                            <Card
                                padding={10}
                                background="gray-50"
                                border="gray-200"
                                flex
                                align="center"
                                blockAlign="center"
                                style={{
                                    width: "100%",
                                    height: "110px",
                                }}
                                className="pnpnd-preloader"
                            >
                                <IconButton
                                    variant="white"
                                    name="upload"
                                    size="large"
                                    rounded="md"
                                    border
                                    borderColor="gray-200"
                                />
                            </Card>

                            <Text color="gray-700" size="sm" align="center">
                                {__("Custom", "ninja-drive")}
                            </Text>
                        </Card>

                        {PRELOADERS.map(({ id, title, isPro, icon }, index) => {
                            const active = preloader === id;

                            return (
                                <Card
                                    key={index}
                                    padding={"15px 15px 10px 15px"}
                                    background="white"
                                    flex
                                    direction="col"
                                    align="center"
                                    blockAlign="center"
                                    gap={10}
                                    border={active ? "primary" : "gray-200"}
                                    className={clsx(
                                        active && "pnpnd-preloader-active",
                                    )}
                                    onClick={() => {
                                            saveAppearance("preloader", id);
                                            saveToLocalStorage(
                                                "pnpnd-preloader",
                                                id,
                                            );
                                    }}
                                >
                                    <Card
                                        padding={10}
                                        background="gray-50"
                                        border="gray-200"
                                        flex
                                        align="center"
                                        blockAlign="center"
                                        style={{
                                            width: "100%",
                                            height: "110px",
                                        }}
                                        className="pnpnd-preloader"
                                    >
                                        {icon}
                                    </Card>

                                    <InlineStack
                                        gap={10}
                                        wrap={false}
                                        align="center"
                                    >
                                        <Text
                                            color={
                                                active ? "primary" : "gray-700"
                                            }
                                            size="sm"
                                            align="center"
                                        >
                                            {title}
                                        </Text>

                                        {isPro && <Status.Pro />}
                                    </InlineStack>
                                </Card>
                            );
                        })}
                    </GridStack>
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default Appearance;
