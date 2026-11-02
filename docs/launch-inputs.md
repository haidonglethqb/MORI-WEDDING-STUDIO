# Launch Inputs Register

**Spec:** 21.2 | See `MORI_PROJECT_PLAN.md` section 21.2 (Input register)

Real business inputs required before production launch. Marked `isFixture` are dev placeholders; must be replaced before go-live.

| Input | Interim Dev Behavior | Owner | Status |
| --- | --- | --- | --- |
| **Brand & Legal** | | | |
| Privacy policy (Vietnamese + English) | Placeholder text in UI | Legal/Ops | **Open** |
| Terms of service | Placeholder text | Legal/Ops | **Open** |
| RSVP data retention policy | Default 90 days (spec 3.4) | Legal | **Open** |
| Invitation expiry disclosure | Default 180 days (spec 3.4) | Product | **Open** |
| **Pricing & Catalogue** | | | |
| Product SKUs & metadata (30 designs) | Fixture: 24 paper + 6 digital placeholder records | Product/Ops | **Open** |
| Paper types (material, weight, finish, cost) | Fixture: sugarcane-bagasse + recycled paper placeholders | Procurement | **Open** |
| Printing specifications (DPI, binding, etc.) | Fixture: flat A5, bi-fold A6 with standard bindings | Procurement | **Open** |
| Base prices (VND) | Fixture: 500K–5M VND range | Finance/Ops | **Open** |
| Taxes + shipping rates (if applicable) | Not implemented v1; left `null` in quotes | Finance | **Open** |
| Production lead times | Fixture: 3–7 days | Ops | **Open** |
| **Credentials & Services** | | | |
| SMTP provider (email) | Mailpit (dev); real SMTP domain (prod) | DevOps | **Open** |
| S3-compatible storage endpoint | MinIO (dev); AWS S3 or equivalent (prod) | DevOps | **Open** |
| S3 access keys (if not IAM) | Generated locally; prod keys from AWS/provider | DevOps | **Open** |
| ClamAV endpoint | clamav:3310 (Compose); dedicated service or AWS (prod) | DevOps | **Open** |
| AI provider (if enabled) | FAKE (dev); OpenAI or disabled (prod) | DevOps / Product | **Open** |
| **Operational Defaults** | | | |
| Application locale | `vi-VN`; English resources ready | Product | **Open** |
| Session timeout | 30 days | Security/Ops | **Open** |
| Quote lifetime | 7 days (spec 3.4) | Product | **Open** |
| Invitation active quota | 1 per account (spec 3.4) | Product | **Open** |
| RSVP response quota | 500 parties per invitation (spec 3.4) | Product | **Open** |
| **Production Readiness** | | | |
| Backup/restore procedure tested | Not yet (P10) | DevOps | **Open** |
| Load test (k6) passing | Not yet (P10) | QA/DevOps | **Open** |
| Security audit completed | Not yet (P10) | Security | **Open** |
| Accessibility audit (WCAG 2.1 AA) | Not yet (P10) | QA/Design | **Open** |
| Stakeholder launch sign-off | Not yet | Exec | **Open** |
| **Domains & DNS** | | | |
| Public invitation host | `https://invite.mori.example` (example; requires real domain) | DevOps/Ops | **Open** |
| API endpoint | `https://api.mori.example` (or public URL) | DevOps/Ops | **Open** |
| DNS records configured | Not yet (pre-launch) | DevOps | **Open** |
| TLS certificates (HTTPS) | Auto-generated (Caddy dev); prod via Let's Encrypt or provider | DevOps | **Open** |

---

**Process:**
1. Before P10 (launch preparation), all **Open** inputs must be resolved by owner.
2. Fixture values replaced with real values; test data reset.
3. Stakeholder sign-off confirms all inputs ready.
4. No launch until all inputs = **Ready**.

**See also:** Spec 21 (Risk register) for launch blockers and gates.
