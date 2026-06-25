import { useGetModuleFilesQuery } from "~features/widget-builder/api/widgetApi";
import { FileTypes } from "~features/file-browser/types/file.types";
import { useEffect, useRef, useState } from "@wordpress/element";
import { useAppDispatch } from "~kernel/store/hooks";
import {
    ModuleConfig,
    QueryArgs,
} from "~features/widget-builder/types/widget.types";

const PER_PAGE_LIMIT = 25;

export const useModuleFiles = (
    data: ModuleConfig,
    savedFolder?: string,
    types?: FileTypes[],
    isPagination: boolean = false,
) => {
    const [isFirstCall, setIsFirstCall] = useState(true);
    const { style } = data?.data;
    const { files: { per_page } = { per_page: 20 } } = style || {};
    const {
        sort: { order, order_by },
    } = data?.data?.configuration?.advanced || {};
    const dispatch = useAppDispatch();

    const [queryArgs, setQueryArgs] = useState<QueryArgs>({
        active_folder: savedFolder ?? "/",
        page: 1,
        per_page: per_page ?? PER_PAGE_LIMIT,
        order: order ?? "ASC",
        order_by: order_by ?? "name",
        search: null,
        search_scope: "global",
        types: types ?? ["all"],
        auto_fetch: false,
        search_location: "cache",
    });

    const [forceServer, setForceServer] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { files: { loading_type } = { loading_type: "infinite_scroll" } } =
        data?.data?.style || {};

    const { auto_fetch } = data?.data?.configuration?.advanced || {};

    const {
        data: widgetData,
        isFetching,
        isLoading,
        isError,
    } = useGetModuleFilesQuery(
        {
            id: data.id,
            file_key:
                queryArgs.search_scope === "folder"
                    ? queryArgs.active_folder
                    : "/",
            page: queryArgs.page,
            per_page: queryArgs.per_page,
            order_by: queryArgs.order_by,
            order: queryArgs.order,
            from:
                forceServer || queryArgs.search_location === "server"
                    ? "server"
                    : "cache",
            search: queryArgs.search,
            search_scope: queryArgs.search_scope,
            is_pagination: isPagination || loading_type === "pagination",
            types: queryArgs.types,
            isFirstCall,
        },
        { skip: !data.id, refetchOnFocus: true },
    );

    const files = widgetData?.data?.widget?.data?.source?.files ?? [];
    const has_more = widgetData?.data?.widget?.data?.source?.has_more ?? false;
    let breadcrumbs = widgetData?.data?.widget?.data?.source?.breadcrumbs ?? [];

    breadcrumbs =
        breadcrumbs.length > 0
            ? breadcrumbs
            : [{ file_key: "/", name: "Home" }, ...breadcrumbs];

    const total_pages =
        widgetData?.data?.widget?.data?.source?.total_pages ?? 0;

    useEffect(() => {
        if (!isFetching && forceServer) {
            setForceServer(false);
        }
    }, [isFetching, forceServer]);

    useEffect(() => {
        if (!isFetching && !isLoading && queryArgs.auto_fetch) {
            setQueryArgs((prev) => ({ ...prev, auto_fetch: false }));
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
            if (first.isIntersecting && has_more && !isFetching) {
                setQueryArgs((prev) => ({ ...prev, page: prev.page + 1 }));
            }
        });

        observer.current.observe(el);

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [queryArgs.active_folder, has_more, isFetching]);

    const openFolder = (
        key: string,
        search_scope: "folder" | "global" = "folder",
        search: string = "",
    ) => {
        setQueryArgs((prev) => ({
            ...prev,
            active_folder: key,
            page: 1,
            search,
            search_scope,
        }));
    };

    const loadMore = (page?: number) => {
        if (typeof page === "number") {
            setQueryArgs((prev) => ({ ...prev, page }));
        } else {
            setQueryArgs((prev) => ({ ...prev, page: prev.page + 1 }));
        }
    };

    const refresh = async (auto_fetch = false) => {
        setQueryArgs((prev) => ({ ...prev, page: 1, auto_fetch }));
        setForceServer(true);
    };

    return {
        files,
        breadcrumbs,
        loading: (isLoading || isFetching) && queryArgs.page === 1,
        loadingMore:
            (isFetching || isLoading) &&
            queryArgs.page > 1 &&
            loading_type !== "pagination",
        total_pages,
        queryArgs,
        setQueryArgs,
        openFolder,
        loadMoreRef,
        has_more,
        loadMore,
        refresh,
        isError,
    };
};
