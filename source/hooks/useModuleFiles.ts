import { useEffect, useRef, useState } from "@wordpress/element";
import { useGetModuleFilesQuery } from "~/store/api/widgetApi";
import { ModuleConfig, QueryArgs } from "~/types/widget.types";
import { useAppDispatch } from "~/store/hooks";
import { FileTypes } from "~/types/file.types";

const PER_PAGE_LIMIT = 25;

export const useModuleFiles = (
    data: ModuleConfig,
    savedFolder?: string,
    types?: FileTypes[],
    isPagination: boolean = false,
) => {
    const [isFirstCall, setIsFirstCall] = useState(true);
    const { advanced } = data?.data;
    const {
        files: { perPage } = { perPage: 20 },
        sort: { order, orderBy },
    } = advanced || {};
    const dispatch = useAppDispatch();

    const [queryArgs, setQueryArgs] = useState<QueryArgs>({
        activeFolder: savedFolder ?? "",
        page: 1,
        perPage: perPage ?? PER_PAGE_LIMIT,
        order: order ?? "ASC",
        orderBy: orderBy ?? "name",
        search: null,
        searchScope: "global",
        types: types ?? ["all"],
        autoFetch: false,
        searchLocation: "cache",
    });

    const [forceServer, setForceServer] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const {
        files: { loadingType } = { loadingType: "infinite_scroll" },
        autoFetch,
    } = data.data.advanced;

    const {
        data: widgetData,
        isFetching,
        isLoading,
        isError,
    } = useGetModuleFilesQuery(
        {
            id: data.id,
            fileKey:
                queryArgs.searchScope === "folder"
                    ? queryArgs.activeFolder
                    : "/",
            page: queryArgs.page,
            perPage: queryArgs.perPage,
            orderBy: queryArgs.orderBy,
            order: queryArgs.order,
            from:
                forceServer || queryArgs.searchLocation === "server"
                    ? "server"
                    : "cache",
            search: queryArgs.search,
            searchScope: queryArgs.searchScope,
            isPagination: isPagination || loadingType === "pagination",
            types: queryArgs.types,
            isFirstCall,
        },
        { skip: !data.id, refetchOnFocus: true },
    );

    const files = widgetData?.data?.widget?.data?.source?.files ?? [];
    const hasMore = widgetData?.data?.widget?.data?.source?.hasMore ?? false;
    let breadcrumbs =
        widgetData?.data?.widget?.data?.source?.breadcrumbs ?? [];

    breadcrumbs =
        breadcrumbs.length > 0
            ? breadcrumbs
            : [{ fileKey: "/", name: "Home" }, ...breadcrumbs];

    const totalPages =
        widgetData?.data?.widget?.data?.source?.totalPages ?? 0;

    useEffect(() => {
        if (!isFetching && forceServer) {
            setForceServer(false);
        }
    }, [isFetching, forceServer]);

    useEffect(() => {
        if (!isFetching && !isLoading && queryArgs.autoFetch) {
            setQueryArgs((prev) => ({ ...prev, autoFetch: false }));
        }
    }, [files]);

    useEffect(() => {
        setIsFirstCall(false);
        if (!loadMoreRef.current) return;

        if (observer.current) {
            observer.current.disconnect();
        }

        const el = loadMoreRef.current;

        observer.current = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasMore && !isFetching) {
                setQueryArgs((prev) => ({ ...prev, page: prev.page + 1 }));
            }
        });

        observer.current.observe(el);

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [queryArgs.activeFolder, hasMore, isFetching]);

    const openFolder = (
        key: string,
        searchScope: "folder" | "global" = "folder",
        search: string = "",
    ) => {
        setQueryArgs((prev) => ({
            ...prev,
            activeFolder: key,
            page: 1,
            search,
            searchScope,
        }));
    };

    const loadMore = (page?: number) => {
        if (typeof page === "number") {
            setQueryArgs((prev) => ({ ...prev, page }));
        } else {
            setQueryArgs((prev) => ({ ...prev, page: prev.page + 1 }));
        }
    };

    const refresh = async (autoFetch = false) => {
        setQueryArgs((prev) => ({ ...prev, page: 1, autoFetch }));
        setForceServer(true);
    };

    return {
        files,
        breadcrumbs,
        loading: (isLoading || isFetching) && queryArgs.page === 1,
        loadingMore:
            (isFetching || isLoading) &&
            queryArgs.page > 1 &&
            loadingType !== "pagination",
        totalPages,
        queryArgs,
        setQueryArgs,
        openFolder,
        loadMoreRef,
        hasMore,
        loadMore,
        refresh,
        isError,
    };
};
