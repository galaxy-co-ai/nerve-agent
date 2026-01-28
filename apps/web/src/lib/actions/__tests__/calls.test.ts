import { describe, it, expect, vi, beforeEach } from "vitest"
import { db } from "@/lib/db"
import { createCall, updateCall, deleteCall, toggleBriefShared, getCallByBriefToken } from "../calls"
import { revalidatePath } from "next/cache"

// Type the mocked db
const mockedDb = vi.mocked(db)

describe("calls actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createCall", () => {
    it("should create a call with valid data", async () => {
      const mockProject = { id: "proj-1", slug: "test-project", userId: "test-user-id" }
      const mockCall = { id: "call-1" }

      mockedDb.project.findFirst.mockResolvedValue(mockProject as never)
      mockedDb.call.create.mockResolvedValue(mockCall as never)

      const formData = new FormData()
      formData.set("projectId", "proj-1")
      formData.set("title", "Client Call")
      formData.set("callDate", "2024-01-15")
      formData.set("participants", "John, Jane")
      formData.set("transcript", "Test transcript content")

      await expect(createCall(formData)).rejects.toThrow("REDIRECT:/calls/call-1")

      expect(mockedDb.call.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "test-user-id",
          projectId: "proj-1",
          title: "Client Call",
          participants: "John, Jane",
          transcript: "Test transcript content",
        }),
      })
    })

    it("should create call with processed AI data", async () => {
      const mockProject = { id: "proj-1", slug: "test-project", userId: "test-user-id" }
      const mockCall = { id: "call-1" }

      mockedDb.project.findFirst.mockResolvedValue(mockProject as never)
      mockedDb.call.create.mockResolvedValue(mockCall as never)

      const formData = new FormData()
      formData.set("projectId", "proj-1")
      formData.set("title", "Client Call")
      formData.set("callDate", "2024-01-15")
      formData.set("transcript", "Transcript")

      const processedData = {
        summary: "Test summary",
        actionItems: [{ text: "Do this", assignedTo: "me" }],
        decisions: [{ text: "We decided X", decidedBy: "client" }],
        sentiment: "POSITIVE" as const,
      }

      await expect(createCall(formData, processedData)).rejects.toThrow("REDIRECT:/calls/call-1")

      expect(mockedDb.call.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          summary: "Test summary",
          actionItems: processedData.actionItems,
          decisions: processedData.decisions,
          sentiment: "POSITIVE",
        }),
      })
    })

    it("should throw error if required fields missing", async () => {
      const formData = new FormData()
      formData.set("projectId", "proj-1")
      formData.set("title", "Call")
      // Missing callDate and transcript

      await expect(createCall(formData)).rejects.toThrow(
        "Project, title, date, and transcript are required"
      )
    })

    it("should throw error if project not found", async () => {
      mockedDb.project.findFirst.mockResolvedValue(null)

      const formData = new FormData()
      formData.set("projectId", "nonexistent")
      formData.set("title", "Call")
      formData.set("callDate", "2024-01-15")
      formData.set("transcript", "Transcript")

      await expect(createCall(formData)).rejects.toThrow("Project not found")
    })
  })

  describe("updateCall", () => {
    it("should update call with new data", async () => {
      const mockCall = {
        id: "call-1",
        userId: "test-user-id",
        title: "Original Title",
        callDate: new Date("2024-01-15"),
        participants: "John",
        project: { slug: "test-project" },
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)
      mockedDb.call.update.mockResolvedValue({} as never)

      const formData = new FormData()
      formData.set("title", "Updated Title")
      formData.set("callDate", "2024-01-20")
      formData.set("participants", "John, Jane")

      await updateCall("call-1", formData)

      expect(mockedDb.call.update).toHaveBeenCalledWith({
        where: { id: "call-1" },
        data: expect.objectContaining({
          title: "Updated Title",
          participants: "John, Jane",
        }),
      })
    })

    it("should throw error if call not found", async () => {
      mockedDb.call.findUnique.mockResolvedValue(null)

      const formData = new FormData()
      formData.set("title", "Title")

      await expect(updateCall("nonexistent", formData)).rejects.toThrow(
        "Call not found"
      )
    })

    it("should throw error if user does not own call", async () => {
      const mockCall = {
        id: "call-1",
        userId: "other-user-id",
        project: { slug: "test-project" },
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)

      const formData = new FormData()
      formData.set("title", "Title")

      await expect(updateCall("call-1", formData)).rejects.toThrow(
        "Call not found"
      )
    })
  })

  describe("deleteCall", () => {
    it("should delete call owned by user", async () => {
      const mockCall = {
        id: "call-1",
        userId: "test-user-id",
        project: { slug: "test-project" },
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)
      mockedDb.call.delete.mockResolvedValue({} as never)

      await expect(deleteCall("call-1")).rejects.toThrow("REDIRECT:/calls")

      expect(mockedDb.call.delete).toHaveBeenCalledWith({
        where: { id: "call-1" },
      })
    })

    it("should throw error if call not found", async () => {
      mockedDb.call.findUnique.mockResolvedValue(null)

      await expect(deleteCall("nonexistent")).rejects.toThrow("Call not found")
    })
  })

  describe("toggleBriefShared", () => {
    it("should toggle sharing from off to on and generate token", async () => {
      const mockCall = {
        id: "call-1",
        userId: "test-user-id",
        briefShared: false,
        briefToken: null,
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)
      mockedDb.call.update.mockResolvedValue({} as never)

      const result = await toggleBriefShared("call-1")

      expect(mockedDb.call.update).toHaveBeenCalledWith({
        where: { id: "call-1" },
        data: expect.objectContaining({
          briefShared: true,
          briefToken: expect.any(String),
        }),
      })
      expect(result.briefShared).toBe(true)
      expect(result.briefToken).toBeDefined()
    })

    it("should toggle sharing from on to off, keeping token", async () => {
      const mockCall = {
        id: "call-1",
        userId: "test-user-id",
        briefShared: true,
        briefToken: "existing-token",
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)
      mockedDb.call.update.mockResolvedValue({} as never)

      const result = await toggleBriefShared("call-1")

      expect(mockedDb.call.update).toHaveBeenCalledWith({
        where: { id: "call-1" },
        data: {
          briefShared: false,
          briefToken: "existing-token",
        },
      })
      expect(result.briefShared).toBe(false)
    })

    it("should throw error if call not found", async () => {
      mockedDb.call.findUnique.mockResolvedValue(null)

      await expect(toggleBriefShared("nonexistent")).rejects.toThrow(
        "Call not found"
      )
    })
  })

  describe("getCallByBriefToken", () => {
    it("should return call if token valid and shared", async () => {
      const mockCall = {
        id: "call-1",
        briefShared: true,
        briefToken: "valid-token",
        project: { name: "Test Project", clientName: "Client" },
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)

      const result = await getCallByBriefToken("valid-token")

      expect(result).toEqual(mockCall)
    })

    it("should return null if call not shared", async () => {
      const mockCall = {
        id: "call-1",
        briefShared: false,
        briefToken: "token",
      }

      mockedDb.call.findUnique.mockResolvedValue(mockCall as never)

      const result = await getCallByBriefToken("token")

      expect(result).toBeNull()
    })

    it("should return null if token not found", async () => {
      mockedDb.call.findUnique.mockResolvedValue(null)

      const result = await getCallByBriefToken("invalid-token")

      expect(result).toBeNull()
    })
  })
})
