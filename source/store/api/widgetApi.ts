import { Order, OrderBy, ServerResponse } from "../../types/Types";
import { ModuleConfig } from "../../types/widget.types";
import { FileTypes } from "~/types/file.types";
import { baseApi } from "./baseApi";

type GetModulesResponse = {
    widgets: ModuleConfig[];
    total_pages: number;
    page: number;
    has_more: boolean;
    total: number;
};

type GetModulesRequest = {
    order_by?: OrderBy;
    order?: Order;
    page?: number;
    per_page?: number;
    search?: string;
    type: string;
    status?: string;
};

type WPPage = {
    id: number;
    title: {
        rendered: string;
    };
};

export const widgetApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getModules: builder.query<
            ServerResponse<GetModulesResponse>,
            GetModulesRequest
        >({
            query: ({
                order_by,
                order,
                page,
                per_page,
                search,
                type,
                status,
            }) => ({
                url: "widget",
                params: {
                    order_by,
                    order,
                    page,
                    per_page,
                    search,
                    type,
                    status,
                },
            }),

            serializeQueryArgs: ({ endpointName }) => endpointName,

            merge: (currentCache, newResponse) => {
                return newResponse;
            },

            forceRefetch: ({ currentArg, previousArg }) => {
                return (
                    currentArg?.page !== previousArg?.page ||
                    currentArg?.per_page !== previousArg?.per_page ||
                    currentArg?.search !== previousArg?.search ||
                    currentArg?.type !== previousArg?.type ||
                    currentArg?.order !== previousArg?.order ||
                    currentArg?.order_by !== previousArg?.order_by
                );
            },

            providesTags: (_res, _err) => ["Modules"],
        }),

        getModule: builder.query<
            ServerResponse<{ widget: ModuleConfig }>,
            { id: string; password?: string; is_admin?: boolean }
        >({
            query: ({ id, password, is_admin = false }) => ({
                url: `widget/${id}`,
                params: { password: password, is_admin },
            }),

            serializeQueryArgs: ({ queryArgs }) => queryArgs.id,
            providesTags: (result, error, { id }) => [{ type: "Widget", id }],
        }),

        getModuleFiles: builder.query<
            ServerResponse<{ widget: ModuleConfig }>,
            {
                id: string;
                file_key?: string;
                page?: number;
                per_page?: number;
                from?: "cache" | "server";
                order_by?: OrderBy;
                order?: Order;
                password?: string;
                search_scope?: "global" | "folder";
                search?: string | null;
                is_pagination?: boolean;
                types?: FileTypes[];
                isFirstCall?: boolean;
                is_admin?: boolean;
            }
        >({
            async queryFn(args, _api, _extra, fetchWithBQ) {
                const {
                    id,
                    file_key = "",
                    page = 1,
                    per_page,
                    from,
                    order_by,
                    order,
                    password,
                    search_scope,
                    search,
                    isFirstCall = false,
                    is_admin = false,
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
                        file_key,
                        page,
                        per_page,
                        from,
                        order_by,
                        order,
                        password,
                        search_scope,
                        search: search || "",
                        types: args.types?.join(",") || "",
                        is_admin,
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
                const { file_key, id, search } = queryArgs;

                return `${id}-file_key-${file_key}-${search}`;
            },

            merge: (currentCache, newResponse, { arg }) => {
                const newSrc = newResponse?.data?.widget.data.source;
                if (!newSrc) return;
                const currentSrc = currentCache?.data?.widget.data.source;
                const isFirstPage = arg.page === 1;

                if (isFirstPage || arg?.is_pagination) {
                    currentCache.data = newResponse.data;
                    return;
                }
                if (!currentSrc) {
                    currentCache.data = newResponse.data;
                    return;
                }

                const newFiles = currentSrc?.files ?? [];
                const mergedFiles = [...newFiles, ...newSrc?.files];

                if (currentCache.data) {
                    currentCache.data.widget.data.source = {
                        ...currentSrc,
                        files: mergedFiles,
                        current_page: newSrc.current_page,
                        has_more: newSrc.has_more,
                        total_pages: newSrc.total_pages,
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
                    currentArg?.file_key !== previousArg.file_key ||
                    currentArg?.order !== previousArg.order ||
                    currentArg?.order_by !== previousArg.order_by ||
                    currentArg?.per_page !== previousArg.per_page ||
                    currentArg?.search_scope !== previousArg.search_scope ||
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

        getPages: builder.query<WPPage[], void>({
            async queryFn(_arg, _api, _extra, fetchWithBQ) {
                const result = await fetchWithBQ({
                    url: `${pnpnd.site_url}/wp-json/wp/v2/pages`,
                });

                if (result.error) {
                    return { error: result.error };
                }

                return {
                    data: result.data as WPPage[],
                };
            },
        }),

        embedWidget: builder.mutation<
            ServerResponse<{
                page_url: string;
            }>,
            {
                widget_id: string;
                page_id?: string;
                page_name: string;
            }
        >({
            query: ({ widget_id, page_id, page_name }) => ({
                url: "widget/embed",
                method: "POST",
                body: { widget_id, page_id, page_name },
            }),
        }),

        widgetOnboarding: builder.mutation<
            ServerResponse<{ status: boolean }>,
            { status: boolean }
        >({
            query: ({ status }) => ({
                url: "widget/onboarding",
                method: "PUT",
                body: { status },
            }),
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
    useGetPagesQuery,
    useEmbedWidgetMutation,
    useWidgetOnboardingMutation,
} = widgetApi;
