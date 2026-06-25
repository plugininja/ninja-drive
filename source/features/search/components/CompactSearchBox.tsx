import { IconButton, InlineStack } from "~/ui/molecules";
import { Input, Icon } from "~/ui/atoms";
import TuneFilter from "./TuneFilter";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type CompactSearchBoxProps = {
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
    fullWidth?: boolean;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
};

const CompactSearchBox = ({
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
    fullWidth,
    id,
    style,
    className,
}: CompactSearchBoxProps) => {
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
                value={searchTerm}
                onChange={(value) => onSearchTermChange(value as string)}
            />

            {searchTerm && searchTerm.length > 0 && (
                <IconButton
                    size="supersmall"
                    rounded="full"
                    name="close"
                    className="pn-compact-search-box__clear"
                    onClick={() => onSearchTermChange("")}
                />
            )}

            <TuneFilter
                fileType={fileType}
                types={types}
                scope={scope}
                location={location}
                onTypesChange={onTypesChange}
                onScopeChange={onScopeChange}
                onLocationChange={onLocationChange}
            />
        </InlineStack>
    );
};

export default CompactSearchBox;
