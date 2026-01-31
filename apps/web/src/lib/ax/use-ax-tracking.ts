/**
 * AX Tracking Hook
 *
 * Provides convenient access to tracking functions with automatic
 * pattern refresh after significant events.
 */

"use client"

import { useCallback } from "react"
import { useAXStateOptional } from "./state-provider"
import {
  trackSuggestionApproved,
  trackSuggestionDismissed,
  trackFeatureUsed,
  trackNoteCreated,
  trackShortcutUsed,
  trackActionTaken,
} from "./tracking"

export function useAXTracking() {
  const axState = useAXStateOptional()

  const trackAndRefresh = useCallback(
    (trackFn: () => void) => {
      trackFn()
      // Refresh patterns after tracking (debounced in provider)
      axState?.refreshPatterns()
    },
    [axState]
  )

  return {
    /**
     * Track when a suggestion is approved
     */
    trackSuggestionApproved: useCallback(
      (suggestionType: string, editedBeforeApprove: boolean = false) => {
        trackAndRefresh(() => trackSuggestionApproved(suggestionType, editedBeforeApprove))
      },
      [trackAndRefresh]
    ),

    /**
     * Track when a suggestion is dismissed
     */
    trackSuggestionDismissed: useCallback(
      (suggestionType: string) => {
        trackAndRefresh(() => trackSuggestionDismissed(suggestionType))
      },
      [trackAndRefresh]
    ),

    /**
     * Track feature usage
     */
    trackFeatureUsed: useCallback(
      (feature: string) => {
        trackFeatureUsed(feature)
        // Don't refresh patterns for every feature use - too noisy
      },
      []
    ),

    /**
     * Track note creation
     */
    trackNoteCreated: useCallback(
      (noteType: string, wordCount: number) => {
        trackNoteCreated(noteType, wordCount)
      },
      []
    ),

    /**
     * Track shortcut usage
     */
    trackShortcutUsed: useCallback(
      (shortcut: string) => {
        trackShortcutUsed(shortcut)
      },
      []
    ),

    /**
     * Track action taken (for intent tracking)
     */
    trackActionTaken: useCallback(
      (intent: string, context: string) => {
        trackActionTaken(intent, context)
      },
      []
    ),

    /**
     * Manually refresh patterns
     */
    refreshPatterns: useCallback(() => {
      axState?.refreshPatterns()
    }, [axState]),
  }
}
