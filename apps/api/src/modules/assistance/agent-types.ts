export type AgentToolName =
  | 'search_catalog'
  | 'calculate_quote'
  | 'track_order'
  | 'propose_add_to_cart'
  | 'propose_create_digital_invitation'
  | 'propose_custom_request'
  | 'update_wedding_brief'

export interface AgentToolTraceItem {
  id: string
  tool: AgentToolName
  label: string
  status: 'running' | 'done' | 'error'
  summary?: string
  durationMs?: number
  input?: Record<string, unknown>
  output?: Record<string, unknown>
}

export interface AgentCartActionPayload {
  type: 'ADD_TO_CART'
  title: string
  subtitle: string
  productType: 'PAPER' | 'DIGITAL' | 'COMBO'
  slug: string
  name: string
  shape: string
  quantity: number
  unitAmountVnd: number
  imageUrl?: string | null
  linkedDigitalSlug?: string
  linkedDigitalName?: string
  linkedDigitalUnitVnd?: number
}

export interface AgentDigitalDraftActionPayload {
  type: 'CREATE_DIGITAL_INVITATION'
  title: string
  subtitle: string
  templateId: 'editorial-vogue' | 'heritage-palace' | 'botanical-zen'
  groomName: string
  brideName: string
  eventTitle: string
  weddingDate?: string
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  greeting?: string
}

export interface AgentCustomRequestActionPayload {
  type: 'SUBMIT_CUSTOM_REQUEST'
  title: string
  subtitle: string
  coupleNames?: string
  weddingDate?: string
  quantity?: string
  style?: string
  notes: string
}

export interface AgentNavigateActionPayload {
  type: 'NAVIGATE'
  title: string
  subtitle: string
  href: string
}

export type AgentProposedAction =
  | AgentCartActionPayload
  | AgentDigitalDraftActionPayload
  | AgentCustomRequestActionPayload
  | AgentNavigateActionPayload

export interface AgentLiveContext {
  currentPath?: string
  cartCount?: number
  cartTotalVnd?: number
  cartItemsSummary?: string[]
}

export interface AgentAttachment {
  kind: 'image'
  dataUrl: string
  label?: string
}

export type AgentStreamEvent =
  | { type: 'status'; message: string }
  | { type: 'tool_start'; trace: AgentToolTraceItem }
  | { type: 'tool_done'; trace: AgentToolTraceItem }
  | { type: 'delta'; text: string }
  | { type: 'complete'; response: unknown }
  | { type: 'error'; message: string }

export type LlmContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export interface LlmToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export interface LlmToolMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | LlmContentPart[] | null
  tool_calls?: LlmToolCall[]
  tool_call_id?: string
  name?: string
}

export interface LlmToolStepResult {
  content: string
  toolCalls: LlmToolCall[]
  modelUsed: string
  fallbackTier: number
  latencyMs: number
}

export interface DigitalAgentProduct {
  slug: string
  name: string
  styleLabel: string
  styleTags: string[]
  templateId: 'editorial-vogue' | 'heritage-palace' | 'botanical-zen'
  unitAmountVnd: bigint
  formattedPriceVnd: string
}

export const DIGITAL_AGENT_CATALOG: readonly DigitalAgentProduct[] = [
  { slug: 'minimalist-digital-01', name: 'Digital Zen Minimal', styleLabel: 'Minimalist Japandi', styleTags: ['minimalist', 'zen', 'wabi-sabi'], templateId: 'botanical-zen', unitAmountVnd: 399_000n, formattedPriceVnd: '399.000 ₫' },
  { slug: 'floral-digital-01', name: 'Digital Floral Garden', styleLabel: 'Floral Botanical', styleTags: ['floral', 'botanical', 'garden'], templateId: 'botanical-zen', unitAmountVnd: 449_000n, formattedPriceVnd: '449.000 ₫' },
  { slug: 'typography-digital-01', name: 'Digital Calligraphy', styleLabel: 'Modern Calligraphy', styleTags: ['typography', 'calligraphy', 'editorial'], templateId: 'editorial-vogue', unitAmountVnd: 499_000n, formattedPriceVnd: '499.000 ₫' },
  { slug: 'traditional-digital-01', name: 'Digital Song Hỷ Hoàng Gia', styleLabel: 'Heritage Á Đông', styleTags: ['traditional', 'heritage', 'song-hy'], templateId: 'heritage-palace', unitAmountVnd: 549_000n, formattedPriceVnd: '549.000 ₫' },
  { slug: 'editorial-digital-01', name: 'Digital Vogue Luxe', styleLabel: 'Editorial Vogue', styleTags: ['editorial', 'vogue', 'luxury'], templateId: 'editorial-vogue', unitAmountVnd: 599_000n, formattedPriceVnd: '599.000 ₫' },
]
