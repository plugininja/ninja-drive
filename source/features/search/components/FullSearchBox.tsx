import Result from "~/shared/search/components/SearchBox/Result";
import useOutsideClick from "~kernel/hooks/useOutsideClick";
import { BlockStack, InlineStack } from "~/ui/molecules";
import { useRef, useState } from "@wordpress/element";
import SearchFilters from "./SearchFilters";
import { IconButton } from "~/ui/molecules";
import { Input, Icon } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type FullSearchBoxProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    types: SearchType[];
    scope: SearchScope;
    location: SearchLocation;
    onTypesChange: (types: SearchType[]) => void;
    onScopeChange: (scope: SearchScope) => void;
    onLocationChange: (location: SearchLocation) => void;
    placeholder?: string;
    results?: any[];
    total_count?: number;
    loading?: boolean;
    onOpenFolder?: (file_key: string) => void;
    onSetCompact?: (compact: boolean) => void;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
};

const FullSearchBox = ({
    searchTerm,
    onSearchTermChange,
    types,
    scope,
    location,
    onTypesChange,
    onScopeChange,
    onLocationChange,
    placeholder = __("Search My Drive", "ninja-drive"),
    results,
    total_count,
    loading,
    onOpenFolder,
    onSetCompact,
    id,
    style,
    className,
}: FullSearchBoxProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useOutsideClick({
        ref: wrapperRef,
        handler: () => setOpen(false),
        enabled: open,
    });

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
                        value={searchTerm}
                        onChange={(value) =>
                            onSearchTermChange(value as string)
                        }
                    />

                    {searchTerm && searchTerm.length > 0 && (
                        <IconButton
                            size="supersmall"
                            rounded="full"
                            name="close"
                            onClick={() => onSearchTermChange("")}
                        />
                    )}

                    <Icon name="search" fontSize="xl" />
                </InlineStack>

                <BlockStack className="pn-search-box__dropdown">
                    <SearchFilters
                        types={types}
                        scope={scope}
                        location={location}
                        onTypesChange={onTypesChange}
                        onScopeChange={onScopeChange}
                        onLocationChange={onLocationChange}
                    />

                    <Result
                        files={results}
                        total_count={total_count}
                        loading={loading}
                        openFolder={onOpenFolder}
                        setIsCompact={onSetCompact}
                        highlightQuery={searchTerm}
                    />
                </BlockStack>
            </BlockStack>
        </BlockStack>
    );
};

export default FullSearchBox;
