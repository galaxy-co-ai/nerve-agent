import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  estimatedHours: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive")
    .max(1000, "Estimate too high"),
  category: z.string().max(50).optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  estimatedHours: z.coerce.number().positive().max(1000).optional(),
  category: z.string().max(50).nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]).optional(),
})

export const completeTaskWithExtrasSchema = z.object({
  taskId: z.string().min(1, "Task ID required"),
  projectId: z.string().min(1, "Project ID required"),
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
  notes: z.string().max(2000).optional(),
  startNextTaskId: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CompleteTaskWithExtrasInput = z.infer<typeof completeTaskWithExtrasSchema>
