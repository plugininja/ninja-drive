import { useEffect, useRef, useState } from "@wordpress/element";
import { useGetFilesQuery } from "~/store/api/fileApi";
import { useLocalStorage } from "./useLocalStorage";
import { FileTypes } from "~/types/file.types";
import { Order, OrderBy } from "~/types/Types";

export type TQueryArgs = {
    activeFolder: string;
    page: number;
    perPage: number;
    order: Order;
    orderBy: OrderBy;
    search?: string | null;
    searchScope: "folder" | "global";
    searchLocation: "server" | "cache";
    types: FileTypes[];
};

const PER_PAGE_LIMIT = 56;

export const useFiles = (
    savedFolder: string,
    skip = false,
    defaultTypes: FileTypes[] = ["all"],
) => {
    const [suggestedFiles, setSuggestedFiles] = useLocalStorage<string[]>(
        "pnpnd-suggested-files",
        [],
    );
    const [queryArgs, setQueryArgs] = useState<TQueryArgs>({
        activeFolder: savedFolder,
        page: 1,
        perPage: PER_PAGE_LIMIT,
        order: "ASC",
        orderBy: "name",
        search: null,
        searchScope: "folder",
        searchLocation: "cache",
        types: defaultTypes,
    });

    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isFetchingNextPage = useRef(false);

    const { data, isFetching, isLoading, isError } = useGetFilesQuery(
        {
            fileKey: queryArgs.activeFolder,
            page: queryArgs.page,
            perPage: queryArgs.perPage,
            orderBy: queryArgs.orderBy,
            order: queryArgs.order,
            from: queryArgs.searchLocation,
            search: queryArgs.search ?? "",
            types: queryArgs.types.join(","),
        },
        { skip },
    );

    const files = data?.data?.files ?? [];
    const hasMore = data?.data?.hasMore ?? false;
    const breadcrumbs = data?.data?.breadcrumbs ?? [];
    const totalCount = data?.data?.totalFiles ?? 0;

    useEffect(() => {
        if (!isFetching && queryArgs.searchLocation === "server") {
            setQueryArgs((prev) => ({
                ...prev,
                searchLocation: "cache",
            }));
        }
    }, [isFetching, queryArgs.searchLocation]);

    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target || skip) return;

        observerRef.current?.disconnect();

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    hasMore &&
                    !isFetching &&
                    !isFetchingNextPage.current
                ) {
                    isFetchingNextPage.current = true;
                    setQueryArgs((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                    }));
                }
            },
            {
                rootMargin: "120px",
            },
        );

        observerRef.current.observe(target);

        return () => observerRef.current?.disconnect();
    }, [hasMore, isFetching, skip]);

    useEffect(() => {
        if (!isFetching) {
            isFetchingNextPage.current = false;
        }
    }, [isFetching]);

    const openFolder = (fileKey: string) => {
        if (fileKey === queryArgs.activeFolder) return;

        setQueryArgs((prev) => ({
            ...prev,
            activeFolder: fileKey,
            page: 1,
        }));
    };

    const refresh = () => {
        setQueryArgs((prev) => ({
            ...prev,
            page: 1,
            searchLocation: "server",
        }));
    };

    const suggestedFilesList = files?.filter(
        (file) => suggestedFiles?.includes(file?.fileKey),
    );

    const addSuggestedFile = (fileKey: string) => {
        const alreadySuggested = suggestedFiles?.includes(fileKey);

        if (!alreadySuggested) {
            setSuggestedFiles?.([fileKey, ...(suggestedFiles || [])]);
        }
    };

    const removeSuggestedFile = (fileKey: string) => {
        const updatedSuggestedFiles = suggestedFiles?.filter(
            (key) => key !== fileKey,
        );

        setSuggestedFiles?.(updatedSuggestedFiles);
    };

    const showScrollFade = hasMore && files.length > 0;

    return {
        files,
        breadcrumbs,
        totalCount,

        loading: (isLoading || isFetching) && queryArgs.page === 1,
        loadingMore: (isLoading || isFetching) && queryArgs.page > 1,
        isError,

        queryArgs,
        setQueryArgs,

        openFolder,
        refresh,

        loadMoreRef,
        hasMore,
        showScrollFade,

        suggestedFiles: suggestedFilesList,
        addSuggestedFile,
        removeSuggestedFile,
    };
};
