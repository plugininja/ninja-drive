import { File } from "~features/file-browser/types/file.types";
import { ServerResponse } from "~kernel/types/Types";
import { baseApi } from "~kernel/store/baseApi";

type DashboardResponse = {
    image_cache: {
        key: string;
        count: string | number;
        size: string | number;
    }[];
    cached_files: {
        files: File[];
    };
    shared_files: {
        files: File[];
    };
    downloaded_files: {
        files: File[];
    };
};

type CachedFilesResponse = {
    files: File[];
    current_page: number;
    total_pages: number;
};

type SharedFilesResponse = {
    files: File[];
    current_page: number;
    total_pages: number;
};

type DownloadedFilesResponse = {
    files: File[];
    current_page: number;
    total_pages: number;
};

type DeleteCachedFileResponse = {
    cached_files: {
        files: File[];
    };
    image_cache: {
        key: string;
        count: string | number;
        size: string | number;
    }[];
};

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardData: builder.query<
            ServerResponse<DashboardResponse>,
            { fields?: string }
        >({
            query: ({ fields }) => {
                const params: Record<string, string | number> = {
                    ...(fields ? { fields } : {}),
                };

                return {
                    url: "dashboard",
                    params,
                };
            },
        }),

        getCachedFiles: builder.query<
            ServerResponse<CachedFilesResponse>,
            {
                page: number;
                per_page: number;
                order: "ASC" | "DESC";
                order_by: "name" | "size" | "created_at" | "updated_at";
            }
        >({
            query: ({ page, per_page, order, order_by }) => ({
                url: "file/cache",
                params: {
                    page,
                    per_page,
                    order,
                    order_by,
                },
            }),
        }),

        getSharedFiles: builder.query<
            ServerResponse<SharedFilesResponse>,
            {
                page: number;
                per_page: number;
                order: "ASC" | "DESC";
                order_by: "name" | "size" | "created_at" | "updated_at";
            }
        >({
            query: ({ page, per_page, order, order_by }) => ({
                url: "file/shares",
                params: {
                    page,
                    per_page,
                    order,
                    order_by,
                },
            }),
        }),

        getDownloadedFiles: builder.query<
            ServerResponse<DownloadedFilesResponse>,
            {
                page: number;
                per_page: number;
                order: "ASC" | "DESC";
                order_by: "name" | "size" | "created_at" | "updated_at";
            }
        >({
            query: ({ page, per_page, order, order_by }) => ({
                url: "file/downloads",
                params: {
                    page,
                    per_page,
                    order,
                    order_by,
                },
            }),
        }),

        deleteCachedFile: builder.mutation<
            ServerResponse<DeleteCachedFileResponse>,
            {
                type?: "total" | "5xl" | "4xl" | "xl" | "lg" | "md";
                file_key?: string;
            }
        >({
            query: ({ type, file_key }) => {
                const params: Record<string, string> = {};

                if (type) params.type = type;

                if (file_key) params.file_key = file_key;

                return {
                    url: file_key ? "dashboard/cache/file" : "dashboard/cache",
                    method: "DELETE",
                    params,
                };
            },
        }),

        deleteShareLink: builder.mutation<
            ServerResponse<null>,
            { file_key: string; share_link_id?: string }
        >({
            query: ({ file_key, share_link_id }) => {
                const params: Record<string, string> = {};

                if (share_link_id) {
                    params.share_link_id = share_link_id;
                }

                return {
                    url: `/file/share/${file_key}`,
                    method: "DELETE",
                    params,
                };
            },
        }),

        deleteDownloadLink: builder.mutation<
            ServerResponse<null>,
            { file_key: string; download_link_id?: string }
        >({
            query: ({ file_key, download_link_id }) => {
                const params: Record<string, string> = {};

                if (download_link_id) {
                    params.download_link_id = download_link_id;
                }

                return {
                    url: `/file/download/${file_key}`,
                    method: "DELETE",
                    params,
                };
            },
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDashboardDataQuery,
    useGetCachedFilesQuery,
    useGetSharedFilesQuery,
    useGetDownloadedFilesQuery,
    useDeleteCachedFileMutation,
    useDeleteShareLinkMutation,
    useDeleteDownloadLinkMutation,
} = dashboardApi;
