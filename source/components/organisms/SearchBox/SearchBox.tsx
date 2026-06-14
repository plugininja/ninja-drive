import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import SelectBox from "~/components/molecules/SelectBox";
import Dropdown from "~/components/molecules/Dropdown";
import useOutsideClick from "~/hooks/useOutsideClick";
import { useRef, useState } from "@wordpress/element";
import Divider from "~/components/atoms/Divider";
import Card from "~/components/molecules/Card";
import useDebounce from "~/hooks/useDebounce";
import { TQueryArgs } from "~/hooks/useFiles";
import Input from "~/components/atoms/Input";
import Text from "~/components/atoms/Text";
import Icon from "~/components/atoms/Icon";
import { __ } from "@wordpress/i18n";
import Result from "./Result";
import clsx from "clsx";
import {
    SearchBoxFilterProps,
    SearchBoxProps,
    SearchType,
} from "./SearchBox.type";

const SearchBox = ({
    id,
    style,
    className,
    isCompact = false,
    isSuperCompact = false,
    fullWidth,
    setIsCompact,
    placeholder = __("Search My Drive", "ninja-drive"),
    activeFolder,
    fileType = true,
    queryArgs,
    setQueryArgs,
    resultProps,
}: SearchBoxProps) => {
    const [searchTerm, setSearchTerm] = useState<string | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [search_location, setSearchLocation] =
        useState<TQueryArgs["search_location"]>("cache");
    const [isFocused, setIsFocused] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useDebounce(
        () => {
            if (searchTerm !== null) {
                setQueryArgs((prev) => ({
                    ...prev,
                    search: searchTerm,
                    activeFolder,
                    page: 1,
                    search_location,
                }));
            }
        },
        [searchTerm, activeFolder, search_location],
        800,
    );

    useOutsideClick({
        ref: wrapperRef,
        handler: () => setOpen(false),
        enabled: open,
    });

    if (isSuperCompact) {
        return (
            <div
                onMouseEnter={() => setIsFocused(true)}
                onMouseLeave={() => {
                    if (!searchTerm) {
                        setIsFocused(false);
                    }
                }}
            >
                <InlineStack
                    id={id}
                    wrap={false}
                    style={style}
                    className={clsx(
                        "pn-super-compact-search-box",
                        isFocused && "pn-super-compact-search-box--focused",
                        className,
                        "bg-white",
                    )}
                >
                    <Icon name="search" fontSize="xl" />

                    <Input
                        size="small"
                        borderStyle="none"
                        placeholder={placeholder}
                        className="pn-super-compact-search-box__input"
                        value={searchTerm || ""}
                        onChange={(value) => setSearchTerm(value as string)}
                    />

                    {searchTerm && searchTerm.length > 0 && (
                        <IconButton
                            size="supersmall"
                            rounded="full"
                            name="close"
                            className="pn-super-compact-search-box__clear"
                            onClick={() => setSearchTerm("")}
                        />
                    )}

                    <div>
                        <SearchBox.TuneFilter
                            fileType={fileType}
                            queryArgs={queryArgs}
                            setQueryArgs={setQueryArgs}
                            search_location={search_location}
                            setSearchLocation={setSearchLocation}
                        />
                    </div>
                </InlineStack>
            </div>
        );
    }

    if (isCompact) {
        return (
            <InlineStack
                id={id}
                wrap={false}
                style={style}
                className={clsx(
                    "pn-compact-search-box",
                    fullWidth && "pn-compact-search-box--full-width",
                    className,
                    "bg-white",
                )}
            >
                <Icon name="search" fontSize="xl" />

                <Input
                    size="small"
                    borderStyle="none"
                    placeholder={placeholder}
                    className="pn-compact-search-box__input"
                    value={searchTerm || ""}
                    onChange={(value) => setSearchTerm(value as string)}
                />

                {searchTerm && searchTerm.length > 0 && (
                    <IconButton
                        size="supersmall"
                        rounded="full"
                        name="close"
                        className="pn-compact-search-box__clear"
                        onClick={() => setSearchTerm("")}
                    />
                )}

                <SearchBox.TuneFilter
                    fileType={fileType}
                    queryArgs={queryArgs}
                    setQueryArgs={setQueryArgs}
                    search_location={search_location}
                    setSearchLocation={setSearchLocation}
                />
            </InlineStack>
        );
    }

    return (
        <BlockStack
            id={id}
            style={style}
            ref={wrapperRef}
            className={clsx("pn-search-box-wrapper", className)}
            onClick={() => setOpen(true)}
        >
            <BlockStack
                className={clsx("pn-search-box", open && "pn-search-box--open")}
            >
                <InlineStack
                    align="between"
                    className={clsx("pn-search-box__input")}
                >
                    <Input
                        size="small"
                        borderStyle="none"
                        inputStyle={{ padding: 0 }}
                        className="flex-1"
                        placeholder={placeholder}
                        value={searchTerm || ""}
                        onChange={(value) => setSearchTerm(value as string)}
                    />

                    {searchTerm && searchTerm.length > 0 && (
                        <IconButton
                            size="supersmall"
                            rounded="full"
                            name="close"
                            onClick={() => setSearchTerm("")}
                        />
                    )}

                    <Icon name="search" fontSize="xl" />
                </InlineStack>

                <BlockStack className="pn-search-box__dropdown">
                    <SearchBox.Filter
                        queryArgs={queryArgs}
                        setQueryArgs={setQueryArgs}
                        search_location={search_location}
                        setSearchLocation={setSearchLocation}
                    />

                    <Result
                        {...resultProps}
                        queryArgs={queryArgs}
                        setIsCompact={setIsCompact}
                    />
                </BlockStack>
            </BlockStack>
        </BlockStack>
    );
};

SearchBox.Filter = ({
    queryArgs,
    setQueryArgs,
    search_location,
    setSearchLocation,
}: SearchBoxFilterProps) => {
    return (
        <InlineStack
            padding="0 10px"
            gap={10}
            style={{
                marginTop: 3,
            }}
            className="pn-search-box__filter"
        >
            <SelectBox
                size="extrasmall"
                multiple
                style={{
                    minWidth: "170px",
                }}
                options={TYPE_OPTIONS}
                value={queryArgs?.types}
                onChange={(value) => {
                    if (value.length === 0) {
                        setQueryArgs((prev) => ({
                            ...prev,
                            types: ["all"],
                        }));
                        return;
                    }

                    let filteredValue = value.filter((key) => key !== "all");

                    if (filteredValue.length === 0) {
                        filteredValue = ["all"];
                    }

                    setQueryArgs((prev) => {
                        return {
                            ...prev,
                            types: filteredValue as TQueryArgs["types"],
                        };
                    });
                }}
            />

            <SelectBox
                size="extrasmall"
                style={{
                    minWidth: "100px",
                }}
                options={LOCATION_OPTIONS}
                value={[search_location]}
                onChange={(value) =>
                    setSearchLocation(value[0] as TQueryArgs["search_location"])
                }
            />

            <SelectBox
                size="extrasmall"
                style={{
                    minWidth: "100px",
                }}
                options={SCOPE_OPTIONS}
                value={[queryArgs.search_scope]}
                onChange={(value) =>
                    setQueryArgs((prev) => ({
                        ...prev,
                        search_scope: value[0] as TQueryArgs["search_scope"],
                    }))
                }
            />

            <Divider />
        </InlineStack>
    );
};

SearchBox.TuneFilter = ({
    fileType = true,
    queryArgs,
    setQueryArgs,
    search_location,
    setSearchLocation,
}: SearchBoxFilterProps) => {
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
                            style={{
                                minWidth: "170px",
                            }}
                            options={TYPE_OPTIONS}
                            value={queryArgs?.types}
                            onChange={(value) => {
                                if (value.length === 0) {
                                    setQueryArgs((prev) => ({
                                        ...prev,
                                        types: ["all"],
                                    }));
                                    return;
                                }

                                let filteredValue = value.filter(
                                    (key) => key !== "all",
                                );

                                if (filteredValue.length === 0) {
                                    filteredValue = ["all"];
                                }

                                setQueryArgs((prev) => {
                                    return {
                                        ...prev,
                                        types: filteredValue as TQueryArgs["types"],
                                    };
                                });
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
                            key={option?.value}
                            padding={6}
                            rounded="sm"
                            flex
                            align="center"
                            blockAlign="center"
                            background={
                                search_location === option?.value
                                    ? "primary"
                                    : "white"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                                setSearchLocation(
                                    option?.value as TQueryArgs["search_location"],
                                )
                            }
                        >
                            <Text
                                color={
                                    search_location === option?.value
                                        ? "white"
                                        : "black"
                                }
                                size="xs"
                            >
                                {option?.name}
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
                            key={option?.value}
                            padding={6}
                            rounded="sm"
                            flex
                            align="center"
                            blockAlign="center"
                            background={
                                queryArgs.search_scope === option?.value
                                    ? "primary"
                                    : "white"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                                setQueryArgs((prev) => ({
                                    ...prev,
                                    search_scope: option?.value,
                                }))
                            }
                        >
                            <Text
                                color={
                                    queryArgs.search_scope === option?.value
                                        ? "white"
                                        : "black"
                                }
                                size="xs"
                            >
                                {option?.name}
                            </Text>
                        </Card>
                    ))}
                </Card>
            </Dropdown.Content>
        </Dropdown>
    );
};

export default SearchBox;

const TYPE_OPTIONS: {
    name: string;
    value: SearchType;
}[] = [
    { name: __("All", "ninja-drive"), value: "all" },
    { name: __("Folder", "ninja-drive"), value: "folder" },
    { name: __("Documents", "ninja-drive"), value: "documents" },
    { name: __("Code", "ninja-drive"), value: "code" },
    { name: __("Images", "ninja-drive"), value: "images" },
    {
        name: __("Audio", "ninja-drive"),
        value: "audio",
    },
    {
        name: __("Video", "ninja-drive"),
        value: "video",
    },
    {
        name: __("Archive", "ninja-drive"),
        value: "archive",
    },
    {
        name: __("Binary Executable", "ninja-drive"),
        value: "binary",
    },
];

const LOCATION_OPTIONS: {
    name: string;
    value: "server" | "cache";
}[] = [
    {
        name: __("Server", "ninja-drive"),
        value: "server",
    },
    {
        name: __("Cache", "ninja-drive"),
        value: "cache",
    },
];

const SCOPE_OPTIONS: {
    name: string;
    value: "global" | "folder";
}[] = [
    {
        name: __("Global", "ninja-drive"),
        value: "global",
    },
    {
        name: __("Current", "ninja-drive"),
        value: "folder",
    },
];
