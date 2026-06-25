import { IconButton, InlineStack } from "~/ui/molecules";
import { useState } from "@wordpress/element";
import { Input, Icon } from "~/ui/atoms";
import TuneFilter from "./TuneFilter";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type SuperCompactSearchBoxProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    types: SearchType[];
    scope: SearchScope;
    location: SearchLocation;
    onTypesChange: (types: SearchType[]) => void;
    onScopeChange: (scope: SearchScope) => void;
    onLocationChange: (location: SearchLocation) => void;
    placeholder?: string;
    fileType?: boolean;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
};

const SuperCompactSearchBox = ({
    searchTerm,
    onSearchTermChange,
    types,
    scope,
    location,
    onTypesChange,
    onScopeChange,
    onLocationChange,
    placeholder = __("Search My Drive", "ninja-drive"),
    fileType = true,
    id,
    style,
    className,
}: SuperCompactSearchBoxProps) => {
    const [isFocused, setIsFocused] = useState(false);

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
                    value={searchTerm}
                    onChange={(value) => onSearchTermChange(value as string)}
                />

                {searchTerm && searchTerm.length > 0 && (
                    <IconButton
                        size="supersmall"
                        rounded="full"
                        name="close"
                        className="pn-super-compact-search-box__clear"
                        onClick={() => onSearchTermChange("")}
                    />
                )}

                <div>
                    <TuneFilter
                        fileType={fileType}
                        types={types}
                        scope={scope}
                        location={location}
                        onTypesChange={onTypesChange}
                        onScopeChange={onScopeChange}
                        onLocationChange={onLocationChange}
                    />
                </div>
            </InlineStack>
        </div>
    );
};

export default SuperCompactSearchBox;
