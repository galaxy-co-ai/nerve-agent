import { describe, it, expect, vi, beforeEach } from "vitest"
import { db } from "@/lib/db"
import { createNote, updateNote, deleteNote, toggleNotePin, quickCreateNote } from "../notes"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Type the mocked db
const mockedDb = vi.mocked(db)

describe("notes actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createNote", () => {
    it("should create a note with valid data", async () => {
      const mockNote = { id: "note-1", slug: "test-note" }

      mockedDb.note.findFirst.mockResolvedValue(null) // No existing slug
      mockedDb.note.create.mockResolvedValue(mockNote as never)

      const formData = new FormData()
      formData.set("title", "Test Note")
      formData.set("content", "Test content")

      // The redirect will throw, so we catch it
      await expect(createNote(formData)).rejects.toThrow("REDIRECT:/notes/test-note")

      expect(mockedDb.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "test-user-id",
          title: "Test Note",
          slug: "test-note",
          content: "Test content",
          projectId: null,
        }),
      })
    })

    it("should generate unique slug if slug exists", async () => {
      const mockNote = { id: "note-1", slug: "test-note-1" }

      // First call: slug exists, second call: unique slug found
      mockedDb.note.findFirst
        .mockResolvedValueOnce({ id: "existing" } as never) // "test-note" exists
        .mockResolvedValueOnce(null) // "test-note-1" available
      mockedDb.note.create.mockResolvedValue(mockNote as never)

      const formData = new FormData()
      formData.set("title", "Test Note")
      formData.set("content", "Content")

      await expect(createNote(formData)).rejects.toThrow("REDIRECT:/notes/test-note-1")

      expect(mockedDb.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: "test-note-1",
        }),
      })
    })

    it("should throw error if title is missing", async () => {
      const formData = new FormData()
      formData.set("content", "Content")

      await expect(createNote(formData)).rejects.toThrow(
        "Title and content are required"
      )
    })

    it("should throw error if content is missing", async () => {
      const formData = new FormData()
      formData.set("title", "Title")

      await expect(createNote(formData)).rejects.toThrow(
        "Title and content are required"
      )
    })

    it("should associate note with project when projectId provided", async () => {
      const mockProject = { id: "proj-1", slug: "test-project" }
      const mockNote = { id: "note-1", slug: "test-note" }

      mockedDb.note.findFirst.mockResolvedValue(null)
      mockedDb.note.create.mockResolvedValue(mockNote as never)
      mockedDb.project.findUnique.mockResolvedValue(mockProject as never)

      const formData = new FormData()
      formData.set("title", "Test Note")
      formData.set("content", "Content")
      formData.set("projectId", "proj-1")

      await expect(createNote(formData)).rejects.toThrow("REDIRECT:/notes/test-note")

      expect(mockedDb.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: "proj-1",
        }),
      })
      expect(revalidatePath).toHaveBeenCalledWith("/projects/test-project")
    })
  })

  describe("updateNote", () => {
    it("should update note with new data", async () => {
      const mockNote = {
        id: "note-1",
        slug: "test-note",
        title: "Original Title",
        content: "Original content",
        userId: "test-user-id",
      }

      mockedDb.note.findFirst.mockResolvedValue(mockNote as never)
      mockedDb.note.update.mockResolvedValue({} as never)

      const formData = new FormData()
      formData.set("title", "Updated Title")
      formData.set("content", "Updated content")

      // Should redirect due to title change
      await expect(updateNote("test-note", formData)).rejects.toThrow("REDIRECT:")
    })

    it("should update tags when provided", async () => {
      const mockNote = {
        id: "note-1",
        slug: "test-note",
        title: "Test Note",
        content: "Content",
        userId: "test-user-id",
      }

      mockedDb.note.findFirst.mockResolvedValue(mockNote as never)
      mockedDb.note.update.mockResolvedValue({} as never)

      const formData = new FormData()
      formData.set("title", "Test Note") // Same title, no redirect
      formData.set("content", "Content")
      formData.set("tags", JSON.stringify(["tag1", "tag2"]))

      await updateNote("test-note", formData)

      expect(mockedDb.note.update).toHaveBeenCalledWith({
        where: { id: "note-1" },
        data: expect.objectContaining({
          tags: ["tag1", "tag2"],
        }),
      })
    })

    it("should throw error if note not found", async () => {
      mockedDb.note.findFirst.mockResolvedValue(null)

      const formData = new FormData()
      formData.set("title", "Title")
      formData.set("content", "Content")

      await expect(updateNote("nonexistent", formData)).rejects.toThrow(
        "Note not found"
      )
    })
  })

  describe("deleteNote", () => {
    it("should delete note owned by user", async () => {
      const mockNote = { id: "note-1", userId: "test-user-id" }

      mockedDb.note.findFirst.mockResolvedValue(mockNote as never)
      mockedDb.note.delete.mockResolvedValue({} as never)

      await expect(deleteNote("test-note")).rejects.toThrow("REDIRECT:/notes")

      expect(mockedDb.note.delete).toHaveBeenCalledWith({
        where: { id: "note-1" },
      })
    })

    it("should throw error if note not found", async () => {
      mockedDb.note.findFirst.mockResolvedValue(null)

      await expect(deleteNote("nonexistent")).rejects.toThrow("Note not found")
    })
  })

  describe("toggleNotePin", () => {
    it("should toggle pin status from false to true", async () => {
      const mockNote = { id: "note-1", slug: "test-note", isPinned: false, userId: "test-user-id" }

      mockedDb.note.findFirst.mockResolvedValue(mockNote as never)
      mockedDb.note.update.mockResolvedValue({} as never)

      await toggleNotePin("test-note")

      expect(mockedDb.note.update).toHaveBeenCalledWith({
        where: { id: "note-1" },
        data: { isPinned: true },
      })
    })

    it("should toggle pin status from true to false", async () => {
      const mockNote = { id: "note-1", slug: "test-note", isPinned: true, userId: "test-user-id" }

      mockedDb.note.findFirst.mockResolvedValue(mockNote as never)
      mockedDb.note.update.mockResolvedValue({} as never)

      await toggleNotePin("test-note")

      expect(mockedDb.note.update).toHaveBeenCalledWith({
        where: { id: "note-1" },
        data: { isPinned: false },
      })
    })
  })

  describe("quickCreateNote", () => {
    it("should create note with all provided data", async () => {
      const mockNote = { id: "note-1", slug: "quick-note", title: "Quick Note" }

      mockedDb.note.findFirst.mockResolvedValue(null)
      mockedDb.note.create.mockResolvedValue(mockNote as never)

      const result = await quickCreateNote(
        "Quick Note",
        "Quick content",
        "proj-1",
        ["tag1", "tag2"]
      )

      expect(mockedDb.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "test-user-id",
          title: "Quick Note",
          content: "Quick content",
          projectId: "proj-1",
          tags: ["tag1", "tag2"],
        }),
      })
      expect(result).toEqual(mockNote)
    })

    it("should create note without optional data", async () => {
      const mockNote = { id: "note-1", slug: "quick-note" }

      mockedDb.note.findFirst.mockResolvedValue(null)
      mockedDb.note.create.mockResolvedValue(mockNote as never)

      await quickCreateNote("Quick Note", "Content")

      expect(mockedDb.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: null,
          tags: [],
        }),
      })
    })
  })
})
