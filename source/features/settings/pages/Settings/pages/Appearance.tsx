import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { selectSettings } from "~features/settings/state/settingSlice";
import { useLocalStorage } from "~kernel/hooks/useLocalStorage";
import { saveToLocalStorage } from "~kernel/utils/localStorage";
import SettingsField from "~/shared/molecules/SettingsField";
import { PRELOADERS } from "~kernel/constants/preloaders";
import { useEffect, useState } from "@wordpress/element";
import { useAppSelector } from "~kernel/store/hooks";
import { PageContainer } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { GridStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Status } from "~/ui/atoms";
import { Tabs } from "~/ui/atoms";
import { Info } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import clsx from "clsx";

const Appearance = () => {
    const { data } = useAppSelector(selectSettings);
    const { saveAppearance } = useSaveSettings();

    const { preloader, primary_color, custom_css } = data?.appearance || {};

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
