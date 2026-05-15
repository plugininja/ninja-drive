import { Order, OrderBy, ServerResponse } from "~/types/Types";
import { getHomeDirFilesRes } from "../../utils/file";
import { File } from "~/types/file.types";
import { TBreadcrumb } from "~/types/ui";
import { baseApi } from "./baseApi";
import {
    DEFAULT_CONFIG
} from "../../types/fileApi.types";
import { widgetApi } from "./widgetApi";

type TGetFolderRequest = {
    fileKey: string;
    page?: number;
    perPage?: number;
    from?: "cache" | "server";
    orderBy?: OrderBy;
    order?: Order;
    search?: string;
    types?: string;
};

type TGetFolderResponse = {
    files: File[];
    currentPage: number;
    hasMore: boolean;
    totalPages: number;
    totalFiles?: number;
    breadcrumbs: TBreadcrumb[];
    isNewFolder?: boolean;
};

type FilesResponse = ServerResponse<TGetFolderResponse>;

type TCreateFolderRequest = {
    fileKey: string;
    name: string;
    widgetId?: string;
};

type TRenameRequest = {
    fileKey: string;
    name: string;
    parentKey?: string;
    widgetId?: string;
};

type TDeleteRequest = {
    fileKeys: string[];
    parentKey: string;
    widgetId?: string;
};

export interface ShareLinkRequest {
    fileKey: string;
    password?: string;
    expireIn?: string;
    widgetId?: string;
}

export interface DownloadLinkRequest {
    fileKey: string;
    password?: string;
    expireIn?: string;
    limit?: number;
    widgetId?: string;
    exportFormat?: string;
}
export interface TMoveRequest {
    fileKeys: string[];
    destination: string;
    currentFolderKey: string;
    widgetId?: string;
}
export interface TCopyRequest {
    fileKeys: string[];
    destination: string;
    currentFolderKey: string;
    widgetId?: string;
}
export interface TUploadUrlRequest {
    name: string;
    type: string;
    folderKey: string;
    widgetId?: string;
    description?: string;
    page_secret?: string;
    queueIndex?: number;
    extension?: string;
    size?: number;
    post_id?: number;
}

export const fileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFiles: builder.query<FilesResponse, TGetFolderRequest>({
            async queryFn(request, _api, _extra, fetchWithBQ) {
                const {
                    fileKey,
                    orderBy,
                    order,
                    page = 1,
                    perPage = DEFAULT_CONFIG.PER_PAGE_LIMIT,
                    search,
                    types,
                    from,
                } = request;

                try {
                    let response: FilesResponse;

                    if (fileKey === "home") {
                        response = await getHomeDirFilesRes();
                    } else {
                        const result = await fetchWithBQ({
                            url: `folder/${fileKey}`,
                            params: {
                                orderBy,
                                order,
                                page,
                                perPage,
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
                                { fileKey: "home", name: "Home" },
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
                const { fileKey, search } = queryArgs;
                return search ? `${fileKey}-search-${search}` : fileKey;
            },

            merge(currentCache, newResponse, { arg }) {
                if (!currentCache.data) return newResponse;
                if (!newResponse.data) return currentCache;
                if (arg.page === 1) {
                    currentCache.data.files = newResponse.data.files;
                } else {
                    currentCache.data.files.push(...newResponse.data.files);
                }

                currentCache.data.hasMore = newResponse.data.hasMore;
                currentCache.data.totalFiles = newResponse.data.totalFiles;
                currentCache.data.totalPages = newResponse.data.totalPages;
                currentCache.data.currentPage = newResponse.data.currentPage;
                currentCache.data.breadcrumbs = newResponse.data.breadcrumbs;
            },

            forceRefetch({ currentArg, previousArg }) {
                if (!previousArg || !currentArg) return true;
                return Boolean(
                    currentArg.page !== previousArg.page ||
                        currentArg.fileKey !== previousArg.fileKey ||
                        currentArg.order !== previousArg.order ||
                        currentArg.orderBy !== previousArg.orderBy ||
                        currentArg.from !== previousArg.from ||
                        currentArg.search !== previousArg.search ||
                        currentArg.types !== previousArg.types,
                );
            },

            providesTags: (_res, _err, { fileKey }) => [
                { type: "Folder", id: fileKey },
            ],
        }),

        getFile: builder.query<ServerResponse<File>, { fileKey: string }>({
            query: ({ fileKey }) => ({
                url: `file/${fileKey}`,
            }),
            providesTags: (_res, _err, { fileKey }) => [
                { type: "File", id: fileKey },
            ],
        }),

        getFilesByKeys: builder.query<
            ServerResponse<{ files: File[] }>,
            { fileKeys: string[] }
        >({
            query: ({ fileKeys }) => ({
                url: "file/by-keys",
                params: { fileKeys: fileKeys.join(",") },
            }),
        }),

        createFolder: builder.mutation<
            ServerResponse<File>,
            TCreateFolderRequest
        >({
            query: ({ fileKey, name, widgetId }) => {
                const body: TCreateFolderRequest = {
                    fileKey,
                    name,
                };
                if (widgetId) {
                    body.widgetId = widgetId;
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
                    if (arg.widgetId) {
                        const folderKey =
                            arg.fileKey === "my-drive" ? "/" : arg.fileKey;

                        dispatch(
                            widgetApi.util.updateQueryData(
                                "getModuleFiles",
                                {
                                    fileKey: folderKey,
                                    id: arg.widgetId,
                                    search: folderKey === "/" ? null : "",
                                },
                                (draft) => {
                                    const newFile = data.data;
                                    if (!newFile) return;
                                    draft.data?.widget.data.source.files.unshift(
                                        newFile,
                                    );
                                },
                            ),
                        );
                    } else {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                {
                                    fileKey: arg.fileKey,
                                },
                                (draft) => {
                                    const newFile = data.data;
                                    if (!newFile) return;
                                    draft.data?.files.unshift(newFile);
                                },
                            ),
                        );
                    }
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        deleteFiles: builder.mutation<ServerResponse<null>, TDeleteRequest>({
            query: ({ fileKeys, widgetId }) => {
                const body: any = {
                    fileKeys,
                };
                if (widgetId) {
                    body.widgetId = widgetId;
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

                    if (!arg.widgetId) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { fileKey: arg.parentKey },
                                (draft) => {
                                    if (!draft?.data?.files) return;

                                    draft.data.files = draft.data.files.filter(
                                        (file) =>
                                            !arg.fileKeys.includes(
                                                file.fileKey,
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
                                    fileKey: arg.parentKey || "home",
                                    id: arg.widgetId,
                                    search: arg.parentKey === "/" ? null : "",
                                },
                                (draft) => {
                                    if (!draft.data) return;
                                    draft.data.widget.data.source.files =
                                        draft?.data?.widget.data.source.files.filter(
                                            (file) =>
                                                !arg.fileKeys.includes(
                                                    file.fileKey,
                                                ),
                                        );
                                },
                            ),
                        );
                    }

                    arg.fileKeys.forEach((fileKey) => {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { fileKey },
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
            query: ({ fileKey, name, widgetId }) => {
                const params: TRenameRequest = { fileKey, name };
                if (widgetId) {
                    params.widgetId = widgetId;
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
                    if (!arg.widgetId) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { fileKey: arg.parentKey || "home" },
                                (draft) => {
                                    if (!draft?.data?.files) return;

                                    const renamedFile = data?.data;
                                    if (!renamedFile) return;

                                    const index = draft.data.files.findIndex(
                                        (f) => f.fileKey === arg.fileKey,
                                    );

                                    if (index === -1) return;

                                    draft.data.files[index] = renamedFile;
                                },
                            ),
                        );

                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { fileKey: arg.fileKey },
                                (draft) => {
                                    if (!draft?.data?.breadcrumbs) return;
                                    const renamedFile = data?.data;
                                    if (!renamedFile) return;

                                    draft.data.breadcrumbs =
                                        draft.data.breadcrumbs.map((b) =>
                                            b.fileKey === arg.fileKey
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
                        dispatch(
                            widgetApi.util.updateQueryData(
                                "getModuleFiles",
                                {
                                    fileKey: arg.parentKey || "home",
                                    id: arg.widgetId,
                                    search: arg.parentKey === "/" ? null : "",
                                },
                                (draft) => {
                                    if (
                                        !draft?.data?.widget.data.source
                                            .files
                                    )
                                        return;
                                    const renamedFile = data?.data;

                                    if (!renamedFile) return;
                                    const index =
                                        draft.data.widget.data.source.files.findIndex(
                                            (f) => f.fileKey === arg.fileKey,
                                        );
                                    if (index === -1) return;
                                    draft.data.widget.data.source.files[
                                        index
                                    ] = renamedFile;
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

        shareLink: builder.mutation<ServerResponse<string>, ShareLinkRequest>({
            query: ({ fileKey, password, expireIn, widgetId }) => {
                const params: any = { fileKey, password, expireIn };
                if (widgetId) {
                    params.widgetId = widgetId;
                }
                return {
                    url: `/file/share/${fileKey}`,
                    params,
                };
            },
        }),

        downloadLink: builder.mutation<
            ServerResponse<string>,
            DownloadLinkRequest
        >({
            query: ({
                fileKey,
                password,
                expireIn,
                widgetId,
                limit,
                exportFormat,
            }) => {
                const params: any = {
                    fileKey,
                    password,
                    expireIn,
                    limit,
                    exportFormat,
                };
                if (widgetId) {
                    params.widgetId = widgetId;
                }
                return {
                    url: `/file/download/${fileKey}`,
                    params,
                };
            },
        }),

        move: builder.mutation<ServerResponse<null>, TMoveRequest>({
            query: ({
                fileKeys,
                destination,
                widgetId,
                currentFolderKey,
            }) => {
                const body: TMoveRequest = {
                    fileKeys,
                    destination,
                    currentFolderKey,
                };

                if (widgetId) {
                    body.widgetId = widgetId;
                }

                return {
                    url: "/file/move",
                    method: "POST",
                    body: body,
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    if (!arg.widgetId) {
                        dispatch(
                            fileApi.util.updateQueryData(
                                "getFiles",
                                { fileKey: arg.currentFolderKey },
                                (draft) => {
                                    if (!draft?.data?.files) return;

                                    draft.data.files = draft.data.files.filter(
                                        (file) =>
                                            !arg.fileKeys.includes(
                                                file.fileKey,
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
                                    fileKey: arg.currentFolderKey,
                                    id: arg.widgetId,
                                    search:
                                        arg.currentFolderKey === "/"
                                            ? null
                                            : "",
                                },
                                (draft) => {
                                    if (
                                        !draft?.data?.widget.data.source
                                            .files
                                    )
                                        return;

                                    draft.data.widget.data.source.files =
                                        draft?.data?.widget.data.source.files.filter(
                                            (file) =>
                                                !arg.fileKeys.includes(
                                                    file.fileKey,
                                                ),
                                        );
                                },
                            ),
                        );
                    }
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        copy: builder.mutation<ServerResponse<null>, TCopyRequest>({
            query: ({
                fileKeys,
                destination,
                widgetId,
                currentFolderKey,
            }) => {
                const body: TCopyRequest = {
                    fileKeys,
                    destination,
                    currentFolderKey,
                };
                if (widgetId) {
                    body.widgetId = widgetId;
                }
                return {
                    url: "/file/copy",
                    method: "POST",
                    body: body,
                };
            },

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    //  TODO: need to copy files to destination folder
                    // dispatch(
                    //     fileApi.util.updateQueryData(
                    //         "getFolder",
                    //         { key: arg.currentFolderKey },
                    //         (draft) => {
                    //             if (!draft?.data?.files) return;

                    //             draft.data.files = draft.data.files.filter(
                    //                 (file) => !arg.fileKeys.includes(file.fileKey)
                    //             );
                    //         }
                    //     )
                    // );
                } catch (e) {
                    console.error("Update failed", e);
                }
            },
        }),

        getFolderTree: builder.query<
            ServerResponse<{ files: File[] }>,
            {
                fileKey: string;
                widgetId?: string;
                order?: Order;
                orderBy?: OrderBy;
            }
        >({
            query: ({ fileKey, widgetId, order, orderBy }) => {
                const params: Record<string, string> = {
                    fileKey,
                };

                if (widgetId) params.widgetId = widgetId;
                if (order) params.order = order;
                if (orderBy) params.orderBy = orderBy;

                return { url: "folder/tree", params };
            },
            providesTags: ["Folder_Tree"],
        }),

        uploadUrl: builder.mutation<
            ServerResponse<{ url: string; uploadId: string }>,
            TUploadUrlRequest
        >({
            query: ({
                folderKey,
                widgetId,
                type,
                description,
                extension,
                page_secret,
                queueIndex,
                size,
                name,
                post_id,
            }) => {
                const params: TUploadUrlRequest = {
                    folderKey,
                    type,
                    description,
                    extension,
                    page_secret,
                    queueIndex,
                    size,
                    name,
                };
                if (widgetId) {
                    params.widgetId = widgetId;
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
                fileId: string;
                uploadId: string;
                folderKey: string;
                widgetId?: string;
            }
        >({
            query: (args) => ({
                url: "file/upload",
                params: {
                    ...args,
                    folderKey:
                        args.folderKey === "/" ? "my-drive" : args.folderKey,
                },
            }),
        }),

        openInGoogleDrive: builder.mutation<
            ServerResponse<string>,
            { fileKey: string; widgetId?: string }
        >({
            query: ({ fileKey, widgetId }) => ({
                url: `file/open-in-drive/${fileKey}`,
                method: "GET",
                params: widgetId ? { widgetId } : undefined,
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
    useMoveMutation,
    useCopyMutation,
    useUploadUrlMutation,
    useUploadedFileQuery,
    useLazyUploadedFileQuery,
    useOpenInGoogleDriveMutation,
} = fileApi;
