import { z } from "zod"

export const createFollowUpSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000).optional(),
  projectId: z.string().min(1, "Project is required"),
  callId: z.string().optional(),
  dueDate: z.date().optional(),
})

export const acceptFollowUpSchema = z.object({
  followUpId: z.string().min(1, "Follow-up ID required"),
  dueDate: z.date().optional(),
})

export const updateFollowUpDueDateSchema = z.object({
  followUpId: z.string().min(1, "Follow-up ID required"),
  dueDate: z.date().nullable(),
})

export const createFollowUpsFromCallSchema = z.object({
  callId: z.string().min(1, "Call ID required"),
  projectId: z.string().min(1, "Project ID required"),
  followUps: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    sourceQuote: z.string().max(500).optional(),
    dueDate: z.string().optional(),
  })),
})

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>
export type AcceptFollowUpInput = z.infer<typeof acceptFollowUpSchema>
export type UpdateFollowUpDueDateInput = z.infer<typeof updateFollowUpDueDateSchema>
export type CreateFollowUpsFromCallInput = z.infer<typeof createFollowUpsFromCallSchema>
