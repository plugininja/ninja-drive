import { File } from "~features/file-browser/types/file.types";
import { ServerResponse } from "~kernel/types/Types";
import { baseApi } from "~kernel/store/baseApi";
import {
    SCOPE_TO_API,
    SearchLocation,
    SearchScope,
    SearchType,
} from "../config/searchOptions";

type TSearchRequest = {
    query: string;
    folder_id?: string;
    types?: SearchType[];
    scope?: SearchScope;
    from?: SearchLocation;
    page?: number;
    per_page?: number;
    order_by?: string;
    order?: string;
};

type TSearchResponseData = {
    files: File[];
    current_page: number;
    has_more: boolean;
    total_pages: number;
    total_files?: number;
};

type TSearchResponse = ServerResponse<TSearchResponseData>;

export const searchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        search: builder.query<TSearchResponse, TSearchRequest>({
            query: ({
                query,
                folder_id,
                types,
                scope,
                from,
                page,
                per_page,
                order_by,
                order,
            }) => {
                const params: Record<string, string | undefined> = {
                    search: query,
                    ...(folder_id ? { file_key: folder_id } : {}),
                    ...(types && types.length > 0 && !types.includes("all")
                        ? { types: types.join(",") }
                        : {}),
                    scope: scope ? SCOPE_TO_API[scope] : undefined,
                    from: from ?? "cache",
                    page: String(page ?? 1),
                    per_page: String(per_page ?? 20),
                    ...(order_by ? { order_by } : {}),
                    ...(order ? { order } : {}),
                };

                const fileKey = folder_id || "my-drive";

                return {
                    url: `folder/${fileKey}`,
                    params,
                };
            },

            serializeQueryArgs: ({ queryArgs }) => {
                const { query, folder_id, types, scope, from } = queryArgs;
                const typesKey =
                    types
                        ?.filter((t) => t !== "all")
                        .sort()
                        .join(",") || "all";
                return `search-${query}-${folder_id || "root"}-${typesKey}-${
                    scope || "current_folder"
                }-${from || "cache"}`;
            },

            merge: (currentCache, newResponse, { arg }) => {
                if (!currentCache.data) return newResponse;
                if (!newResponse.data) return currentCache;

                if (arg.page === 1 || !arg.page) {
                    currentCache.data.files = newResponse.data.files;
                } else {
                    currentCache.data.files.push(...newResponse.data.files);
                }

                currentCache.data.has_more = newResponse.data.has_more;
                currentCache.data.total_files = newResponse.data.total_files;
                currentCache.data.total_pages = newResponse.data.total_pages;
                currentCache.data.current_page = newResponse.data.current_page;
            },

            forceRefetch: ({ currentArg, previousArg }) => {
                if (!previousArg || !currentArg) return true;
                return (
                    currentArg.query !== previousArg.query ||
                    currentArg.folder_id !== previousArg.folder_id ||
                    currentArg.page !== previousArg.page ||
                    currentArg.from !== previousArg.from ||
                    currentArg.scope !== previousArg.scope ||
                    JSON.stringify(currentArg.types?.sort()) !==
                        JSON.stringify(previousArg.types?.sort())
                );
            },

            providesTags: (_res, _err, { folder_id }) => [
                { type: "Folder" as const, id: folder_id || "search" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const { useSearchQuery, useLazySearchQuery } = searchApi;
