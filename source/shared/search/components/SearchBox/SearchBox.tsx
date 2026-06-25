import SuperCompactSearchBox from "~features/search/components/SuperCompactSearchBox";
import CompactSearchBox from "~features/search/components/CompactSearchBox";
import FullSearchBox from "~features/search/components/FullSearchBox";
import { TQueryArgs } from "~features/file-browser/hooks/useFiles";
import { SearchBoxProps } from "./SearchBox.type";
import { File } from "~/features/file-browser";
import { useState } from "@wordpress/element";
import {
    SearchType,
    SearchLocation,
} from "~features/search/config/searchOptions";

const SearchBox = ({
    id,
    style,
    className,
    isCompact = false,
    isSuperCompact = false,
    fullWidth,
    setIsCompact,
    placeholder,
    activeFolder,
    fileType = true,
    queryArgs,
    setQueryArgs,
    resultProps,
}: SearchBoxProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchLocation, setSearchLocation] =
        useState<SearchLocation>("cache");

    const handleSearchTermChange = (term: string) => {
        setSearchTerm(term);
        setQueryArgs((prev: TQueryArgs) => ({
            ...prev,
            search: term,
            page: 1,
            search_location: searchLocation,
        }));
    };

    const handleTypesChange = (types: SearchType[]) => {
        setQueryArgs((prev: TQueryArgs) => ({
            ...prev,
            types: types as TQueryArgs["types"],
        }));
    };

    const handleScopeChange = (scope: string) => {
        const apiScope = scope === "current_folder" ? "folder" : "global";
        setQueryArgs((prev: TQueryArgs) => ({
            ...prev,
            search_scope: apiScope as TQueryArgs["search_scope"],
        }));
    };

    const handleLocationChange = (location: SearchLocation) => {
        setSearchLocation(location);
        setQueryArgs((prev: TQueryArgs) => ({
            ...prev,
            search_location: location,
        }));
    };

    const effectiveTerm = searchTerm || queryArgs.search || "";

    const sharedProps = {
        searchTerm: effectiveTerm,
        onSearchTermChange: handleSearchTermChange,
        types: queryArgs.types as SearchType[],
        scope: (queryArgs.search_scope === "folder"
            ? "current_folder"
            : "entire_drive") as any,
        location: searchLocation as SearchLocation,
        onTypesChange: handleTypesChange,
        onScopeChange: handleScopeChange,
        onLocationChange: handleLocationChange,
        placeholder,
        fileType,
        onSetCompact: setIsCompact,
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
            results={resultProps?.files as File[]}
            total_count={resultProps?.total_count}
            loading={resultProps?.loading}
            onOpenFolder={resultProps?.openFolder}
        />
    );
};

export default SearchBox;
