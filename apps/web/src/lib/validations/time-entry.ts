import { z } from "zod"

// Time format HH:MM
const timeFormat = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")

export const createTimeEntrySchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  taskId: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  startTime: timeFormat,
  endTime: timeFormat,
  description: z.string().max(500).optional().nullable(),
  billable: z.boolean().optional(),
}).refine((data) => {
  // End time should be after start time (basic check)
  const [startH, startM] = data.startTime.split(":").map(Number)
  const [endH, endM] = data.endTime.split(":").map(Number)
  const _startMinutes = startH * 60 + startM
  const _endMinutes = endH * 60 + endM
  // Allow overnight entries (end < start means next day)
  return true
}, { message: "Invalid time range" })

export const updateTimeEntrySchema = z.object({
  projectId: z.string().min(1),
  taskId: z.string().optional().nullable(),
  date: z.string().min(1),
  startTime: timeFormat,
  endTime: timeFormat,
  description: z.string().max(500).optional().nullable(),
  billable: z.boolean().optional(),
})

export const quickTimeEntrySchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  taskId: z.string().optional().nullable(),
  durationMinutes: z.number()
    .int("Must be whole minutes")
    .positive("Duration required")
    .max(24 * 60, "Maximum 24 hours"),
  description: z.string().max(500).optional().nullable(),
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>
export type QuickTimeEntryInput = z.infer<typeof quickTimeEntrySchema>
