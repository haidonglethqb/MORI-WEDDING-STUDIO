# Frontend State Management

**Spec:** 9.6 | See `MORI_PROJECT_PLAN.md` section 9.6 (Client-side data fetching and forms)

## Data Fetching

**Decision: see ADR-17.** TanStack Query (React Query) for server state (from handoff-brief section 2, not spec):
- Automatic deduplication and request merging
- Stale-while-revalidate caching
- Refetch on window focus, network recovery
- Mutation handling (invalidation patterns)

Example patterns:
```typescript
// Queries
const { data: invitation } = useQuery({
  queryKey: ['invitations', id],
  queryFn: () => api.invitations.get(id),
  staleTime: 5 * 60 * 1000,
});

// Mutations
const { mutate: publishInvitation } = useMutation({
  mutationFn: (data) => api.invitations.publish(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
});
```

## Forms

**Decision: see ADR-17.** react-hook-form + Zod resolver (from handoff-brief section 2):
- Declarative validation (client + server)
- Conflict detection (version mismatch → 409 → show diff UI)
- Autosave with 800 ms debounce
- Optimistic updates with rollback on error

Example:
```typescript
const { control, watch, formState } = useForm({
  resolver: zodResolver(invitationSchema),
  defaultValues: data,
});
```

## Related

- [Overview and topology](./overview-and-topology.md) — API layer design
- [Backend API conventions](../backend/api-conventions.md) — HTTP contract
- [Visual system](../frontend/visual-system.md) — UI patterns

---

**Key principle:** Never invent data; always fetch from the server. Use local state only for UI transience (modals, menu open/close).
