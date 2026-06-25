/**
 * Kernel bridge for cross-feature API access.
 * File-browser and other features access widget-builder's API through this bridge
 * instead of importing directly from ~features/widget-builder.
 *
 * Future: Replace these pass-through re-exports with event-based cache invalidation
 * that eliminates the direct API dependency entirely.
 */
export { widgetApi } from "~features/widget-builder/api/widgetApi";
