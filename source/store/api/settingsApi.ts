import { ModuleConfig } from "~/types/widget.types";
import { SettingsData } from "~/types/settings";
import { ServerResponse } from "~/types/Types";
import { baseApi } from "./baseApi";

export const settingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query<
            ServerResponse<{ defaults: SettingsData; current: SettingsData }>,
            void
        >({
            async queryFn(_arg, api, _extra, fetchWithBQ) {
                const state = api.getState() as any;

                const existing = state.api?.queries?.["getSettings(undefined)"];

                if (!existing?.data) {
                    const localData: SettingsData = pnpnd.settings;

                    return {
                        data: {
                            message: "success",
                            success: true,
                            data: {
                                defaults: localData,
                                current: localData,
                            },
                        },
                    };
                }

                const result = await fetchWithBQ({ url: "settings" });

                if (result.error) return { error: result.error };

                return {
                    data: result.data as ServerResponse<{
                        defaults: SettingsData;
                        current: SettingsData;
                    }>,
                };
            },

            providesTags: ["Settings"],
        }),

        updateSettings: builder.mutation<
            ServerResponse<{
                settings: SettingsData;
            }>,
            SettingsData
        >({
            query: (settingsData) => ({
                url: "settings",
                method: "POST",
                body: { settings: settingsData },
            }),
        }),

        clearAttachments: builder.mutation<void, void>({
            query: () => ({
                url: "media-library/clear",
                method: "DELETE",
            }),
        }),

        importShortcodes: builder.mutation<
            ServerResponse<null>,
            { widgets: ModuleConfig[] }
        >({
            query: ({ widgets }) => {
                return {
                    url: "widget/import",
                    method: "POST",
                    body: { widgets },
                };
            },
        }),

        getMigrateInfo: builder.query<
            ServerResponse<{
                old: number;
                new: number;
                migrationNeeded: number;
                duplicate: number[];
            }>,
            void
        >({
            query: () => ({
                url: "media-library/migrate",
                method: "GET",
            }),
        }),

        migrateAll: builder.mutation<
            ServerResponse<{
                old: number;
                new: number;
                migrationNeeded: number;
                duplicate: number[];
            }>,
            {
                isRemoveExist: boolean;
            }
        >({
            query: ({ isRemoveExist }) => ({
                url: "media-library/migrate",
                method: "POST",
                body: { isRemoveExist },
            }),
        }),

        mediaLibrarySync: builder.mutation<ServerResponse<null>, void>({
            query: () => ({
                url: "media-library/sync",
                method: "POST",
            }),
        }),

        deleteDuplicates: builder.mutation<
            ServerResponse<{
                old: number;
                new: number;
                migrationNeeded: number;
                duplicate: number[];
            }>,
            {
                oldOrNew: "old" | "new";
            }
        >({
            query: ({ oldOrNew }) => ({
                url: "media-library/delete-duplicates",
                method: "DELETE",
                body: { oldOrNew },
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useClearAttachmentsMutation,
    useImportShortcodesMutation,
    useGetMigrateInfoQuery,
    useMigrateAllMutation,
    useMediaLibrarySyncMutation,
    useDeleteDuplicatesMutation,
} = settingsApi;
