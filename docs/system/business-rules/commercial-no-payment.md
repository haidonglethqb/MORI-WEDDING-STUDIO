# Commercial Rules (No Payment)

**Spec:** 3.3 | See `MORI_PROJECT_PLAN.md` section 3.3 (Commercial rules without payments)

## Pricing Terminology

- **Estimate:** Indicative calculation
- **Quote:** Time-bounded, immutable offer for precise scope (expires in 7 days)
- **Order:** Customer's accepted scope awaiting studio fulfillment

**None implies money has been collected.**

## Studio Quote and Order Terminology

**Use:** Request a design, Review your quote, Approve this proof, Place order request.

**Avoid:** Pay now, Payment successful, Outstanding balance, Deposit required, Subscription active.

Order confirmation: *"Your order request has been received. The studio will confirm production and delivery details. No payment is collected on this website."*

## Money (VND)

- **Storage:** PostgreSQL `bigint` / Prisma `BigInt` (integer VND, never float)
- **Serialization:** Decimal strings in JSON (e.g., `"1000000"`)
- **Calculation:** Integer or decimal-safe arithmetic server-side only
- **Maximum order:** 1,000,000,000 VND (proposed; configurable)
- **Maximum quantity:** 10,000 (proposed; configurable)

## Pricing Display

Every displayed estimate includes:
- Quantity and specification
- Price basis
- Shipping: included / excluded / pending
- Tax: included / excluded / pending

Unknown component → `null` with visible explanation, never zero.

**Final quote cannot be accepted while any required charge is unresolved.** [INV-05]

## Test Fixtures

Taxes, shipping, unit prices, production times, and minimum quantities require actual studio data before commercial launch. Never use test fixtures as real offers. Mark fixtures with `isFixture` flag. [Hard rule #12]

## Demo Checkout for AI Invitations

The owner of a bespoke AI invitation can select MoMo, VNPAY, or Bank QR as the simulated payment method. The API sets the fixture amount to 599.000 ₫ and records one confirmation per invitation. The receipt response includes `isFixture: true`. The simulation collects zero money. [Storefront demo policy](../../../AGENTS.md#hard-rules-in-every-pr)

The owner returns to the editor to publish and get the guest link. [AI invitation publication flow](../data-flows/invitation-publication.md#ai-invitation-demo-checkout)

## Related

- [Operational defaults](./operational-defaults.md) — Quote lifetime, defaults
- [Invariants](./invariants.md) — INV-05 (quote immutability), INV-13 (no payment)
- [State machines](./state-machines.md) — Quote state (DRAFT, ISSUED, ACCEPTED)

---

**Principle:** Studio orders follow quote acceptance and fulfillment without payment collection.
