import { useAppDispatch } from "~/store/hooks";
import {
    updateAccounts,
    updateAdvanced,
    updateAppearance,
    updateIntegrations,
    updateSynchronization,
    updateTools,
} from "~/store/features/settingSlice";
import {
    Accounts,
    Advanced,
    Appearance,
    Integrations,
    Synchronization,
    Tools,
} from "~/types/settings";

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
        saveTools,
    };
};

export default useSaveSettings;
