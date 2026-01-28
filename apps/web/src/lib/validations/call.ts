import { z } from "zod"

export const createCallSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  callDate: z.string().min(1, "Date is required"),
  participants: z.string().max(500).optional(),
  transcript: z.string().min(1, "Transcript is required").max(500000, "Transcript too long"),
})

export const updateCallSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  callDate: z.string().optional(),
  participants: z.string().max(500).optional().nullable(),
})

export const processedCallDataSchema = z.object({
  summary: z.string(),
  actionItems: z.array(z.object({
    text: z.string(),
    assignedTo: z.string(),
    dueDate: z.string().optional(),
  })),
  decisions: z.array(z.object({
    text: z.string(),
    decidedBy: z.string(),
  })),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "CONCERNED"]),
  followUps: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    sourceQuote: z.string().optional(),
    dueDate: z.string().optional(),
  })).optional(),
})

export type CreateCallInput = z.infer<typeof createCallSchema>
export type UpdateCallInput = z.infer<typeof updateCallSchema>
export type ProcessedCallData = z.infer<typeof processedCallDataSchema>
