import { useGetSettingsQuery } from "~features/settings/api/settingsApi";
import { useAppDispatch, useAppSelector } from "~kernel/store/hooks";
import { useEffect } from "@wordpress/element";
import deepEqual from "fast-deep-equal";
import {
    defaultSettingsInit,
    settingsInit,
    updateIsDirty,
} from "~features/settings/state/settingSlice";

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
