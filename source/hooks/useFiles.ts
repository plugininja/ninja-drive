import { useEffect, useRef, useState } from "@wordpress/element";
import { useGetFilesQuery } from "~/store/api/fileApi";
import { useLocalStorage } from "./useLocalStorage";
import { FileTypes } from "~/types/file.types";
import { Order, OrderBy } from "~/types/Types";

export type TQueryArgs = {
    active_folder: string;
    page: number;
    per_page: number;
    order: Order;
    order_by: OrderBy;
    search?: string | null;
    search_scope: "folder" | "global";
    search_location: "server" | "cache";
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
        active_folder: savedFolder,
        page: 1,
        per_page: PER_PAGE_LIMIT,
        order: "ASC",
        order_by: "name",
        search: null,
        search_scope: "folder",
        search_location: "cache",
        types: defaultTypes,
    });

    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isFetchingNextPage = useRef(false);

    const { data, isFetching, isLoading, isError } = useGetFilesQuery(
        {
            file_key: queryArgs.active_folder,
            page: queryArgs.page,
            per_page: queryArgs.per_page,
            order_by: queryArgs.order_by,
            order: queryArgs.order,
            from: queryArgs.search_location,
            search: queryArgs.search ?? "",
            types: queryArgs.types.join(","),
        },
        { skip },
    );

    const files = data?.data?.files ?? [];
    const has_more = data?.data?.has_more ?? false;
    const breadcrumbs = data?.data?.breadcrumbs ?? [];
    const total_count = data?.data?.total_files ?? 0;

    useEffect(() => {
        if (!isFetching && queryArgs.search_location === "server") {
            setQueryArgs((prev) => ({
                ...prev,
                search_location: "cache",
            }));
        }
    }, [isFetching, queryArgs.search_location]);

    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target || skip) return;

        observerRef.current?.disconnect();

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    has_more &&
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
    }, [has_more, isFetching, skip]);

    useEffect(() => {
        if (!isFetching) {
            isFetchingNextPage.current = false;
        }
    }, [isFetching]);

    const openFolder = (file_key: string) => {
        if (file_key === queryArgs.active_folder) return;

        setQueryArgs((prev) => ({
            ...prev,
            active_folder: file_key,
            page: 1,
        }));
    };

    const refresh = () => {
        setQueryArgs((prev) => ({
            ...prev,
            page: 1,
            search_location: "server",
        }));
    };

    const suggestedFilesList = files?.filter(
        (file) => suggestedFiles?.includes(file?.file_key),
    );

    const addSuggestedFile = (file_key: string) => {
        const alreadySuggested = suggestedFiles?.includes(file_key);

        if (!alreadySuggested) {
            setSuggestedFiles?.([file_key, ...(suggestedFiles || [])]);
        }
    };

    const removeSuggestedFile = (file_key: string) => {
        const updatedSuggestedFiles = suggestedFiles?.filter(
            (key) => key !== file_key,
        );

        setSuggestedFiles?.(updatedSuggestedFiles);
    };

    const showScrollFade = has_more && files.length > 0;

    return {
        files,
        breadcrumbs,
        total_count,

        loading: (isLoading || isFetching) && queryArgs.page === 1,
        loadingMore: (isLoading || isFetching) && queryArgs.page > 1,
        isError,

        queryArgs,
        setQueryArgs,

        openFolder,
        refresh,

        loadMoreRef,
        has_more,
        showScrollFade,

        suggestedFiles: suggestedFilesList,
        addSuggestedFile,
        removeSuggestedFile,
    };
};
