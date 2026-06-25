import { useState, useCallback, useRef, useEffect } from "@wordpress/element";
import { File } from "~features/file-browser/types/file.types";
import useDebounce from "~kernel/hooks/useDebounce";
import { useSearchQuery } from "../api/searchApi";
import {
    SearchScope,
    SearchLocation,
    SearchType,
    DEFAULT_DEBOUNCE_MS,
    MIN_QUERY_LENGTH,
} from "../config/searchOptions";

export type UseSearchConfig = {
    folder_id?: string;
    debounceMs?: number;
    defaultTypes?: SearchType[];
    defaultScope?: SearchScope;
    defaultLocation?: SearchLocation;
    skip?: boolean;
};

type UseSearchReturn = {
    results: File[];
    total_count: number;
    loading: boolean;
    has_more: boolean;
    current_page: number;
    total_pages: number;
    searchTerm: string;
    scope: SearchScope;
    location: SearchLocation;
    types: SearchType[];
    setSearchTerm: (term: string) => void;
    setTypes: (types: SearchType[]) => void;
    setScope: (scope: SearchScope) => void;
    setLocation: (location: SearchLocation) => void;
    loadMore: () => void;
    clearSearch: () => void;
    refresh: () => void;
    hasSearch: boolean;
    isSearchValid: boolean;
};

export function useSearch({
    folder_id,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    defaultTypes = ["all"],
    defaultScope = "current_folder",
    defaultLocation = "cache",
    skip = false,
}: UseSearchConfig = {}): UseSearchReturn {
    const [inputTerm, setInputTerm] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const [types, setTypes] = useState<SearchType[]>(defaultTypes);
    const [scope, setScope] = useState<SearchScope>(defaultScope);
    const [location, setLocation] = useState<SearchLocation>(defaultLocation);
    const [page, setPage] = useState(1);

    const prevFolderRef = useRef(folder_id);

    useEffect(() => {
        if (prevFolderRef.current !== folder_id) {
            prevFolderRef.current = folder_id;
            setPage(1);
        }
    }, [folder_id]);

    useDebounce(
        () => {
            setDebouncedQuery(inputTerm);
            setPage(1);
        },
        [inputTerm],
        debounceMs,
    );

    const hasSearch = debouncedQuery.length > 0;
    const isSearchValid = debouncedQuery.length >= MIN_QUERY_LENGTH;
    const shouldSkip = skip || !hasSearch || !isSearchValid;

    const { data, isFetching } = useSearchQuery(
        {
            query: debouncedQuery,
            folder_id,
            types,
            scope,
            from: location,
            page,
        },
        { skip: shouldSkip },
    );

    // useEffect(() => {
    //     if (!isFetching && location === "server") {
    //         setLocation("cache");
    //     }
    // }, [isFetching, location]);

    const results = data?.data?.files ?? [];
    const total_count = data?.data?.total_files ?? 0;
    const has_more = data?.data?.has_more ?? false;
    const current_page = data?.data?.current_page ?? 1;
    const total_pages = data?.data?.total_pages ?? 1;

    const setSearchTerm = useCallback((term: string) => {
        setInputTerm(term);
    }, []);

    const loadMore = useCallback(() => {
        if (!has_more || isFetching) return;
        setPage((prev) => prev + 1);
    }, [has_more, isFetching]);

    const clearSearch = useCallback(() => {
        setInputTerm("");
        setDebouncedQuery("");
        setTypes(defaultTypes);
        setScope(defaultScope);
        setLocation(defaultLocation);
        setPage(1);
    }, [defaultTypes, defaultScope, defaultLocation]);

    const refresh = useCallback(() => {
        if (debouncedQuery) {
            setLocation("server");
        }
    }, [debouncedQuery]);

    return {
        results,
        total_count,
        loading: isFetching,
        has_more,
        current_page,
        total_pages,
        searchTerm: inputTerm,
        scope,
        location,
        types,
        setSearchTerm,
        setTypes,
        setScope,
        setLocation,
        loadMore,
        clearSearch,
        refresh,
        hasSearch,
        isSearchValid,
    };
}
