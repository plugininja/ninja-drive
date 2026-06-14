import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { useGetSettingsQuery } from "~/store/api/settingsApi";
import { useEffect } from "@wordpress/element";
import deepEqual from "fast-deep-equal";
import {
    defaultSettingsInit,
    settingsInit,
    updateIsDirty,
} from "~/store/features/settingSlice";

const SettingsRoute = ({ children }: { children: React.ReactNode }) => {
    const { data, draft } = useAppSelector((state) => state.settings);

    const { data: settingsData } = useGetSettingsQuery();

    const dispatch = useAppDispatch();

    const settings = settingsData?.data?.current;

    const defaultSettings = settingsData?.data?.defaults;

    useEffect(() => {
        if (settings) {
            dispatch(settingsInit(settings));
            dispatch(defaultSettingsInit(defaultSettings!));
        }
    }, [settings]);

    useEffect(() => {
        dispatch(updateIsDirty(!deepEqual(data, draft)));
    }, [data, draft]);

    return children;
};

export default SettingsRoute;
