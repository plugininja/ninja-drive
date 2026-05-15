import { Order, OrderBy, ServerResponse } from "../../types/Types";
import { ModuleConfig } from "../../types/widget.types";
import { FileTypes } from "~/types/file.types";
import { baseApi } from "./baseApi";

type GetModulesResponse = {
    widgets: ModuleConfig[];
    totalPages: number;
    page: number;
    hasMore: boolean;
    total: number;
};

type GetModulesRequest = {
    orderBy?: OrderBy;
    order?: Order;
    page?: number;
    perPage?: number;
    search?: string;
    type: string;
    status?: string;
};

export const widgetApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getModules: builder.query<
            ServerResponse<GetModulesResponse>,
            GetModulesRequest
        >({
            query: ({
                orderBy,
                order,
                page,
                perPage,
                search,
                type,
                status,
            }) => ({
                url: "widget",
                params: { orderBy, order, page, perPage, search, type, status },
            }),

            serializeQueryArgs: ({ endpointName }) => endpointName,

            merge: (currentCache, newResponse) => {
                return newResponse;
            },

            forceRefetch: ({ currentArg, previousArg }) => {
                return (
                    currentArg?.page !== previousArg?.page ||
                    currentArg?.perPage !== previousArg?.perPage ||
                    currentArg?.search !== previousArg?.search ||
                    currentArg?.type !== previousArg?.type ||
                    currentArg?.order !== previousArg?.order ||
                    currentArg?.orderBy !== previousArg?.orderBy
                );
            },

            providesTags: (_res, _err) => ["Modules"],
        }),

        getModule: builder.query<
            ServerResponse<{ widget: ModuleConfig }>,
            { id: string; password?: string; isAdmin?: boolean }
        >({
            query: ({ id, password, isAdmin = false }) => ({
                url: `widget/${id}`,
                params: { password: password, isAdmin },
            }),

            serializeQueryArgs: ({ queryArgs }) => queryArgs.id,
            providesTags: (result, error, { id }) => [{ type: "Widget", id }],
        }),

        getModuleFiles: builder.query<
            ServerResponse<{ widget: ModuleConfig }>,
            {
                id: string;
                fileKey?: string;
                page?: number;
                perPage?: number;
                from?: "cache" | "server";
                orderBy?: OrderBy;
                order?: Order;
                password?: string;
                searchScope?: "global" | "folder";
                search?: string | null;
                isPagination?: boolean;
                types?: FileTypes[];
                isFirstCall?: boolean;
                isAdmin?: boolean;
            }
        >({
            async queryFn(args, _api, _extra, fetchWithBQ) {
                const {
                    id,
                    fileKey = "",
                    page = 1,
                    perPage,
                    from,
                    orderBy,
                    order,
                    password,
                    searchScope,
                    search,
                    isFirstCall = false,
                    isAdmin = false,
                } = args;

                if (isFirstCall) {
                    const key = `PNPND_${id}`;
                    const localData: ModuleConfig | undefined = (window as any)[
                        key
                    ];

                    if (localData) {
                        return {
                            data: {
                                message: "success",
                                success: true,
                                data: {
                                    widget: localData,
                                },
                            } as ServerResponse<{ widget: ModuleConfig }>,
                        };
                    }
                }

                const result = await fetchWithBQ({
                    url: `widget/${id}`,
                    params: {
                        fileKey,
                        page,
                        perPage,
                        from,
                        orderBy,
                        order,
                        password,
                        searchScope,
                        search: search || "",
                        types: args.types?.join(",") || "",
                        isAdmin,
                    },
                });

                if (result.error) return { error: result.error };
                return {
                    data: result.data as ServerResponse<{
                        widget: ModuleConfig;
                    }>,
                };
            },

            serializeQueryArgs: ({ queryArgs }) => {
                const { fileKey, id, search } = queryArgs;

                return `${id}-fileKey-${fileKey}-${search}`;
            },

            merge: (currentCache, newResponse, { arg }) => {
                const newSrc = newResponse?.data?.widget.data.source;
                if (!newSrc) return;
                const currentSrc = currentCache?.data?.widget.data.source;
                const isFirstPage = arg.page === 1;

                if (isFirstPage || arg?.isPagination) {
                    currentCache.data = newResponse.data;
                    return;
                }
                if (!currentSrc) {
                    currentCache.data = newResponse.data;
                    return;
                }

                const newFiles = currentSrc?.files ?? [];
                const mergedFiles = [...newFiles, ...newSrc.files];

                if (currentCache.data) {
                    currentCache.data.widget.data.source = {
                        ...currentSrc,
                        files: mergedFiles,
                        currentPage: newSrc.currentPage,
                        hasMore: newSrc.hasMore,
                        totalPages: newSrc.totalPages,
                    };
                } else {
                    currentCache.data = newResponse.data;
                }
            },

            forceRefetch: ({ currentArg, previousArg }) => {
                if (!previousArg) return false;

                if (currentArg?.from === "server") return true;

                return (
                    currentArg?.page !== previousArg.page ||
                    currentArg?.fileKey !== previousArg.fileKey ||
                    currentArg?.order !== previousArg.order ||
                    currentArg?.orderBy !== previousArg.orderBy ||
                    currentArg?.perPage !== previousArg.perPage ||
                    currentArg?.searchScope !== previousArg.searchScope ||
                    currentArg?.from !== previousArg.from ||
                    currentArg?.search !== previousArg.search
                );
            },

            providesTags: (_res, _err, { id }) => [{ type: "Widget", id }],
        }),
        addModule: builder.mutation<
            ServerResponse<{ widget: ModuleConfig }>,
            { data: ModuleConfig }
        >({
            query: ({ data }) => ({
                url: "widget",
                method: "POST",
                body: data,
            }),

            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    dispatch(
                        widgetApi.util.updateQueryData(
                            "getModules",
                            { type: "all" },
                            (draft) => {
                                if (data.data) {
                                    draft.data!.widgets.unshift(
                                        data.data?.widget,
                                    );
                                }
                            },
                        ),
                    );
                } catch (error) {}
            },
            invalidatesTags: (_result, _error) => ["Modules"],
        }),

        updateModule: builder.mutation<
            ServerResponse<{ widget: ModuleConfig }>,
            { id: string; data: ModuleConfig; type: string }
        >({
            query: ({ id, data }) => ({
                url: `widget/${id}`,
                method: "PUT",
                body: data,
            }),
            async onQueryStarted(
                { id, data, type },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    widgetApi.util.updateQueryData(
                        "getModules",
                        { type },
                        (draft) => {
                            if (!draft?.data) return;

                            const index = draft.data.widgets.findIndex(
                                (widget) => widget.id === id,
                            );

                            if (index !== -1 && data) {
                                draft.data.widgets[index] = data;
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("Update failed, rolling back...", error);
                    patchResult.undo(); // rollback on failure
                }
            },

            invalidatesTags: (_result, _error, { id }) => [
                { type: "Widget", id },
            ],
        }),

        duplicateModule: builder.mutation<
            ServerResponse<{ widget: ModuleConfig }>,
            { id: string[] }
        >({
            query: ({ id }) => ({
                url: "widget/duplicate",
                method: "POST",
                body: { ids: id },
            }),

            invalidatesTags: () => ["Modules"],
        }),

        deleteModule: builder.mutation<ServerResponse<null>, { id: string[] }>({
            query: ({ id }) => ({
                url: "widget",
                body: { ids: id },
                method: "DELETE",
            }),
            invalidatesTags: () => ["Modules"],
        }),
    }),
});

export const {
    useGetModulesQuery,
    useGetModuleQuery,
    useLazyGetModuleQuery,
    useGetModuleFilesQuery,
    useAddModuleMutation,
    useUpdateModuleMutation,
    useDuplicateModuleMutation,
    useDeleteModuleMutation,
} = widgetApi;
