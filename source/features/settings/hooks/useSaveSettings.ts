import { useAppDispatch } from "~kernel/store/hooks";
import {
    updateAccounts,
    updateAdvanced,
    updateAppearance,
    updateCaching,
    updateIntegrations,
    updateSynchronization,
    updateTools,
} from "~features/settings/state/settingSlice";
import {
    Accounts,
    Advanced,
    Appearance,
    Caching,
    Integrations,
    Synchronization,
    Tools,
} from "~features/settings/types/settings";

const useSaveSettings = () => {
    const dispatch = useAppDispatch();

    const saveAccounts = (
        key: keyof Accounts,
        value: Accounts[keyof Accounts],
    ) => {
        dispatch(
            updateAccounts({
                key,
                value,
            }),
        );
    };

    const saveAdvanced = (
        key: keyof Advanced,
        value: Advanced[keyof Advanced],
    ) => {
        dispatch(
            updateAdvanced({
                key,
                value,
            }),
        );
    };

    const saveAppearance = (
        key: keyof Appearance,
        value: Appearance[keyof Appearance],
    ) => {
        dispatch(
            updateAppearance({
                key,
                value,
            }),
        );
    };

    const saveIntegrations = (
        key: keyof Integrations,
        value: Integrations[keyof Integrations],
    ) => {
        dispatch(
            updateIntegrations({
                key,
                value,
            }),
        );
    };

    const saveSynchronization = (
        key: keyof Synchronization,
        value: Synchronization[keyof Synchronization],
    ) => {
        dispatch(
            updateSynchronization({
                key,
                value,
            }),
        );
    };

    const saveCaching = (key: keyof Caching, value: Caching[keyof Caching]) => {
        dispatch(
            updateCaching({
                key,
                value,
            }),
        );
    };

    const saveTools = (key: keyof Tools, value: Tools[keyof Tools]) => {
        dispatch(
            updateTools({
                key,
                value,
            }),
        );
    };

    return {
        saveAccounts,
        saveAdvanced,
        saveAppearance,
        saveIntegrations,
        saveSynchronization,
        saveCaching,
        saveTools,
    };
};

export default useSaveSettings;
