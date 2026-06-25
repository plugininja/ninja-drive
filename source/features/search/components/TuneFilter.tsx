import { SelectBox, Dropdown, Card } from "~/ui/molecules";
import { Text, Icon } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import {
    TYPE_OPTIONS,
    LOCATION_OPTIONS,
    SCOPE_OPTIONS,
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type TuneFilterProps = {
    fileType?: boolean;
    types: SearchType[];
    scope: SearchScope;
    location: SearchLocation;
    onTypesChange: (types: SearchType[]) => void;
    onScopeChange: (scope: SearchScope) => void;
    onLocationChange: (location: SearchLocation) => void;
};

const TuneFilter = ({
    fileType = true,
    types,
    scope,
    location,
    onTypesChange,
    onScopeChange,
    onLocationChange,
}: TuneFilterProps) => {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <Icon name="tune" fontSize="xl" />
            </Dropdown.Trigger>

            <Dropdown.Content
                position={{ top: "160%", left: "auto", right: "-12px" }}
                style={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    minWidth: "200px",
                }}
            >
                {fileType && (
                    <>
                        <Text size="sm">{__("File Type", "ninja-drive")}</Text>

                        <SelectBox
                            size="extrasmall"
                            multiple
                            style={{ minWidth: "170px" }}
                            options={TYPE_OPTIONS}
                            value={types}
                            onChange={(value) => {
                                if (value.length === 0) {
                                    onTypesChange(["all"]);
                                    return;
                                }

                                const filteredValue = value.filter(
                                    (key) => key !== "all",
                                );

                                onTypesChange(
                                    filteredValue.length === 0
                                        ? ["all"]
                                        : (filteredValue as SearchType[]),
                                );
                            }}
                        />
                    </>
                )}

                <Text size="sm">{__("Search Location", "ninja-drive")}</Text>

                <Card
                    padding={5}
                    background="primary-extralight"
                    flex
                    align="center"
                    gap={5}
                    rounded="sm"
                >
                    {LOCATION_OPTIONS.map((option) => (
                        <Card
                            key={option.value}
                            padding={6}
                            rounded="sm"
                            flex
                            align="center"
                            blockAlign="center"
                            background={
                                location === option.value ? "primary" : "white"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                                onLocationChange(option.value as SearchLocation)
                            }
                        >
                            <Text
                                color={
                                    location === option.value
                                        ? "white"
                                        : "black"
                                }
                                size="xs"
                            >
                                {option.name}
                            </Text>
                        </Card>
                    ))}
                </Card>

                <Text size="sm">{__("Search Scope", "ninja-drive")}</Text>

                <Card
                    padding={5}
                    background="primary-extralight"
                    flex
                    align="center"
                    gap={5}
                    rounded="sm"
                >
                    {SCOPE_OPTIONS.map((option) => (
                        <Card
                            key={option.value}
                            padding={6}
                            rounded="sm"
                            flex
                            align="center"
                            blockAlign="center"
                            background={
                                scope === option.value ? "primary" : "white"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                                onScopeChange(option.value as SearchScope)
                            }
                        >
                            <Text
                                color={
                                    scope === option.value ? "white" : "black"
                                }
                                size="xs"
                            >
                                {option.name}
                            </Text>
                        </Card>
                    ))}
                </Card>
            </Dropdown.Content>
        </Dropdown>
    );
};

export default TuneFilter;
