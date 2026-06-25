import { useSearch, UseSearchConfig } from "../hooks/useSearch";
import SuperCompactSearchBox from "./SuperCompactSearchBox";
import CompactSearchBox from "./CompactSearchBox";
import FullSearchBox from "./FullSearchBox";
import {
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type SearchBoxWithHookProps = UseSearchConfig & {
    isCompact?: boolean;
    isSuperCompact?: boolean;
    fullWidth?: boolean;
    placeholder?: string;
    fileType?: boolean;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    onOpenFolder?: (file_key: string) => void;
    onSetCompact?: (compact: boolean) => void;
    onExpandSearch?: (params: {
        search: string;
        types: SearchType[];
        scope?: SearchScope;
        location?: SearchLocation;
    }) => void;
};

const SearchBoxWithHook = ({
    folder_id,
    debounceMs,
    defaultTypes,
    defaultScope,
    defaultLocation,
    skip,
    isCompact = false,
    isSuperCompact = false,
    fullWidth,
    placeholder,
    fileType = true,
    onOpenFolder,
    onSetCompact,
    onExpandSearch,
    id,
    style,
    className,
}: SearchBoxWithHookProps) => {
    const {
        results,
        total_count,
        loading,
        searchTerm,
        scope,
        location,
        types,
        setSearchTerm,
        setTypes,
        setScope,
        setLocation,
    } = useSearch({
        folder_id,
        debounceMs,
        defaultTypes,
        defaultScope,
        defaultLocation,
        skip,
    });

    const handleSetCompact = (compact: boolean) => {
        if (compact && onExpandSearch) {
            onExpandSearch({
                search: searchTerm,
                types,
                scope,
                location,
            });
        }
        onSetCompact?.(compact);
    };

    const sharedProps = {
        searchTerm,
        onSearchTermChange: setSearchTerm,
        types,
        scope,
        location,
        onTypesChange: setTypes,
        onScopeChange: setScope,
        onLocationChange: setLocation,
        placeholder,
        fileType,
        id,
        style,
        className,
    };

    if (isSuperCompact) {
        return <SuperCompactSearchBox {...sharedProps} />;
    }

    if (isCompact) {
        return <CompactSearchBox {...sharedProps} fullWidth={fullWidth} />;
    }

    return (
        <FullSearchBox
            {...sharedProps}
            results={results}
            total_count={total_count}
            loading={loading}
            onOpenFolder={onOpenFolder}
            onSetCompact={handleSetCompact}
        />
    );
};

export default SearchBoxWithHook;
