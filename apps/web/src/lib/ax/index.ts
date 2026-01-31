/**
 * AX (Agent Experience) Foundation
 *
 * Enables AI agents to understand and interact with the Nerve Agent workspace.
 */

export * from "./types"
export * from "./staleness"
export * from "./relationships"
export * from "./tracking"
export * from "./patterns"
export * from "./confidence"
export * from "./scratchpad"
export * from "./quiet-signals"
export { AXStateProvider, useAXState, useAXStateOptional } from "./state-provider"
export { useAXTracking } from "./use-ax-tracking"
export { fetchAXWorkspaceData, fetchAXExtendedData, buildAXUser } from "./server"
export type { AXExtendedData } from "./server"
