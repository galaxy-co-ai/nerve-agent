// =============================================================================
// Multi-LLM Provider Abstraction
// Route different tasks to the best LLM for the job
// =============================================================================

import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { Mistral } from "@mistralai/mistralai"
import FirecrawlApp from "@mendable/firecrawl-js"

// =============================================================================
// Provider Clients (lazy initialized)
// =============================================================================

let anthropicClient: Anthropic | null = null
let openaiClient: OpenAI | null = null
let mistralClient: Mistral | null = null
let firecrawlClient: FirecrawlApp | null = null

export function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic()
  }
  return anthropicClient
}

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI()
  }
  return openaiClient
}

export function getMistral(): Mistral {
  if (!mistralClient) {
    mistralClient = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    })
  }
  return mistralClient
}

export function getFirecrawl(): FirecrawlApp {
  if (!firecrawlClient) {
    firecrawlClient = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
    })
  }
  return firecrawlClient
}

// =============================================================================
// Model Routing - Pick the right model for the task
// =============================================================================

export type TaskType =
  | "agent-chat"        // Complex reasoning, tool use, personality
  | "quick-generate"    // Fast summaries, standup notes, drafts
  | "research"          // Web search, fact-finding
  | "embedding"         // Vector embeddings for search
  | "transcription"     // Audio to text
  | "scrape"            // Web page to markdown

export const TASK_ROUTING: Record<TaskType, {
  provider: "anthropic" | "openai" | "mistral" | "perplexity" | "firecrawl"
  model: string
  description: string
}> = {
  "agent-chat": {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    description: "Complex reasoning, tool use, nuanced conversation",
  },
  "quick-generate": {
    provider: "mistral",
    model: "mistral-small-latest",
    description: "Fast summaries, standup notes, simple drafts",
  },
  "research": {
    provider: "perplexity",
    model: "sonar-pro",
    description: "Web search augmented responses",
  },
  "embedding": {
    provider: "openai",
    model: "text-embedding-3-small",
    description: "Vector embeddings for semantic search",
  },
  "transcription": {
    provider: "openai",
    model: "whisper-1",
    description: "Audio transcription",
  },
  "scrape": {
    provider: "firecrawl",
    model: "scrape",
    description: "Web page to clean markdown",
  },
}

// =============================================================================
// Unified Generation Interface
// =============================================================================

export interface GenerateOptions {
  task: TaskType
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export interface GenerateResult {
  content: string
  provider: string
  model: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const routing = TASK_ROUTING[options.task]

  switch (routing.provider) {
    case "anthropic":
      return generateWithAnthropic(options, routing.model)
    case "mistral":
      return generateWithMistral(options, routing.model)
    case "perplexity":
      return generateWithPerplexity(options, routing.model)
    case "openai":
      return generateWithOpenAI(options, routing.model)
    default:
      throw new Error(`Unsupported provider: ${routing.provider}`)
  }
}

// =============================================================================
// Provider-specific implementations
// =============================================================================

async function generateWithAnthropic(
  options: GenerateOptions,
  model: string
): Promise<GenerateResult> {
  const client = getAnthropic()

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens || 1024,
    system: options.systemPrompt,
    messages: [{ role: "user", content: options.prompt }],
  })

  const textBlock = response.content.find((b) => b.type === "text")

  return {
    content: textBlock?.type === "text" ? textBlock.text : "",
    provider: "anthropic",
    model,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  }
}

async function generateWithMistral(
  options: GenerateOptions,
  model: string
): Promise<GenerateResult> {
  const client = getMistral()

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = []

  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt })
  }
  messages.push({ role: "user", content: options.prompt })

  const response = await client.chat.complete({
    model,
    messages,
    maxTokens: options.maxTokens || 1024,
    temperature: options.temperature,
  })

  const content = response.choices?.[0]?.message?.content || ""

  return {
    content: typeof content === "string" ? content : "",
    provider: "mistral",
    model,
    usage: {
      inputTokens: response.usage?.promptTokens,
      outputTokens: response.usage?.completionTokens,
    },
  }
}

async function generateWithPerplexity(
  options: GenerateOptions,
  model: string
): Promise<GenerateResult> {
  // Perplexity uses OpenAI-compatible API
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
        { role: "user", content: options.prompt },
      ],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.2,
    }),
  })

  const data = await response.json()

  return {
    content: data.choices?.[0]?.message?.content || "",
    provider: "perplexity",
    model,
    usage: {
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    },
  }
}

async function generateWithOpenAI(
  options: GenerateOptions,
  model: string
): Promise<GenerateResult> {
  const client = getOpenAI()

  const response = await client.chat.completions.create({
    model,
    messages: [
      ...(options.systemPrompt ? [{ role: "system" as const, content: options.systemPrompt }] : []),
      { role: "user" as const, content: options.prompt },
    ],
    max_tokens: options.maxTokens || 1024,
    temperature: options.temperature,
  })

  return {
    content: response.choices[0]?.message?.content || "",
    provider: "openai",
    model,
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    },
  }
}

// =============================================================================
// Embeddings
// =============================================================================

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI()

  const response = await client.embeddings.create({
    model: TASK_ROUTING.embedding.model,
    input: text,
  })

  return response.data[0].embedding
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getOpenAI()

  const response = await client.embeddings.create({
    model: TASK_ROUTING.embedding.model,
    input: texts,
  })

  return response.data.map((d) => d.embedding)
}

// =============================================================================
// Transcription
// =============================================================================

export async function transcribe(audioFile: File | Blob): Promise<string> {
  const client = getOpenAI()

  const response = await client.audio.transcriptions.create({
    model: TASK_ROUTING.transcription.model,
    file: audioFile,
  })

  return response.text
}

// =============================================================================
// Web Scraping
// =============================================================================

export interface ScrapeResult {
  markdown: string
  title?: string
  description?: string
  url: string
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const client = getFirecrawl()

  const response = await client.scrapeUrl(url, {
    formats: ["markdown"],
  })

  if (!response.success) {
    throw new Error(`Failed to scrape ${url}: ${response.error}`)
  }

  return {
    markdown: response.markdown || "",
    title: response.metadata?.title,
    description: response.metadata?.description,
    url,
  }
}

export async function crawlSite(
  url: string,
  options?: { maxPages?: number; includePaths?: string[] }
): Promise<ScrapeResult[]> {
  const client = getFirecrawl()

  const response = await client.crawlUrl(url, {
    limit: options?.maxPages || 10,
    includePaths: options?.includePaths,
    scrapeOptions: {
      formats: ["markdown"],
    },
  })

  if (!response.success) {
    throw new Error(`Failed to crawl ${url}: ${response.error}`)
  }

  return (response.data || []).map((page) => ({
    markdown: page.markdown || "",
    title: page.metadata?.title,
    description: page.metadata?.description,
    url: page.metadata?.sourceURL || url,
  }))
}

// =============================================================================
// Research (Perplexity with web search)
// =============================================================================

export async function research(query: string): Promise<{
  answer: string
  citations?: string[]
}> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: query }],
      return_citations: true,
    }),
  })

  const data = await response.json()

  return {
    answer: data.choices?.[0]?.message?.content || "",
    citations: data.citations,
  }
}
