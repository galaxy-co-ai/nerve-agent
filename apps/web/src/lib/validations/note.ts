import { z } from "zod"

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(100000, "Content too long"),
  projectId: z.string().optional().nullable(),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100000).optional(),
  projectId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const quickCreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(100000),
  projectId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type QuickCreateNoteInput = z.infer<typeof quickCreateNoteSchema>
