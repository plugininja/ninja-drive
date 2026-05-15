import {
    fetchBaseQuery,
    BaseQueryFn,
    FetchArgs,
    createApi,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: pnpnd.restUrl,
    credentials: "same-origin",
    prepareHeaders: (headers) => {
        headers.set("X-WP-Nonce", pnpnd.nonce);
        headers.set("Content-Type", "application/json");
        return headers;
    },
});

export const wpBaseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    unknown
> = async (args, api, extraOptions) => {
    if (
        typeof args === "object" &&
        pnpnd.isPlain &&
        args.params &&
        Object.keys(args.params).length > 0
    ) {
        const qs = new URLSearchParams(
            Object.entries(args.params).reduce<Record<string, string>>(
                (acc, [key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        acc[key] = String(value);
                    }
                    return acc;
                },
                {},
            ),
        ).toString();

        if (qs) {
            args.url += pnpnd.restUrl.includes("?") ? `&${qs}` : `?${qs}`;
        }

        delete args.params;
    }

    return rawBaseQuery(args, api, extraOptions);
};

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: wpBaseQuery,
    tagTypes: [
        "Auth",
        "Folder",
        "File",
        "Notice",
        "Widget",
        "Modules",
        "Folder_Tree",
        "Notifications",
        "Settings",
        "UserAccess",
        "MediaFolders",
    ],
    endpoints: () => ({}),
});
