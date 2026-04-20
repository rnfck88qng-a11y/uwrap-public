# The Sovereign Acceptance Runtime
## Portable Governance for AI Work in a World of Cheap, Local, and Forkable Models

**Status:** Working paper  
**Scope:** doctrine, bounded implementation evidence, and open research agenda  
**Non-claim:** this paper does not describe a finished platform

## Abstract

As capable AI models become cheaper, more portable, and increasingly deployable on local hardware, the center of the governance problem shifts away from centralized providers and toward the execution boundary. This changes the control question. If intelligence is local, cheap, and forkable, governance cannot rely only on centralized moderation, hosted APIs, or after-the-fact dashboards.

This paper argues for a missing layer: the **Sovereign Acceptance Runtime**. A Sovereign Acceptance Runtime is a bounded execution layer that constrains what intelligence may do, records what it attempted, proves what happened, keeps contradictions visible, and reserves canonical acceptance to human operators alone.

Within AlterA’s stable public doctrine, four contributions are advanced:

1. **Sovereign Acceptance** as a runtime discipline  
2. **Tri-State Truth** as an honesty protocol  
3. **receipt-driven governance** as the proof grammar for accountable actions  
4. **STRONG/WEAK guard separation** as a practical pattern for bounded execution  

These claims are made only to the extent justified by bounded internal evidence, not by claims of a finished platform.

## 1. The problem moved to the execution boundary

Most AI governance discussion still assumes that the decisive control point sits at the model layer: frontier labs, hosted APIs, or downstream moderation.

That assumption weakens as increasingly capable models become deployable on personal and enterprise hardware. Once intelligence becomes broadly portable, the central question is no longer only whether a provider moderates a model well. The question becomes:

**What governs execution after the model already exists in the deployer’s hands?**

If capable systems can run locally, cheaply, and outside centralized chokepoints, then safety cannot depend only on provider policy. It needs an execution-layer answer.

## 2. Existing provenance systems are necessary but insufficient

There has been real progress in software supply-chain provenance, signing, and attestation. Those systems matter.

But artifact provenance alone does not solve **agentic acceptance**.

It does not, by itself, answer:

- who held authority to trigger an action
- what bounded capability was active
- what review state was required
- whether contradictions remained unresolved
- whether a transition crossed from proposal into canon under human authority

The missing layer is therefore not just better signing.

It is a bounded runtime discipline in which provenance, receipts, review, contradiction handling, and acceptance form one governed circuit.

## 3. Sovereign Acceptance

A **Sovereign Acceptance Runtime** is a bounded system in which AI may propose, analyze, synthesize, or execute inside constrained lanes, but may not unilaterally declare canonical truth.

The stable doctrine is simple:

- AI may propose
- humans alone declare CANON
- projections are not truth
- no silent actions
- no lost history
- no unsafe scaling

This paper does **not** treat the whole current stack as the contribution. It treats the runtime discipline as the contribution.

The stack remains architecturally rich but internally unsettled in important places, including the public role of uBus, the reconciliation of receipt types, and the exact truth boundary across documentation, knowledge, and memory.

Publishing the doctrine before the stack is fully resolved is therefore not a retreat from implementation. It is a way of separating the long half-life contribution from the short half-life architecture.

## 4. Tri-State Truth

The first core contribution is **Tri-State Truth**:

Every major feature, guarantee, or external claim must be labeled as one of:

- **Specified**
- **Partially Enforced**
- **Proven**

This is not only a status convention. It is an anti-self-deception mechanism.

AI systems fail when design intent is narrated as implementation fact, or when bounded proofs are silently generalized into platform claims.

Tri-State Truth is how a system preserves honesty under active construction.

It also disciplines this paper itself.

For example:
- the memory layer claim is bounded to the authority boundary proven in Phase 1, not the whole future memory system
- human-only CANON is a stable doctrine, but the completed CANON path currently has one worked example rather than repeated throughput across the stack
- receipt-driven governance is directionally real, but receipt unification and general artifact gating remain open

That is a strength, not a weakness.

## 5. Receipt-driven governance and the Proof Envelope

The second contribution is **receipt-driven governance**.

Standard logs are not enough for accountable AI work. What is needed is a typed receipt grammar that links instruction, execution, review, retrieval, and promotion, so that actions can be audited as governed events rather than reconstructed from ambient telemetry.

In the current truth state, receipt practice exists but remains partial and unreconciled. Multiple receipt traditions coexist without one final unification document.

That fragmentation should not be hidden. It also reveals the right direction:
accountable AI work needs receipts that are first-class governance objects, not just implementation exhaust.

The receipt circuit also needs a governed container.

That is the role of the **Proof Envelope** — the public-facing name used here for the internal `uWrap` concept.

**Note on scope and open standardization.**
uWrap v0.1 defines the packaging layer only: a portable, machine-readable Proof Envelope that binds an artifact to its claims, receipts, and evidence. It is deliberately decoupled from the broader Sovereign Acceptance Runtime described in this paper. The runtime may adopt uWrap as one packaging format among several, and uWrap can be produced and consumed by systems that do not implement the runtime’s acceptance gates, policy evaluation, or human-promotion rules.

The Proof Envelope is the portable package that carries:
- a task or claim
- associated evidence
- constraints
- dependencies
- receipts

through a governed lifecycle.

In current truth terms, the Proof Envelope is best described as **specified / partially enforced** rather than generally deployed. The point of naming it here is not to claim finished implementation, but to define the object that moves through a receipted runtime.

**Note on boundaries:** uWrap v0.1 defines the Proof Envelope at the packaging layer, but it does not by itself provide the full acceptance runtime, generalized governance gates, or complete execution-boundary enforcement.

## 6. STRONG and WEAK guards

The third contribution is the separation between **STRONG** and **WEAK** guards.

In AlterA’s bounded internal evidence:

- **STRONG** means an authoritative boundary requiring explicit interceptor clearance
- **WEAK** means an advisory or env-var-only boundary

This distinction matters because it separates advisory logic from authoritative execution paths.

That does not prove stackwide enforcement.

It does justify a narrower and stronger public claim:

**STRONG/WEAK guard separation is a reproducible architecture pattern that is already proven at the Sentinel boundary and can be described independently of unfinished subsystems.**

## 7. Bounded evidence: what is proven today

The following claims are currently strong enough to state as **proven in bounded scope**:

- uPipe P0, P1, and P2 in bounded runtime scope
- Memory Layer v1 Phase 1 at the authority-boundary layer
- a bounded packet lane with local receipt signing
- uSpine as the one worked example of a completed CANON path
- STRONG/WEAK guard separation at the Sentinel boundary

These are bounded proofs, not generalized claims about total platform completion.

The following are **partially enforced**:

- receipt-driven governance across selected lanes
- contradiction and stale handling in selected surfaces
- projection-not-truth enforcement across parts of the system
- review-path structures that exist but are not yet fully unified

The following are **specified, contradictory, or open**:

- general artifact gating
- generalized dispatch loop closure
- receipt-type reconciliation
- authority-boundary resolution across documentation, knowledge, and memory
- final public role of uBus
- generalized sandboxing
- operational ownership for Bayesian reasoning

## 8. A family of constitutional constraints, not a frozen numbered list

The internal corpus supports a stable family of recurring constitutional constraints, including:

- explicit save
- local-only operation
- inspectability
- history-forward behavior
- verification without trust
- the rule that AI assists but does not author canonical truth

These should **not** be presented here as a quoted, canonical numbered doctrine unless a single primary enumerating source is frozen and cited.

In this paper they are therefore presented as a recurring constitutional family, not as a falsely stabilized numbered list.

That distinction preserves the substance without inventing a cleaner primary source than the archive actually contains.

## 9. What this paper does not claim

This paper does **not** claim:

- that the AlterA stack is complete
- a generalized CANON throughput path beyond one worked example
- universal artifact gating
- universal receipt unification
- universally enforced sandboxing
- reconciled subsystem boundaries
- resolved internal doctrine for every lane and module

What it claims is narrower and more important:

that a Sovereign Acceptance Runtime is the missing layer for a world in which capable AI becomes portable, and that bounded internal evidence already points toward that layer strongly enough to justify public research attention.

## 10. Research agenda

A credible research agenda follows directly from the open problems.

1. Unify receipt semantics across execution, provenance, review, and promotion  
2. Finish artifact gating as a general runtime capability  
3. Resolve the authority boundary among canonical documentation, structured knowledge, and authoritative memory  
4. Close the dispatch loop so bounded packet-lane proofs do not get confused with full workflow closure  
5. Move from advisory or structural containment toward mechanically enforced sandboxing  
6. Clarify Bayesian reasoning as an advisory contradiction-and-risk layer without letting probabilistic confidence masquerade as authority  

## Conclusion

AI governance will not be solved at the model layer alone if intelligence becomes cheap, local, and forkable.

It will not be solved by dashboards alone, because projection is not truth.

And it will not be solved by policy language alone, because policy without enforcement becomes narrative.

What is needed is a bounded layer of governed execution: a **Sovereign Acceptance Runtime** in which rights are constrained, actions are receipted, contradictions remain visible, promotion is reviewable, and only humans accept canonical state.

The current AlterA packet does not prove the whole system. It proves enough to justify the doctrine, define bounded technical contributions, and invite rigorous collaboration on the missing parts.

## 11. Alternative Views and Counterarguments

Any architectural proposal must survive engagement with its strongest counterarguments. Three prevalent objections challenge the necessity or viability of execution-level governance.

### 11.1 Objection: Centralized model governance remains sufficient
A common view holds that if frontier model weights are rigorously aligned during pre-training, and hosted APIs are aggressively red-teamed and moderated by providers, downstream execution-level governance is redundant or actively harmful to open experimentation.

**Counterargument:** This assumption relies on a topological constraint—that highly capable models require massive, centralized data centers to run. This constraint is collapsing. As sophisticated foundation models become mathematically portable, they can be seamlessly decoupled from API-level provider moderation. A system design that cannot safely execute a locally run, unaligned parameter model is a structurally unsafe system. Safety must reside in the physics of the environment (the execution runtime) rather than solely relying upon the intent alignment of the model.

### 11.2 Objection: Execution-boundary enforcement is intractable at scale
Critics argue that capturing receipt-driven provenance for every autonomous action creates an exploding, computationally intractable graph of micro-events that halts system capability.

**Counterargument:** This is resolved by correctly partitioning authorization, the primary purpose of the STRONG and WEAK guard architecture (Section 6). The runtime does not mandate cryptographic provenance on every probabilistic logic loop or heuristic guess (WEAK guards). It enforces execution boundary provenance *only* at the threshold of sovereign system mutations (e.g., file writes, outward packet broadcasts, or canonical memory updates). By bounding governance strictly to the transition perimeter (STRONG guards), the runtime prevents computational explosion while maintaining a mechanical guarantee against unauthorized mutation.

### 11.3 Objection: Receipt-driven governance reproduces blockchain failure modes
A final objection argues that relying on cryptographic receipts, inclusion proofs (SCITT), and append-only state creates a cumbersome abstraction replicating widely acknowledged failures of decentralized consensus logs.

**Counterargument:** This obscures the critical distinction between an *authority* ledger and a *consensus* ledger. The Sovereign Acceptance Runtime is not a decentralized consensus layer seeking permissionless agreement among untrusted validating nodes over a distributed network. It is the authority boundary for an individual sovereign system. It uses cryptographic formats (like the Proof Envelope) solely to generate a deterministic, machine-readable artifact of intent that cannot be spoofed by ungrounded text generation. The receipts enforce one simple doctrine: an AI may propose a transition, but a designated human operator alone holds the sovereign authority to elevate it to CANON.

## 12. References

### External references
- [Apple Developer — Foundation Models](https://developer.apple.com/machine-learning/)
- [Google AI for Developers — Gemma](https://ai.google.dev/gemma)
- [European Commission — AI Act timeline and applicability](https://artificialintelligenceact.eu/)
- [Sigstore documentation — overview, keyless signing, Rekor](https://docs.sigstore.dev/)
- [SLSA framework documentation](https://slsa.dev/)
- [IETF SCITT documents](https://ietf-scitt.github.io/)

### Internal evidence packet
- completion gap ledger
- contradictions and drift ledger
- decision register
- durable memory candidates
- do not memorize list
- top open threads
