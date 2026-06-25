/**
 * Kernel bridge for settings API access from auth feature.
 * Auth accesses settingsApi through this bridge instead of importing directly.
 */
export { settingsApi } from "~features/settings/api/settingsApi";
