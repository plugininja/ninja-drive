import { DEFAULT_CONFIG } from "~features/file-browser/types/fileApi.types";
import { getHomeDirFilesRes } from "~features/file-browser/utils/file";
import { Order, OrderBy, ServerResponse } from "~kernel/types/Types";
import { widgetApi } from "~kernel/store/widgetCacheBridge";
import { baseApi } from "~kernel/store/baseApi";
import { TBreadcrumb } from "../types/ui";
import {
    DownloadData,
    File,
    SharedData,
} from "~features/file-browser/types/file.types";

type TGetFolderRequest = {
    file_key: string;
    page?: number;
    per_page?: number;
    from?: "cache" | "server";
    order_by?: OrderBy;
    order?: Order;
    search?: string;
    types?: string;
};

type TGetFolderResponse = {
    files: File[];
    current_page: number;
    has_more: boolean;
    total_pages: number;
    total_files?: number;
    breadcrumbs: TBreadcrumb[];
    is_new_folder?: boolean;
};

type FilesResponse = ServerResponse<TGetFolderResponse>;

type TCreateFolderRequest = {
    file_key: string;
    name: string;
    widget_id?: string;
};

type TRenameRequest = {
    file_key: string;
    name: string;
    parent_key?: string;
    widget_id?: string;
};

type TDeleteRequest = {
    file_keys: string[];
    parent_key: string;
    widget_id?: string;
};

export interface ShareLinkRequest {
    file_key: string;
    password?: string;
    expire_in?: string;
    widget_id?: string;
    update?: boolean;
    share_link_id?: string;
}

export interface DownloadLinkRequest {
    file_key: string;
    password?: string;
    expire_in?: string;
    limit?: number;
    widget_id?: string;
    export_format?: string;
    download_link_id?: string;
    update?: boolean;
}
export interface TMoveRequest {
    file_keys: string[];
    destination?: string;
    current_folder_key: string;
    widget_id?: string;
}
export interface TCopyRequest {
    file_keys: string[];
    destination?: string;
    current_folder_key: string;
    widget_id?: string;
}
export interface TUploadUrlRequest {
    name: string;
    type: string;
    folder_key: string;
    widget_id?: string;
    description?: string;
    page_secret?: string;
    queue_index?: number;
    extension?: string;
    size?: number;
    post_id?: number;
}

export const fileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFiles: builder.query<FilesResponse, TGetFolderRequest>({
            async queryFn(request, _api, _extra, fetchWithBQ) {
                const {
                    file_key,
                    order_by,
                    order,
                    page = 1,
                    per_page = DEFAULT_CONFIG.PER_PAGE_LIMIT,
                    search,
                    types,
                    from,
                } = request;

                try {
                    let response: FilesResponse;

                    if (file_key === "home") {
                        response = await getHomeDirFilesRes();
                    } else {
                        const result = await fetchWithBQ({
                            url: `folder/${file_key}`,
                            params: {
                                order_by,
                                order,
                                page,
                                per_page,
                                search,
                                types,
                                from,
                            },
                        });

                        if (result.error) {
                            return { error: result.error };
                        }

                        response = result.data as FilesResponse;

                        if (response.data?.breadcrumbs) {
                            response.data.breadcrumbs = [
                                { file_key: "home", name: "Home" },
                                ...response.data.breadcrumbs,
                            ];
                        }
                    }

                    if (!response.success) {
                        return {
                            error: {
                                status: "CUSTOM_ERROR",
                                data: response.message,
                            },
                        };
                    }

                    return { data: response };
                } catch (err) {
                    return {
                        error: {
                            status: "FETCH_ERROR",
                            data: "Failed to fetch files",
                        },
                    };
                }
            },

            onQueryStarted(arg, { dispatch }) {
                const { from } = arg;

                if (from === "cache") return;

                dispatch(fileApi.util.invalidateTags(["Folder_Tree"]));
            },

            serializeQueryArgs: ({ queryArgs }) => {
                const { file_key } = queryArgs;
                return file_key;
            },

            merge(currentCache, newResponse, { arg }) {
                if (!currentCache.data) return newResponse;
                if (!newResponse.data) return currentCache;
                if (arg.page === 1) {
                    currentCache.data.files = newResponse.data.files;
                } else {
                    currentCache.data.files.push(...newResponse.data.files);
                }

                currentCache.data.has_more = newResponse.data.has_more;
                currentCache.data.total_files = newResponse.data.total_files;
                currentCache.data.total_pages = newResponse.data.total_pages;
                currentCache.data.current_page = newResponse.data.current_page;
                currentCache.data.breadcrumbs = newResponse.data.breadcrumbs;
            },

            forceRefetch({ currentArg, previousArg }) {
                if (!previousArg || !currentArg) return true;
                return Boolean(
                    currentArg.page !== previousArg.page ||
                        currentArg.file_key !== previousArg.file_key ||
                        currentArg.order !== previousArg.order ||
                        currentArg.order_by !== previousArg.order_by ||
                        currentArg.from !== previousArg.from ||
                        currentArg.search !== previousArg.search ||
                        currentArg.types !== previousArg.types,
                );
            },

            providesTags: (_res, _err, { file_key }) => [
                { type: "Folder", id: file_key },
            ],
        }),

        getFile: builder.query<ServerResponse<File>, { file_key: string }>({
            query: ({ file_key }) => ({
                url: `file/${file_key}`,
            }),
            providesTags: (_res, _err, { file_key }) => [
                { type: "File", id: file_key },
            ],
        }),

        getFilesByKeys: builder.query<
            ServerResponse<{ files: File[] }>,
            { file_keys: string[] }
        >({
            query: ({ file_keys }) => ({
                url: "file/by-keys",
                params: { file_keys: file_keys.join(",") },
            }),
        }),

        createFolder: builder.mutation<
            ServerResponse<File>,
            TCreateFolderRequest
        >({
            query: ({ file_key, name, widget_id }) => {
                const body: TCreateFolderRequest = {
                    file_key,
                    name,
                };
                if (widget_id) {
                    body.widget_id = widget_id;
                }
                return {
                    url: "/folder/create",
                    method: "POST",
                    body: body,
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const newFolder = data?.data;
                    if (!newFolder) return;

                    if (!arg.widget_id) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { file_key: arg.file_key },
                                (draft) => {
                                    if (!draft?.data?.files) return;
                                    draft.data.files.unshift(newFolder);
                                },
                            ),
                        );
                    } else {
                        dispatch(
                            widgetApi.util.updateQueryData(
                                "getModuleFiles",
                                {
                                    file_key: arg.file_key,
                                    id: arg.widget_id,
                                    search: arg.file_key === "/" ? null : "",
                                },
                                (draft) => {
                                    if (!draft?.data?.widget.data.source.files)
                                        return;
                                    draft.data.widget.data.source.files.unshift(
                                        newFolder,
                                    );
                                },
                            ),
                        );
                    }

                    dispatch(fileApi.util.invalidateTags(["Folder_Tree"]));
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        deleteFiles: builder.mutation<ServerResponse<null>, TDeleteRequest>({
            query: ({ file_keys, widget_id }) => {
                const body: any = {
                    file_keys,
                };
                if (widget_id) {
                    body.widget_id = widget_id;
                }
                return {
                    url: "/file",
                    method: "DELETE",
                    body,
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    if (!arg.widget_id) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { file_key: arg.parent_key },
                                (draft) => {
                                    if (!draft?.data?.files) return;

                                    draft.data.files = draft.data.files.filter(
                                        (file) =>
                                            !arg.file_keys.includes(
                                                file.file_key,
                                            ),
                                    );
                                },
                            ),
                        );
                    } else {
                        dispatch(
                            widgetApi.util.updateQueryData(
                                "getModuleFiles",
                                {
                                    file_key: arg.parent_key || "home",
                                    id: arg.widget_id,
                                    search: arg.parent_key === "/" ? null : "",
                                },
                                (draft) => {
                                    if (!draft.data) return;
                                    draft.data.widget.data.source.files =
                                        draft?.data?.widget.data.source.files.filter(
                                            (file) =>
                                                !arg.file_keys.includes(
                                                    file.file_key,
                                                ),
                                        );
                                },
                            ),
                        );
                    }

                    arg.file_keys.forEach((file_key) => {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { file_key },
                                (draft) => {
                                    if (!draft?.data) return;

                                    draft.data.breadcrumbs = [];
                                },
                            ),
                        );
                    });

                    dispatch(fileApi.util.invalidateTags(["Folder_Tree"]));
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        renameFile: builder.mutation<ServerResponse<File>, TRenameRequest>({
            query: ({ file_key, name, widget_id }) => {
                const params: TRenameRequest = { file_key, name };
                if (widget_id) {
                    params.widget_id = widget_id;
                }
                return {
                    url: "/file/rename",
                    method: "POST",
                    body: params,
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (!arg.widget_id) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { file_key: arg.parent_key || "home" },
                                (draft) => {
                                    if (!draft?.data?.files) return;

                                    const renamedFile = data?.data;
                                    if (!renamedFile) return;

                                    const index = draft.data.files.findIndex(
                                        (f) => f.file_key === arg.file_key,
                                    );

                                    if (index === -1) return;

                                    draft.data.files[index] = renamedFile;
                                },
                            ),
                        );

                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { file_key: arg.file_key },
                                (draft) => {
                                    if (!draft?.data?.breadcrumbs) return;
                                    const renamedFile = data?.data;
                                    if (!renamedFile) return;

                                    draft.data.breadcrumbs =
                                        draft.data.breadcrumbs.map((b) =>
                                            b.file_key === arg.file_key
                                                ? {
                                                      ...b,
                                                      name: renamedFile.name,
                                                  }
                                                : b,
                                        );
                                },
                            ),
                        );
                    } else {
                        const parentKey = arg.parent_key || "/";
                        dispatch(
                            widgetApi.util.updateQueryData(
                                "getModuleFiles",
                                {
                                    file_key: parentKey,
                                    id: arg.widget_id,
                                    search: parentKey === "/" ? null : "",
                                },
                                (draft) => {
                                    if (!draft?.data?.widget.data.source.files)
                                        return;
                                    const renamedFile = data?.data;
                                    if (!renamedFile) return;
                                    const index =
                                        draft.data.widget.data.source.files.findIndex(
                                            (f) => f.file_key === arg.file_key,
                                        );
                                    if (index === -1) return;
                                    draft.data.widget.data.source.files[index] =
                                        renamedFile;
                                },
                            ),
                        );
                    }

                    dispatch(fileApi.util.invalidateTags(["Folder_Tree"]));
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        shareLink: builder.mutation<
            ServerResponse<{
                link: string;
                updated_data?: SharedData;
            }>,
            ShareLinkRequest
        >({
            query: ({
                file_key,
                password,
                expire_in,
                widget_id,
                share_link_id,
                update,
            }) => {
                const params: any = { file_key, password, expire_in };

                if (widget_id) {
                    params.widget_id = widget_id;
                }

                if (share_link_id) {
                    params.share_link_id = share_link_id;
                }

                return {
                    url: `/file/share/${file_key}`,
                    method: update ? "PUT" : "GET",
                    params,
                };
            },
        }),

        downloadLink: builder.mutation<
            ServerResponse<{
                link: string;
                updated_data?: DownloadData;
            }>,
            DownloadLinkRequest
        >({
            query: ({
                file_key,
                password,
                expire_in,
                widget_id,
                limit,
                export_format,
                download_link_id,
                update,
            }) => {
                const params: any = {
                    file_key,
                    password,
                    expire_in,
                    limit,
                    export_format,
                };

                if (widget_id) {
                    params.widget_id = widget_id;
                }

                if (download_link_id) {
                    params.download_link_id = download_link_id;
                }

                return {
                    url: `/file/download/${file_key}`,
                    method: update ? "PUT" : "GET",
                    params,
                };
            },
        }),

        getFolderTree: builder.query<
            ServerResponse<{ files: File[] }>,
            {
                file_key: string;
                widget_id?: string;
                order?: Order;
                order_by?: OrderBy;
            }
        >({
            query: ({ file_key, widget_id, order, order_by }) => {
                const params: Record<string, string> = {
                    file_key,
                };

                if (widget_id) params.widget_id = widget_id;
                if (order) params.order = order;
                if (order_by) params.order_by = order_by;

                return { url: "folder/tree", params };
            },
            providesTags: ["Folder_Tree"],
        }),

        uploadUrl: builder.mutation<
            ServerResponse<{ url: string; uploadId: string }>,
            TUploadUrlRequest
        >({
            query: ({
                folder_key,
                widget_id,
                type,
                description,
                extension,
                page_secret,
                queue_index,
                size,
                name,
                post_id,
            }) => {
                const params: TUploadUrlRequest = {
                    folder_key,
                    type,
                    description,
                    extension,
                    page_secret,
                    queue_index,
                    size,
                    name,
                };
                if (widget_id) {
                    params.widget_id = widget_id;
                }

                if (post_id) {
                    params.post_id = post_id;
                }
                return {
                    url: "/file/upload",
                    method: "POST",
                    body: params,
                };
            },
        }),

        uploadedFile: builder.query<
            ServerResponse<File>,
            {
                file_id: string;
                upload_id: string;
                folder_key: string;
                widget_id?: string;
            }
        >({
            query: (args) => ({
                url: "file/upload",
                params: args,
            }),
        }),

        openInGoogleDrive: builder.mutation<
            ServerResponse<string>,
            { file_key: string; widget_id?: string }
        >({
            query: ({ file_key, widget_id }) => ({
                url: `file/open-in-drive/${file_key}`,
                method: "GET",
                params: widget_id ? { widget_id } : undefined,
            }),
        }),
    }),

    overrideExisting: false,
});

export const {
    useGetFilesQuery,
    useLazyGetFilesQuery,
    useGetFileQuery,
    useLazyGetFileQuery,
    useGetFilesByKeysQuery,
    useCreateFolderMutation,
    useDeleteFilesMutation,
    useRenameFileMutation,
    useDownloadLinkMutation,
    useShareLinkMutation,
    useGetFolderTreeQuery,
    useLazyGetFolderTreeQuery,
    useUploadUrlMutation,
    useUploadedFileQuery,
    useLazyUploadedFileQuery,
    useOpenInGoogleDriveMutation,
} = fileApi;
