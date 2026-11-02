# AI Assistance

**Spec:** 12 | See `MORI_PROJECT_PLAN.md` section 12 (AI consultation and staff assistance)

## Model Configuration

**Three modes** (Decision: see ADR-17 — adopted from handoff-brief section 2, not spec):

| Mode | Provider | Use case | Cost |
| --- | --- | --- | --- |
| DISABLED | None | No AI suggestions offered | None |
| FAKE | Mock/echo | Development + testing | None |
| REAL | OpenAI / equivalent | Production (requires API key + budget) | Pay-per-token |

Environment: `AI_PROVIDER` and `AI_API_KEY`.

## Customer AI (Bounded)

**Spec 12:** Budget-consulting assistant:

- **Input:** Venue size, style preference, budget range, optional mood images
- **Output:** 3–5 product recommendations + reasoning
- **Constraints:**
  - 5 messages per browser session / per IP (anonymous)
  - 30 messages per verified account / per day
  - No access to private customer data or orders

[INV-10] AI cannot set prices, approve proofs, publish pages, or modify orders. Read-only tool allowlist.

**Deterministic ranking:** Fallback if AI fails. Ranking = 40% style-match + 30% budget + 20% popularity + 10% diversity.

## Staff AI (Assistance Only)

Suggestions for staff actions (never auto-execute):

- **Brief summarization:** Condense custom request text
- **Copy suggestions:** Draft friendly copy for quote emails
- **Design-direction suggestions:** "Modern minimalist, ivory + sage"

Staff must review and approve all outputs before showing customers or publishing.

**Constraints:**
- No staff MFA required for AI chats (it's assistance, not sensitive decision)
- All AI messages logged (audit trail)
- Quota per staff = 100 messages/day

## Quota & Reservations

Atomic quota reservation per request:

```typescript
const reservation = await db.$transaction(async (tx) => {
  const account = await tx.account.findUnique({
    where: { id: userId },
    select: { aiQuotaRemaining: true }
  });
  
  if (account.aiQuotaRemaining < 1) {
    throw new Error('Quota exceeded');
  }
  
  return await tx.account.update({
    where: { id: userId },
    data: { aiQuotaRemaining: account.aiQuotaRemaining - 1 }
  });
});
```

## Circuit Breaker

If AI provider down or slow:

1. **Return FAKE model results immediately** (no user-facing latency)
2. **Log incident** for staff review
3. **Graceful fallback:** Product list / deterministic ranking (always available)
4. **No degradation:** Customer workflow continues without AI

## Related

- [Threat model](../security/threat-model.md) — Prompt injection, AI override rules
- [Entities: media, ops, AI](../database/entities-media-ops-ai.md) — AiConversation schema
- [Background tasks](./background-tasks.md) — Optional async AI processing

---

**Principle:** AI is grounded assistance, never decision authority. Failures have fallback; quotas prevent abuse.
