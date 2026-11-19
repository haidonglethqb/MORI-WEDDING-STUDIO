import type { LlmToolCall } from './agent-types.js'

const TOOL_STREAM_HINTS: Record<string, string> = {
  search_catalog: 'Đang tra cứu bộ sưu tập thiệp MORI...',
  calculate_quote: 'Đang tính báo giá & ưu đãi combo...',
  track_order: 'Đang kiểm tra trạng thái đơn hàng...',
  propose_add_to_cart: 'Đang chuẩn bị thông tin thêm giỏ hàng...',
  propose_create_digital_invitation: 'Đang chuẩn bị bản nháp thiệp online...',
  get_design_system: 'Đang tra cứu hệ thiết kế chuẩn UI/UX Pro Max...',
  get_motion_artwork_kit: 'Đang nạp bộ đồ họa SVG & hiệu ứng chuyển động studio...',
  generate_bespoke_invitation: 'Đang lên ý tưởng & phối bảng màu thiệp độc bản...',
  propose_custom_request: 'Đang soạn phiếu thiết kế riêng...',
  update_wedding_brief: 'Đang ghi nhận thông tin tiệc cưới...',
}

interface RawStreamDelta {
  content?: string | null
  tool_calls?: Array<{
    index?: number
    id?: string
    type?: string
    function?: { name?: string; arguments?: string }
  }>
}

function bespokeStageMessage(argsBuf: string): string {
  const kb = (argsBuf.length / 1024).toFixed(1)
  if (argsBuf.includes('"customCss"')) {
    return `Đang lập trình hiệu ứng animation & chuyển động (${kb} KB)...`
  }
  if (argsBuf.includes('"customHtml"')) {
    return `Đang vẽ họa tiết SVG & dựng bố cục thiệp (${kb} KB)...`
  }
  return 'Đang lên ý tưởng & phối bảng màu thiệp độc bản...'
}

export async function parseOpenAiSseStream(
  body: ReadableStream<Uint8Array>,
  onProgress?: (message: string) => void,
  onChunk?: () => void,
): Promise<{ content: string; toolCalls: LlmToolCall[] }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let sseBuffer = ''
  let content = ''
  const callMap = new Map<number, { id: string; name: string; arguments: string }>()
  let lastStatus = ''
  let lastProgressLen = 0
  let textNotified = false

  const emitStatus = (msg: string) => {
    if (msg && msg !== lastStatus) {
      lastStatus = msg
      onProgress?.(msg)
    }
  }

  const processLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const payload = trimmed.slice(5).trim()
    if (!payload || payload === '[DONE]') return
    try {
      const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: RawStreamDelta }> }
      const delta = parsed.choices?.[0]?.delta
      if (!delta) return

      if (typeof delta.content === 'string' && delta.content.length > 0) {
        content += delta.content
        if (!textNotified && callMap.size === 0) {
          textNotified = true
          emitStatus('Đang soạn phản hồi chi tiết cho bạn...')
        }
      }

      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = typeof tc.index === 'number' ? tc.index : 0
          const existing = callMap.get(idx) ?? { id: tc.id || `call_${idx}`, name: '', arguments: '' }
          if (tc.id) existing.id = tc.id
          if (tc.function?.name) {
            existing.name += tc.function.name
            const hint = TOOL_STREAM_HINTS[existing.name]
            if (hint) emitStatus(hint)
          }
          if (tc.function?.arguments) {
            existing.arguments += tc.function.arguments
            if (existing.name === 'generate_bespoke_invitation') {
              const stageChanged =
                (existing.arguments.includes('"customHtml"') && !lastStatus.includes('SVG') && !lastStatus.includes('animation')) ||
                (existing.arguments.includes('"customCss"') && !lastStatus.includes('animation'))
              if (stageChanged || existing.arguments.length - lastProgressLen >= 700) {
                lastProgressLen = existing.arguments.length
                emitStatus(bespokeStageMessage(existing.arguments))
              }
            }
          }
          callMap.set(idx, existing)
        }
      }
    } catch {
      // Ignore partial or non-JSON keepalive lines
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    onChunk?.()
    sseBuffer += decoder.decode(value, { stream: true })
    const lines = sseBuffer.split(/\r?\n/)
    sseBuffer = lines.pop() ?? ''
    for (const line of lines) processLine(line)
  }
  if (sseBuffer.trim()) processLine(sseBuffer)

  const toolCalls: LlmToolCall[] = [...callMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .filter(([, v]) => v.name.length > 0)
    .map(([, v]) => ({
      id: v.id,
      type: 'function' as const,
      function: { name: v.name, arguments: v.arguments },
    }))

  return { content, toolCalls }
}
