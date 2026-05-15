import { __ } from "@wordpress/i18n";
import { selectSettings } from "~/store/features/settingSlice";
import { saveToLocalStorage } from "~/utils/localStorage";
import useSaveSettings from "~/hooks/useSaveSettings";
import PageContainer from "~/components/molecules/PageContainer";
import SettingsField from "~/components/molecules/SettingsField";
import { PRELOADERS } from "~/constants/preloaders";
import ColorPicker from "~/components/atoms/ColorPicker";
import { useAppSelector } from "~/store/hooks";
import GridStack from "~/components/molecules/GridStack";
import useDebounce from "~/hooks/useDebounce";
import { CSS_VAR } from "~/types/tokens";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useEffect, useState } from "@wordpress/element";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import clsx from "clsx";
import { ThemeType } from "~/types/Types";

const Appearance = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveAppearance } = useSaveSettings();

    const { preloader, primaryColor, customCSS } = data?.appearance || {};

    const [themeStyle, setThemeStyle] = useLocalStorage<
        "light" | "dark" | "system"
    >("pnpnd-theme-status", "system");

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

    const [color, setColor] = useState<string>(primaryColor || "#1F6CFA");

    useDebounce(
        () => {
            saveAppearance("primaryColor", color);

            const root = document.documentElement;

            if (root && data?.appearance?.primaryColor) {
                root.style.setProperty(CSS_VAR.PRIMARY, color);
            }
        },
        [color],
        800,
    );

    return (
        <PageContainer>
            <SettingsField
                title={__("Theme Style", "ninja-drive")}
                description={__(
                    "Choose your preferred theme style for the plugin.",
                    "ninja-drive",
                )}
            >
                <ButtonGroup
                    select="single"
                    selectedKey={themeStyle}
                    onChange={(value: ThemeType) =>
                        setThemeStyle(value as "light" | "dark" | "system")
                    }
                    buttons={[
                        {
                            key: "light",
                            title: __("Light Mode", "ninja-drive"),
                            startIcon: "light_mode",
                            activeVariant: "primary",
                        },
                        {
                            key: "dark",
                            title: __("Dark Mode", "ninja-drive"),
                            startIcon: "dark_mode",
                            activeVariant: "primary",
                        },
                        {
                            key: "system",
                            title: __("System Theme", "ninja-drive"),
                            startIcon: "contrast",
                            activeVariant: "primary",
                        },
                    ]}
                />
            </SettingsField>

            <SettingsField
                title={__("Preloader", "ninja-drive")}
                description={__(
                    "Select the preloader style for the full plugin. The preloader will be visible during file loading.",
                    "ninja-drive",
                )}
            >
                <GridStack columns="auto-fit" min="150px" gap={10}>
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
                                statusProps={{
                                    isPro: isPro,
                                }}
                                border={active ? "primary" : "primary-light"}
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
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        width: "100%",
                                        height: "130px",
                                    }}
                                    className="pnpnd-preloader"
                                >
                                    {icon}
                                </Card>

                                <Text size="sm" align="center">
                                    {title}
                                </Text>
                            </Card>
                        );
                    })}
                </GridStack>
            </SettingsField>

        </PageContainer>
    );
};

export default Appearance;
