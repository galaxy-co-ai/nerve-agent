import { describe, it, expect, vi, beforeEach } from "vitest"
import { db } from "@/lib/db"
import { createTask, updateTaskStatus, completeTaskWithExtras, deleteTask } from "../tasks"
import { revalidatePath } from "next/cache"

// Type the mocked db
const mockedDb = vi.mocked(db)

describe("tasks actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createTask", () => {
    it("should create a task with valid data", async () => {
      const mockProject = { id: "proj-1", slug: "test-project", userId: "test-user-id" }
      const mockSprint = { id: "sprint-1", tasks: [] }

      mockedDb.project.findFirst.mockResolvedValue(mockProject as never)
      mockedDb.sprint.findUnique.mockResolvedValue(mockSprint as never)
      mockedDb.task.create.mockResolvedValue({ id: "task-1" } as never)
      mockedDb.task.findMany.mockResolvedValue([])
      mockedDb.sprint.update.mockResolvedValue({} as never)

      const formData = new FormData()
      formData.set("title", "Test Task")
      formData.set("estimatedHours", "4")
      formData.set("description", "Test description")

      await createTask("test-project", 1, formData)

      expect(mockedDb.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sprintId: "sprint-1",
          title: "Test Task",
          estimatedHours: 4,
          description: "Test description",
          order: 1,
        }),
      })
      expect(revalidatePath).toHaveBeenCalledWith("/projects/test-project")
    })

    it("should throw error if title is missing", async () => {
      const formData = new FormData()
      formData.set("estimatedHours", "4")

      await expect(createTask("test-project", 1, formData)).rejects.toThrow(
        "Title is required"
      )
    })

    it("should throw error if project not found", async () => {
      mockedDb.project.findFirst.mockResolvedValue(null)

      const formData = new FormData()
      formData.set("title", "Test Task")
      formData.set("estimatedHours", "4")

      await expect(createTask("nonexistent", 1, formData)).rejects.toThrow(
        "Project not found"
      )
    })

    it("should throw error if sprint not found", async () => {
      const mockProject = { id: "proj-1", slug: "test-project", userId: "test-user-id" }
      mockedDb.project.findFirst.mockResolvedValue(mockProject as never)
      mockedDb.sprint.findUnique.mockResolvedValue(null)

      const formData = new FormData()
      formData.set("title", "Test Task")
      formData.set("estimatedHours", "4")

      await expect(createTask("test-project", 999, formData)).rejects.toThrow(
        "Sprint not found"
      )
    })
  })

  describe("updateTaskStatus", () => {
    it("should update task status", async () => {
      const mockTask = {
        id: "task-1",
        status: "TODO",
        completedAt: null,
        sprint: {
          number: 1,
          project: { userId: "test-user-id", slug: "test-project" },
        },
      }

      mockedDb.task.findUnique.mockResolvedValue(mockTask as never)
      mockedDb.task.update.mockResolvedValue({} as never)

      await updateTaskStatus("task-1", "IN_PROGRESS")

      expect(mockedDb.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { status: "IN_PROGRESS" },
      })
    })

    it("should set completedAt when marking as COMPLETED", async () => {
      const mockTask = {
        id: "task-1",
        status: "IN_PROGRESS",
        completedAt: null,
        sprint: {
          number: 1,
          project: { userId: "test-user-id", slug: "test-project" },
        },
      }

      mockedDb.task.findUnique.mockResolvedValue(mockTask as never)
      mockedDb.task.update.mockResolvedValue({} as never)

      await updateTaskStatus("task-1", "COMPLETED")

      expect(mockedDb.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: expect.objectContaining({
          status: "COMPLETED",
          completedAt: expect.any(Date),
        }),
      })
    })

    it("should throw error if task not found", async () => {
      mockedDb.task.findUnique.mockResolvedValue(null)

      await expect(updateTaskStatus("nonexistent", "COMPLETED")).rejects.toThrow(
        "Task not found"
      )
    })

    it("should throw error if user does not own the task", async () => {
      const mockTask = {
        id: "task-1",
        sprint: {
          number: 1,
          project: { userId: "other-user-id", slug: "other-project" },
        },
      }

      mockedDb.task.findUnique.mockResolvedValue(mockTask as never)

      await expect(updateTaskStatus("task-1", "COMPLETED")).rejects.toThrow(
        "Task not found"
      )
    })
  })

  describe("completeTaskWithExtras", () => {
    it("should complete task and log time", async () => {
      const mockTask = {
        id: "task-1",
        title: "Test Task",
        description: "Original description",
        sprint: {
          number: 1,
          project: { id: "proj-1", userId: "test-user-id", slug: "test-project" },
        },
      }

      mockedDb.task.findUnique.mockResolvedValue(mockTask as never)
      mockedDb.task.update.mockResolvedValue({} as never)
      mockedDb.timeEntry.create.mockResolvedValue({} as never)
      mockedDb.timeEntry.aggregate.mockResolvedValue({ _sum: { durationMinutes: 60 } } as never)

      await completeTaskWithExtras({
        taskId: "task-1",
        projectId: "proj-1",
        durationMinutes: 60,
        notes: "Completed the task",
      })

      expect(mockedDb.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: expect.objectContaining({
          status: "COMPLETED",
          completedAt: expect.any(Date),
        }),
      })

      expect(mockedDb.timeEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "test-user-id",
          projectId: "proj-1",
          taskId: "task-1",
          durationMinutes: 60,
          source: "MANUAL",
        }),
      })
    })

    it("should start next task if provided", async () => {
      const mockTask = {
        id: "task-1",
        title: "Test Task",
        description: null,
        sprint: {
          number: 1,
          project: { id: "proj-1", userId: "test-user-id", slug: "test-project" },
        },
      }

      const mockNextTask = {
        id: "task-2",
        sprint: {
          number: 1,
          project: { userId: "test-user-id", slug: "test-project" },
        },
      }

      mockedDb.task.findUnique
        .mockResolvedValueOnce(mockTask as never)
        .mockResolvedValueOnce(mockNextTask as never)
      mockedDb.task.update.mockResolvedValue({} as never)

      await completeTaskWithExtras({
        taskId: "task-1",
        projectId: "proj-1",
        startNextTaskId: "task-2",
      })

      // First call completes task-1
      expect(mockedDb.task.update).toHaveBeenNthCalledWith(1, {
        where: { id: "task-1" },
        data: expect.objectContaining({ status: "COMPLETED" }),
      })

      // Second call starts task-2
      expect(mockedDb.task.update).toHaveBeenNthCalledWith(2, {
        where: { id: "task-2" },
        data: { status: "IN_PROGRESS" },
      })
    })
  })

  describe("deleteTask", () => {
    it("should delete task owned by user", async () => {
      const mockTask = {
        id: "task-1",
        sprint: {
          number: 1,
          project: { userId: "test-user-id", slug: "test-project" },
        },
      }

      mockedDb.task.findUnique.mockResolvedValue(mockTask as never)
      mockedDb.task.delete.mockResolvedValue({} as never)

      await deleteTask("task-1")

      expect(mockedDb.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" },
      })
    })

    it("should throw error if task not found", async () => {
      mockedDb.task.findUnique.mockResolvedValue(null)

      await expect(deleteTask("nonexistent")).rejects.toThrow("Task not found")
    })
  })
})
