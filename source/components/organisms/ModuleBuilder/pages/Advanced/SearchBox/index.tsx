import { updateAdvanced } from "~/store/features/widgetBuilderSlice";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import Description from "~/components/molecules/Description";
import { AdvancedSearchBox } from "~/types/widget.types";
import { VIEW_STYLE_BUTTONS } from "~/constants/widget";
import SettingsField from "~/components/molecules/SettingsField";
import ButtonGroup from "~/components/molecules/ButtonGroup";
import Switcher from "~/components/atoms/Switcher";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Note from "~/components/molecules/Note";

const SearchBox = () => {
    const { editData } = useAppSelector((state) => state?.widgetBuilder);
    const { searchBox } = editData?.data?.advanced || {};

    const dispatch = useAppDispatch();

    const {
        browserView,
        showLastModified,
        searchBoxText,
        secureVideoPlayback,
    } = searchBox || {};

    const handleUpdate = (
        key: keyof AdvancedSearchBox,
        value: AdvancedSearchBox[keyof AdvancedSearchBox],
    ) => {
        if (!searchBox) return;

        dispatch(
            updateAdvanced({
                key: "searchBox",
                value: { ...searchBox, [key]: value },
            }),
        );
    };

    return (
        <>
            <SettingsField
                title={__("Browser View", "ninja-drive")}
            >
                <ButtonGroup
                    background="primary-extralight"
                    buttons={VIEW_STYLE_BUTTONS}
                    selectedKey={browserView || "grid"}
                    onChange={(value) =>
                        handleUpdate("browserView", value as string)
                    }
                />

                <Description
                    text={__(
                        "Select the file browser view.",
                        "ninja-drive",
                    )}
                />

                <SettingsField.SubField
                    description={__(
                        "Show/ hide the file last modified date field in the list view.",
                        "ninja-drive",
                    )}
                    action={
                        <Switcher
                            title={__(
                                "Show Last Modified Field",
                                "ninja-drive",
                            )}
                            checked={showLastModified}
                            onChange={(value) =>
                                handleUpdate("showLastModified", value)
                            }
                        />
                    }
                />
            </SettingsField>

            <SettingsField>
                <Input
                    size="small"
                    label={__("Search Box Text", "ninja-drive")}
                    helperText={__(
                        "Set the search box text. Need to search minimum 3 characters.",
                        "ninja-drive",
                    )}
                    value={searchBoxText ?? ""}
                    onChange={(value) =>
                        handleUpdate("searchBoxText", String(value))
                    }
                />
            </SettingsField>

        </>
    );
};

export default SearchBox;
