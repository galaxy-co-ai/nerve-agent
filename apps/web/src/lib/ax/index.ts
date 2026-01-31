/**
 * AX (Agent Experience) Foundation
 *
 * Enables AI agents to understand and interact with the Nerve Agent workspace.
 */

export * from "./types"
export * from "./staleness"
export * from "./relationships"
export { AXStateProvider, useAXState, useAXStateOptional } from "./state-provider"
export { fetchAXWorkspaceData, fetchAXExtendedData, buildAXUser } from "./server"
export type { AXExtendedData } from "./server"
