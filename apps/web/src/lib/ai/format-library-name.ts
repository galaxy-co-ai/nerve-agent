import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

const NAMING_CONVENTION = `
You are a code naming assistant. Format the given library item title to follow these strict conventions:

**BLOCK** (large implementations like auth flows, dashboards):
- Use PascalCase
- Be descriptive but concise
- Examples: "ClerkAuthFlow", "DashboardLayout", "StripeCheckoutIntegration", "DataTableWithPagination"

**PATTERN** (snippets, hooks, utilities):
- Use camelCase
- Hooks MUST start with "use" (e.g., "useDebounce", "useLocalStorage")
- Utilities should be verb-based (e.g., "formatCurrency", "parseQueryString", "validateEmail")
- Examples: "useDebounce", "formatDate", "cn", "fetchWithRetry"

**QUERY** (database patterns):
- Use snake_case
- Start with action verb (get, insert, update, delete, upsert)
- Be specific about what's being queried
- Examples: "get_users_by_role", "insert_order_with_items", "update_user_preferences"

Rules:
- Remove filler words (the, a, an, for, with) unless they add clarity
- Keep it under 40 characters when possible
- No file extensions
- No spaces or special characters
- Return ONLY the formatted name, nothing else
`

export async function formatLibraryItemName(
  title: string,
  type: "BLOCK" | "PATTERN" | "QUERY"
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Format this ${type} title: "${title}"`,
        },
      ],
      system: NAMING_CONVENTION,
    })

    const content = message.content[0]
    if (content.type === "text") {
      // Clean up any quotes or extra whitespace
      return content.text.trim().replace(/["']/g, "")
    }

    return title // Fallback to original
  } catch (error) {
    console.error("Failed to format library item name:", error)
    return title // Fallback to original on error
  }
}
