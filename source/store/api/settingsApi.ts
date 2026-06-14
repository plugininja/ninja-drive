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
                    const local_data: SettingsData = pnpnd.settings;

                    return {
                        data: {
                            message: "success",
                            success: true,
                            data: {
                                defaults: local_data,
                                current: local_data,
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

        syncSettings: builder.mutation<
            ServerResponse<{
                message: string;
            }>,
            void
        >({
            query: () => ({
                url: "settings/syncing",
                method: "GET",
            }),
        }),

        resetSettings: builder.mutation<
            ServerResponse<{
                settings: SettingsData;
            }>,
            void
        >({
            query: () => ({
                url: "settings/reset",
                method: "POST",
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useImportShortcodesMutation,
    useSyncSettingsMutation,
    useResetSettingsMutation,
} = settingsApi;
