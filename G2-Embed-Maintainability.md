# G2: Embed Maintainability {#sec:g2-embed-maintainability}

This section presents G2, which focuses on embedding maintainability as an architectural property of modular monolith applications. In this dissertation, maintainability is framed economically as a bounded cost of change: the architecture constrains the expected effort, risk, and coordination required to modify the system as it evolves. Rather than treating maintainability as an indirect outcome of refactoring or developer discipline, G2 operationalizes it through explicit design constraints, stable interaction contracts, and continuous detection of architectural drift.

G2 builds directly on G1. While G1 enforces the existence of explicit modular boundaries, G2 ensures that those boundaries remain effective over time. Together, these guidelines prevent the gradual erosion that often causes traditional monoliths to regress into tightly coupled systems with monolithic change dynamics.

## Intent and Rationale {#intent-and-rationale .unnumbered}

Empirical studies consistently show that the primary driver of maintainability degradation in monolithic systems is not system size, but the accumulation of hidden coupling, ambiguous dependency direction, and architectural drift over time [@gravanis2021dont; @blinowski2022monolithic]. As systems evolve, convenience-driven shortcuts such as deep imports, shared utilities, and implicit wiring gradually increase the blast radius of change and raise coordination costs.

This dissertation treats maintainability as a preventive architectural concern. G2 preserves bounded cost of change by constraining how modules interact, how dependencies are introduced, and how responsibilities are distributed. The guideline prioritizes change locality, stable contracts, and controlled dependency growth over short-term reuse. These properties ensure that most changes remain confined to a single bounded context and that the effort required to evolve the system scales sublinearly with its size.

G2 extends G1 from boundary correctness to boundary sustainability. While G1 makes dependencies explicit and verifiable, G2 ensures that those dependencies remain limited in scope, stable under evolution, measurable through specific metrics and economically manageable as the system grows [@arya2024beyond; @berry2024isItWorth].

## Conceptual Overview {#conceptual-overview .unnumbered}

Maintainability is embedded by designing modules so that change remains local and predictable:

- Each bounded context exposes a narrow and intentional public surface that represents stable capabilities rather than internal structure.

- Cross-module interaction occurs exclusively through explicit contracts.

- Dependency direction reflects responsibility and information flow, reducing the risk of cycles and cascading change.

- Architectural drift is detected early through executable and observable structural signals.

## Applicability Conditions and Scope {#applicability-conditions-and-scope .unnumbered}

G2 applies to systems organized as modular monoliths, where multiple bounded context modules coexist within a single codebase and are expected to evolve continuously. The guideline assumes that:

- Module boundaries are explicitly defined and at least partially enforced, as established by G1.

- Each module has clear ownership and a well-defined responsibility.

- Architectural drift is a realistic risk during ongoing feature development.

G2 does not prescribe specific frameworks, build tools, or CI pipelines. Its scope is limited to metrics definition, design-time and code-level practices that directly influence long-term changeability.

## Objectives {#objectives .unnumbered}

- Bound the cost of change by limiting change propagation across modules.

- Stabilize dependency direction through disciplined layering and contract first boundaries.

- Constrain the growth of module public surfaces.

- Detect architectural drift before it becomes structurally expensive to reverse.

- Preserve the option for incremental refactoring and future decomposition.

## Key Principles {#key-principles .unnumbered}

- *Encapsulation before reuse:* Cross-module reuse of internal code is treated as a maintainability risk unless mediated through an explicit contract.

- *Contract over structure:* Modules depend on declared interfaces or events, not on internal implementation details.

- *Unidirectional dependency flow:* Dependency direction reflects responsibility and information flow, and cycles are considered maintainability violations.

- *Change locality:* Most changes should be implementable within a single module.

- *Evolution over speculation:* Abstractions are introduced to support observed change, not anticipated reuse.

## Implementation Mechanisms {#implementation-mechanisms .unnumbered}

G2 is implemented through established software engineering practices rather than framework-specific mechanisms:

- *Layered internal structure:* Within each bounded context, code is organized into domain, application, and infrastructure concerns, ensuring that business rules remain insulated from volatile technical details.

- *Explicit module entrypoints:* Each module exposes a single public surface that defines its externally visible capabilities.

- *Contract-oriented collaboration:* Cross-module interaction occurs through synchronous interfaces or published domain events.

- *Centralized composition:* Wiring between modules is visible and auditable, preventing implicit coupling.

- *Governed exceptions:* Deviations from dependency or layering rules require explicit justification.

## Common Failure Modes and Anti-Patterns {#common-failure-modes-and-anti-patterns .unnumbered}

The following failure modes are frequently observed in modular monoliths that lack explicit maintainability discipline. Each anti-pattern increases the cost of change by expanding the blast radius of modifications, weakening ownership boundaries, or introducing hidden coupling. For each anti-pattern, G2 defines one or more metrics that make the degradation observable and verifiable.

- *Cross-Module Internal Reuse:* Reusing internal classes or utilities from another module instead of interacting through a declared public API tightly couples the consumer to the provider's internal structure. Internal refactoring then forces coordinated changes across modules, undermining independent evolution. This anti-pattern is primarily detected through an increase in encapsulation leakage count ($C_{\mathrm{leak}}$) and a reduction in the API-only dependency ratio ($\rho_{\mathrm{api}}$).

- *Implicit Dependency Introduction:* Dependencies introduced through configuration, dependency injection wiring, or reflection without explicit declaration bypass architectural review. Over time, they erode the reliability of dependency models and increase the effort required to assess change impact. This failure mode is reflected by an increase in undeclared dependency references ($C_{\mathrm{undecl}}$) and by reduced module isolation test pass rates ($P_{\mathrm{iso}}$).

- *Bidirectional or Cyclic Dependencies:* Allowing modules to depend on each other directly or indirectly introduces cycles that prevent independent evolution. Cycles increase cognitive load and coordination cost and are expensive to remove once established. This anti-pattern is detected through forbidden dependency references ($C_{\mathrm{forbid}}$) and explicit cycle analysis of the module dependency graph.

- *Overloaded Module APIs:* Uncontrolled growth of a module's public surface leads to unstable interfaces and defensive design. Refactoring becomes increasingly risky, and internal structure gradually freezes. This failure mode is indicated by a declining API-only dependency ratio ($\rho_{\mathrm{api}}$) and sustained growth of the module's public API surface over time.

- *Feature-Centric Coupling Across Modules:* When features span multiple modules without clear ownership, features rather than modules become the primary unit of change. This pattern increases coordination cost and dilutes accountability. It is weakly visible in static dependencies but becomes evident through repeated cross-module co-changes and elevated architectural drift incidents.

These anti-patterns emerge when local convenience is prioritized over long-term change cost. G2 addresses them by enforcing explicit contracts, constraining dependency growth, and making structural erosion observable before it becomes irreversible.

## Metrics and Verification {#metrics-and-verification .unnumbered}

Maintainability in G2 is assessed through a set of explicit, measurable structural signals that capture boundary erosion, hidden coupling, and architectural drift over time. These metrics operationalize maintainability as a bounded cost of change by making the growth of coupling, dependency instability, and encapsulation violations observable and verifiable.

G2 builds directly on the enforcement model introduced in G1. While G1 establishes the correctness of modular boundaries, G2 uses quantitative signals to assess whether those boundaries remain effective as the system evolves. The quality measurement baseline derived from G1 (Section [\[sec:g1-enforce-modular-boundaries\]](#sec:g1-enforce-modular-boundaries){reference-type="ref" reference="sec:g1-enforce-modular-boundaries"}) is reused here as the foundation for maintainability verification.

- *Notation:* Let $M$ be the set of bounded-context modules. Let $R$ be the multiset of observed cross-module references, including static imports, dependency injection wiring, and event handlers. Let $D \subseteq M \times M$ be the set of declared allowed dependencies (*requires*) and $F \subseteq M \times M$ be the set of explicitly forbidden dependencies (*forbids*).

<!-- -->

- *Structural maintainability metrics:* The following metrics make boundary erosion and architectural drift observable using structural signals derived from cross-module references.

<!-- -->

- *Undeclared Dependency Reference Count:* $$C_{\mathrm{undecl}} = \left| \{ (A,B) \in R \mid (A,B) \notin D \} \right|$$ *Maintainability meaning:* measures hidden coupling introduced without architectural review.\
  *Verification intent:* ensure all cross-module dependencies are explicit and reviewable.\

- *Forbidden Dependency Reference Count:* $$C_{\mathrm{forbid}} = \left| \{ (A,B) \in R \mid (A,B) \in F \} \right|$$ *Maintainability meaning:* detects structurally disallowed coupling that violates architectural constraints.\
  *Verification intent:* preserve strict isolation where required and prevent dependency cycles.\

- *API-Only Dependency Ratio:* Let $R_{\mathrm{api}} \subseteq R$ be references targeting only the provider module's public surface: $$\rho_{\mathrm{api}} = \frac{|R_{\mathrm{api}}|}{|R|}$$ *Maintainability meaning:* indicates whether dependencies are routed through stable contracts rather than internal structures.\
  *Verification intent:* constrain change propagation and stabilize interaction surfaces.\

- *Encapsulation Leakage Count:* Let $R_{\mathrm{internal}} \subseteq R$ be references to internal packages or non-exported symbols: $$C_{\mathrm{leak}} = |R_{\mathrm{internal}}|$$ *Maintainability meaning:* quantifies boundary bypass that increases blast radius and refactoring risk.\
  *Verification intent:* enforce information hiding at the module boundary.

- *Module Isolation Test Pass Rate:* Let $T_{\mathrm{iso}}$ be the set of module isolation tests: $$P_{\mathrm{iso}} = \frac{|T_{\mathrm{pass}}|}{|T_{\mathrm{iso}}|}$$ *Maintainability meaning:* detects implicit coupling not visible through static analysis alone.\
  *Verification intent:* ensure modules can execute using only their declared dependencies.

- *Event Subscription Boundary Violations (when events are used):* Let $H$ be the set of event handlers in module $A$ consuming events from module $B$: $$C_{\mathrm{event}} = \left| \{ (A,B) \in H \mid (A,B) \notin D \} \right|$$ *Maintainability meaning:* captures undeclared coupling introduced through event-driven integration.\
  *Verification intent:* keep asynchronous collaboration explicit and auditable.

- *Boundary Bypass Surface Count (optional):* Let $S_{\mathrm{bypass}}$ be occurrences of bypass mechanisms within cross-module interaction paths: $$C_{\mathrm{bypass}} = |S_{\mathrm{bypass}}|$$ *Maintainability meaning:* indicates reliance on mechanisms that evade static boundary enforcement.\
  *Verification intent:* identify high-risk interaction paths that undermine architectural guarantees.

<!-- -->

- *Supplementary maintainability metrics:* Some maintainability risks emerge over time and are not fully captured by static dependency analysis alone. G2 therefore defines the following supplementary metrics to detect API inflation and feature-centric coupling.

<!-- -->

- *Public API Surface Growth Rate:* $$G_{\mathrm{api}}(m) = \frac{|API_m(t)| - |API_m(t - \Delta t)|}{\Delta t}$$ *Maintainability meaning:* sustained growth indicates increasing downstream obligations and reduced refactoring freedom.\
  *Action:* consolidate contracts, remove accidental exposure, or split responsibilities.

- *Change Coupling Index (optional):* Let $C(A,B)$ denote the number of commits where modules $A$ and $B$ change together within a defined time window: $$CCI = \frac{\sum_{A \neq B} C(A,B)}{\sum_{A} C(A)}$$ *Maintainability meaning:* high values indicate feature-centric coupling and blurred ownership boundaries.\
  *Action:* reassign responsibilities, introduce clearer module contracts, or refactor feature orchestration logic.

<!-- -->

- *Verification strategy and maintainability interpretation:* In G2, these metrics are treated as longitudinal signals of architectural health rather than isolated quality indicators. Increases in $C_{\mathrm{undecl}}$, $C_{\mathrm{leak}}$, or $C_{\mathrm{forbid}}$ indicate growing hidden coupling and rising cost of change. A declining $\rho_{\mathrm{api}}$ signals unstable dependency surfaces, while reductions in $P_{\mathrm{iso}}$ reveal erosion of modular isolation.

  By tracking these metrics over time and enforcing thresholds where appropriate, G2 enables early detection of architectural drift and supports timely refactoring while corrective actions remain localized and economically viable. The primary objective is not to eliminate change, but to ensure that its cost remains bounded as the system evolves.

## Documentation Guidelines {#documentation-guidelines .unnumbered}

- *Dependency Direction Map:* Maintain a visual or textual map of the allowed dependency direction between modules. This map complements G1's module descriptor by making the intended information flow explicit and reviewable during architectural discussions.

- *Contract Change Log:* Whenever a module's public surface changes (new handler, modified event schema, deprecated endpoint), record the change with version metadata. This log supports backward-compatibility analysis and informs downstream consumers of evolving contracts.

- *Architectural Drift Incidents:* When a metric threshold is crossed (e.g., $C_{\mathrm{undecl}} > 0$ or $\rho_{\mathrm{api}}$ drops below target), record the incident, root cause, and resolution. This creates a traceable history of maintainability interventions.

## Tooling Capabilities Checklist {#tooling-capabilities-checklist .unnumbered}

Any open-source or proprietary tool used to support maintainability should address:

- *Dependency Graph Visualization:* Generate and display the module dependency graph, highlighting cycles, undeclared dependencies, and forbidden references.

- *API Surface Analysis:* Track the size and growth rate of each module's public surface over time ($G_{\mathrm{api}}$).

- *Change Coupling Detection:* Identify modules that frequently change together across commits ($CCI$), signaling feature-centric coupling or blurred ownership.

- *Longitudinal Metric Tracking:* Store and visualize G2 metrics over time, enabling trend analysis and early detection of architectural drift.

- *Contract Compatibility Checking:* Verify that changes to a module's public surface do not break downstream consumers, ideally integrated into the CI pipeline.

## Reference Implementation {#reference-implementation .unnumbered}

G2's maintainability principles are demonstrated through the same Tiny Store reference implementation used in G1. The relevant structural artifacts are:

- `libs/modules/*/src/index.ts`: Module entrypoints that define the public surface for each bounded context

- `libs/shared/testing/src/module-boundary.spec.ts`: Boundary verification tests that enforce dependency direction and detect encapsulation leakage

- `apps/api/src/app/lib/register-listeners.ts`: Centralized event wiring that makes cross-module collaboration auditable

- `nx.json` and `.eslintrc.json`: Nx workspace configuration with `@nx/enforce-module-boundaries` rules

## Literature Support Commentary {#literature-support-commentary .unnumbered}

Although maintainability is a central topic in software engineering, much of the literature treats it either as an abstract principle or as a collection of localized code quality metrics. Recent empirical studies and systematic reviews emphasize that maintainability improvements in modular monoliths are primarily driven by boundary discipline and dependency management rather than deployment decomposition alone [@gravanis2021dont; @berry2024isItWorth; @blinowski2022monolithic].

Evolutionary architecture research further argues that architectural properties such as maintainability must be preserved through objective, executable constraints rather than informal guidance [@FordParsons2017]. The concept of *architectural fitness functions*, as popularized by ThoughtWorks [@thoughtworks2017fitnessfunction], operationalizes this perspective by defining automated checks that continuously verify whether the architecture satisfies its intended properties. G2 synthesizes these insights by framing maintainability as bounded cost of change and by providing concrete design mechanisms and measurable signals grounded in the boundary enforcement model established by G1.

## G2 Applied: Maintainability in the Tiny Store {#sec:g2-applied .unnumbered}

G1 answers a binary question: *are boundaries enforced right now?* A single failing boundary test is enough to detect and fix a violation. G2 asks a fundamentally different question: *are boundaries sustainable over time?* The answer is not binary but longitudinal; it emerges from tracking how dependency structure, API surface size, and change coupling evolve across commits, sprints, and releases. A system can pass every G1 check and still degrade in maintainability if convenience-driven shortcuts accumulate, public surfaces inflate, or dependency direction drifts silently.

This section operationalizes G2 using the Tiny Store reference implementation. Where G1's tutorial focused on the Orders--Inventory boundary, G2 shifts attention to the Payments and Shipments contexts, smaller modules whose evolution patterns reveal maintainability risks that are invisible to boundary checks alone. The tutorial introduces dependency graph analysis, API surface measurement, and change coupling detection as G2-specific tooling. The exercises demonstrate failure modes that *pass all G1 gates* yet degrade the longitudinal health metrics defined in G2.

## Reader Map {#reader-map .unnumbered}

This tutorial assumes the G1 baseline is passing and takes approximately 30 minutes. You will first learn to extract a dependency direction map and compute API surface metrics from the live codebase. Then you will run three exercises, each introducing a maintainability anti-pattern that is technically valid under G1 but produces a measurable signal under G2. The exercises use the Payments and Shipments modules exclusively, so there is no overlap with G1's Orders--Inventory walkthrough.

## Tutorial: Step-by-Step Application {#tutorial-step-by-step-application .unnumbered}

### Step 1: Extract the Dependency Direction Map {#step-1-extract-the-dependency-direction-map .unnumbered}

G2 requires that dependency direction reflects responsibility and information flow. The first maintainability-specific action is to extract and visualize the actual dependency graph, then compare it against the intended architecture.

``` {#lst:g2-dep-graph .bash language="bash" caption="Extract the module dependency graph" label="lst:g2-dep-graph"}
# Generate the Nx dependency graph (opens in browser)
npx nx graph

# For CI or scripted analysis, export as JSON:
npx nx graph --file=dep-graph.json
cat dep-graph.json | python3 -c "
import json, sys
g = json.load(sys.stdin)['graph']
for src, data in g['dependencies'].items():
    if 'modules-' in src:
        for dep in data:
            tgt = dep['target']
            if 'modules-' in tgt or 'shared-' in tgt:
                print(f'  {src} -> {tgt}')
"
```

In a healthy Tiny Store baseline, the output shows that every bounded-context module depends only on shared libraries. No module-to-module edge exists at the library level:

``` {#lst:g2-dep-baseline .bash language="bash" caption="Expected dependency direction (baseline)" label="lst:g2-dep-baseline"}
modules-orders    -> shared-domain
  modules-orders    -> shared-infrastructure
  modules-inventory -> shared-domain
  modules-inventory -> shared-infrastructure
  modules-payments  -> shared-domain
  modules-payments  -> shared-infrastructure
  modules-shipments -> shared-domain
  modules-shipments -> shared-infrastructure
```

Cross-module coupling exists only in the composition root (`register-listeners.ts`), which lives in `apps/api`, not inside any module. This is a G2 invariant: if a module-to-module edge appears in the dependency graph, it signals that coupling has migrated from the auditable composition root into module internals, violating unidirectional dependency flow.

### Step 2: Measure the API Surface per Module {#step-2-measure-the-api-surface-per-module .unnumbered}

G2 tracks the public API surface size ($|API_m|$) and its growth rate ($G_{\mathrm{api}}$) as longitudinal health signals. A growing surface creates downstream obligations and reduces refactoring freedom. Measure the current baseline:

``` {#lst:g2-api-surface .bash language="bash" caption="Count exported symbols per module" label="lst:g2-api-surface"}
for mod in orders inventory payments shipments; do
  count=$(grep -c "^export" \
    libs/modules/$mod/src/index.ts 2>/dev/null || echo 0)
  echo "$mod: $count exports"
done
```

Expected baseline output:

``` {#lst:g2-api-baseline .bash language="bash" caption="API surface baseline" label="lst:g2-api-baseline"}
orders:    9 exports   (4 handlers + 5 listeners)
inventory: 7 exports   (4 handlers + 3 listeners)
payments:  3 exports   (2 handlers + 1 listener)
shipments: 3 exports   (2 handlers + 1 listener)
```

These numbers form the $t_0$ snapshot for $G_{\mathrm{api}}$. In a CI pipeline, this count would be recorded per commit so that sustained growth triggers a review. Notice that Payments and Shipments have the smallest surfaces (3 exports each); they are lean contracts. G2's objective is to keep them that way as the system evolves.

### Step 3: Audit Cross-Module Wiring Density {#step-3-audit-cross-module-wiring-density .unnumbered}

G1 established that `register-listeners.ts` centralizes event subscriptions. G2 goes further by treating this file as a *coupling density indicator*: the number of cross-module subscription lines reflects the coordination cost of the system. Count them:

``` {#lst:g2-wiring-density .bash language="bash" caption="Count cross-module subscriptions" label="lst:g2-wiring-density"}
grep -c "eventBus.subscribe" \
  apps/api/src/app/lib/register-listeners.ts
# Baseline: ~19 subscriptions (13 event-store + 6 listener wiring)
```

This number is not inherently good or bad; it reflects the system's current collaboration complexity. The G2 concern is *growth rate*: if this count doubles after adding one feature, the wiring is likely feature-centric rather than bounded-context-oriented, signaling the "Feature-Centric Coupling" anti-pattern described in the failure modes section.

### Step 4: Compute $\rho_{\mathrm{api}}$ from the Composition Root {#step-4-compute-rho_mathrmapi-from-the-composition-root .unnumbered}

The API-only dependency ratio ($\rho_{\mathrm{api}}$) measures whether cross-module references target public entrypoints or internal paths. In Tiny Store, all imports in `register-listeners.ts` use the public path `@tiny-store/modules-*`:

``` {#lst:g2-rho-api .TypeScript language="TypeScript" caption="All composition root imports use public entrypoints" label="lst:g2-rho-api"}
import { OrderPlacedListener } from '@tiny-store/modules-inventory';
import { InventoryReservedListener } from '@tiny-store/modules-orders';
import { OrderConfirmedListener } from '@tiny-store/modules-payments';
import { OrderPaidListener } from '@tiny-store/modules-shipments';
```

None of these imports target internal paths (e.g., `@tiny-store/modules-payments/src/domain/...`). With all cross-module references routing through public surfaces, $\rho_{\mathrm{api}} = 1.0$. Any deviation from 1.0 means an internal path has leaked into the composition root, a maintainability regression that G1's boundary tests may not catch if the import resolves correctly at runtime.

### Step 5: Detect Change Coupling via Co-Change Analysis {#step-5-detect-change-coupling-via-co-change-analysis .unnumbered}

G2 defines the Change Coupling Index ($CCI$) as a supplementary metric that captures modules changing together across commits. This is not detectable by static analysis; it requires commit history:

``` {#lst:g2-cci .bash language="bash" caption="Detect co-changing modules in recent commits" label="lst:g2-cci"}
# List modules touched per commit, flag co-changes
git log --oneline -50 --name-only | \
  awk '/^[a-f0-9]/{commit=$1; next}
       /^libs\/modules\//{split($0,a,"/"); mods[commit][a[3]]}
       END{for(c in mods) if(length(mods[c])>1)
         print c, ":", length(mods[c]), "modules"}'
```

In a healthy codebase, most commits touch a single module. When Payments and Shipments consistently change together (e.g., every shipment feature also modifies payment logic), it indicates that responsibility boundaries are blurred, even if no import violations exist. This is precisely the kind of degradation G2 is designed to surface: structurally valid code with economically unsustainable change patterns.

### Step 6: Understand the Longitudinal Perspective {#step-6-understand-the-longitudinal-perspective .unnumbered}

The key distinction between G1 and G2 enforcement is *when* degradation becomes visible. G1 catches violations at the moment they are introduced (a failing test, a lint error). G2 catches degradation that accumulates over time: a public surface that grows by one export per sprint, a $\rho_{\mathrm{api}}$ that drops from 1.0 to 0.95 to 0.87 across releases, a $CCI$ that rises as features span more modules.

This means G2 metrics must be *tracked*, not just *checked*. The recommended practice is to record the following values at each release milestone:

- $|API_m|$ per module (from Step 2)

- $\rho_{\mathrm{api}}$ (from Step 4)

- Wiring density in `register-listeners.ts` (from Step 3)

- $CCI$ over the most recent $N$ commits (from Step 5)

A single anomalous value is not alarming. A sustained trend (three consecutive sprints where Payments' surface grows, or $\rho_{\mathrm{api}}$ declines monotonically) triggers an architectural review. This longitudinal framing is what separates G2 from G1: boundaries are not just correct, but *economically sustainable*.

## Exercise Walkthrough: Controlled Maintainability Degradation {#exercise-walkthrough-controlled-maintainability-degradation .unnumbered}

The exercises below differ fundamentally from G1's exercises. G1 introduced violations that immediately fail a boundary check (binary signal). G2 introduces changes that *pass all G1 gates* but degrade maintainability metrics over time (longitudinal signal). Each exercise uses the Payments or Shipments module to avoid overlap with G1's Orders--Inventory examples.

### Exercise 0: Establish the G2 Maintainability Baseline {#exercise-0-establish-the-g2-maintainability-baseline .unnumbered}

Record the starting values for all G2 metrics. These form the $t_0$ reference against which degradation is measured.

``` {#lst:g2-ex0 .bash language="bash" caption="G2 maintainability baseline" label="lst:g2-ex0"}
# 1. Confirm G1 gates still pass
npm run test:boundary && npm run test:integration

# 2. Record API surface sizes
for mod in orders inventory payments shipments; do
  echo "$mod: $(grep -c '^export' \
    libs/modules/$mod/src/index.ts) exports"
done
# payments: 3, shipments: 3

# 3. Record rho_api
grep -c "@tiny-store/modules-" \
  apps/api/src/app/lib/register-listeners.ts
# All via public entrypoints -> rho_api = 1.0

# 4. Record dependency graph (no module-to-module edges)
npx nx graph --file=dep-graph.json
```

Baseline: $|API_{\mathrm{payments}}| = 3$, $|API_{\mathrm{shipments}}| = 3$, $\rho_{\mathrm{api}} = 1.0$, $C_{\mathrm{forbid}} = 0$, zero module-to-module edges.

### Exercise 1: Convenience Shortcut That Passes G1 ($\rho_{\mathrm{api}}\downarrow$, $C_{\mathrm{undecl}}\uparrow$) {#exercise-1-convenience-shortcut-that-passes-g1-rho_mathrmapidownarrow-c_mathrmundecluparrow .unnumbered}

A developer working on the Shipments module needs the `PaymentStatus` enum to decide whether to hold a shipment. Instead of enriching the event payload or introducing a query contract, they take a shortcut that *technically passes G1's boundary tests* because it imports from Payments' `index.ts`, but the imported symbol should never have been exported (it was added "temporarily" in an earlier commit).

*What you change:*

First, in `libs/modules/payments/src/index.ts`, add a seemingly harmless re-export:

``` {#lst:g2-ex1-step1 .TypeScript language="TypeScript" caption="Step 1: Payments exports an internal enum" label="lst:g2-ex1-step1"}
// "Temporary" export added for cross-module convenience
export * from './domain/enums/payment-status.enum';
```

Then, in `libs/modules/shipments/src/features/create-shipment/service.ts`, consume it:

``` {#lst:g2-ex1-step2 .TypeScript language="TypeScript" caption="Step 2: Shipments depends on Payments' internal type" label="lst:g2-ex1-step2"}
import { PaymentStatus } from '@tiny-store/modules-payments';

// Now create-shipment logic checks payment status directly
if (paymentStatus !== PaymentStatus.SUCCEEDED) {
  throw new Error('Cannot ship unpaid order');
}
```

*What you run:*

``` {#lst:g2-ex1-run .bash language="bash" caption="Verify G1 passes but G2 degrades" label="lst:g2-ex1-run"}
# G1 gate: PASSES (import uses public entrypoint)
npm run test:boundary
# All green -- G1 sees no violation

# G2 metrics: DEGRADED
# 1. API surface grew
grep -c "^export" libs/modules/payments/src/index.ts
# Was 3, now 4 -> G_api(payments) = +1

# 2. Dependency graph gained a module-to-module edge
npx nx graph --file=dep-graph.json
# New edge: modules-shipments -> modules-payments
# This edge did NOT exist at baseline

# 3. rho_api still 1.0 (import uses public path)
# BUT the dependency is structurally new and undeclared
# C_undecl rises from 0 to 1
```

*Why this matters for G2:* The Nx dependency graph now shows `modules-shipments `$\rightarrow$` modules-payments`, a direct module-to-module edge that did not exist at baseline. G1 does not flag this because the import resolves through a public entrypoint. But G2 detects it as architectural drift: Shipments can no longer evolve independently of Payments' domain model. A refactoring of `PaymentStatus` now forces a coordinated change across two bounded contexts. The cost of change has increased, even though no boundary test failed.

*Fix:* Remove the enum export from Payments' `index.ts`. If Shipments needs payment-readiness information, enrich the `OrderPaid` event payload to include the relevant status, keeping the interaction contract-based rather than type-coupled.

### Exercise 2: Transitive Orchestration in the Composition Root ($C_{\mathrm{forbid}}\uparrow$, blast radius) {#exercise-2-transitive-orchestration-in-the-composition-root-c_mathrmforbiduparrow-blast-radius .unnumbered}

The composition root in `register-listeners.ts` already contains a pattern where the `OrderPaid` handler queries Orders for the shipping address before invoking Shipments' `CreateShipmentHandler`. A developer extends this pattern by also querying Payments to check whether the payment was refunded before creating the shipment. This creates a transitive coupling chain that spans three modules in a single event handler.

*What you change:* In `register-listeners.ts`, modify the `OrderPaid` subscription to query Payments before creating a shipment:

``` {#lst:g2-ex2-violation .TypeScript language="TypeScript" caption="Violation: three-module orchestration in one handler" label="lst:g2-ex2-violation"}
import { GetPaymentHandler } from '@tiny-store/modules-payments';

// In registerListeners():
const getPaymentHandler = new GetPaymentHandler(dataSource);

eventBus.subscribe('OrderPaid', async (event) => {
  const { orderId } = event.payload;
  // Query Payments to verify payment is not refunded
  const payment = await getPaymentHandler.handle(orderId);
  if (payment.status === 'REFUNDED') return;
  // Then query Orders for shipping address
  const order = await getOrderHandler.handle(orderId);
  await createShipmentHandler.handle({
    orderId,
    shippingAddress: order.shippingAddress,
  });
});
```

*What you run:*

``` {#lst:g2-ex2-run .bash language="bash" caption="Detect coupling density increase" label="lst:g2-ex2-run"}
# G1 gate: PASSES (composition root may import any public surface)
npm run test:boundary
# All green

# G2 analysis: coupling density and direction
# Count handler instantiations in composition root:
grep -c "new.*Handler" \
  apps/api/src/app/lib/register-listeners.ts
# Was 4, now 5 -> wiring density increased

# Trace the transitive dependency chain:
# OrderPaid -> getPaymentHandler (Payments)
#           -> getOrderHandler (Orders)
#           -> createShipmentHandler (Shipments)
# Three modules are now coupled in a single event handler
```

*Why this matters for G2:* No boundary test fails. But the `OrderPaid` handler now orchestrates three modules in sequence, creating a transitive dependency chain. If any of the three handlers changes its return type, the composition root breaks, and because the logic is interleaved in a single subscription, the blast radius spans Payments, Orders, and Shipments simultaneously. This violates G2's *change locality* principle: a modification in Payments' response shape forces changes in code that nominally belongs to the Shipments workflow. The wiring density metric captures the growth, and a $C_{\mathrm{forbid}}$ increment is warranted if peer modules are declared as forbidden transitive dependencies.

*Fix:* Enrich the `OrderPaid` event payload to include all data Shipments needs (shipping address, payment status). The composition root should wire events to handlers, not orchestrate multi-module queries. If orchestration is necessary, extract it into a dedicated saga or process manager with explicit ownership.

### Exercise 3: Gradual Public Surface Bloat ($G_{\mathrm{api}}\uparrow$) {#exercise-3-gradual-public-surface-bloat-g_mathrmapiuparrow .unnumbered}

Demonstrate how a module's public surface can inflate with *legitimate* exports (valid handlers, not internal entities) while every G1 check remains green. The danger is not *what kind* of symbol is exported, but *how many*: each new public symbol is a downstream obligation that freezes internal design choices.

*What you change:* In `libs/modules/payments/src/index.ts`, add five new handlers that are perfectly valid public capabilities:

``` {#lst:g2-ex3-violation .TypeScript language="TypeScript" caption="Surface bloat: valid but excessive exports" label="lst:g2-ex3-violation"}
// libs/modules/payments/src/index.ts
// --- existing exports (3 symbols) ---
export * from './features/process-payment/handler';
export * from './features/get-payment/handler';
export * from './listeners/order-confirmed.listener';

// --- NEW: 5 additional query handlers in one sprint ---
export * from './features/get-payments-by-order/handler';
export * from './features/get-payments-by-status/handler';
export * from './features/get-payments-by-date/handler';
export * from './features/refund-payment/handler';
export * from './features/retry-payment/handler';
```

*What you run:*

``` {#lst:g2-ex3-run .bash language="bash" caption="Measure surface inflation" label="lst:g2-ex3-run"}
# G1 gate: PASSES (all exports are handlers, not internals)
npm run test:boundary
# All green -- no encapsulation leak, no forbidden import

# G2 metric: API surface
grep -c "^export" libs/modules/payments/src/index.ts
# Was 3, now 8 -> G_api(payments) = +5 in one sprint
# |API_payments| grew from 3 to 8 (167% increase)
```

*Why this matters for G2:* The Payments module went from a lean 3-symbol contract to an 8-symbol surface in a single sprint. Every exported handler is a contract that downstream consumers may depend on. Once another module or the composition root begins using `GetPaymentsByStatusHandler`, Payments can no longer rename, restructure, or remove that handler without coordinating a cross-module change. The module's internal refactoring freedom shrinks with each export. Over three sprints, if each adds 2 exports, $G_{\mathrm{api}}(\mathrm{payments}) \approx 2/\mathrm{sprint}$, a sustained growth rate that warrants consolidation.

G1 cannot detect this: every exported symbol is a handler (not an entity or repository), so $C_{\mathrm{leak}} = 0$. The issue is purely quantitative (*how much* surface, not *what kind*) and requires the longitudinal $G_{\mathrm{api}}$ metric to become visible.

*Fix:* Remove exports that are consumed only within the module's own HTTP adapter or feature code. Expose only handlers that external modules actually invoke through the composition root. Set a $G_{\mathrm{api}}$ threshold (e.g., $\leq 5$ for lean modules like Payments) in CI to catch surface inflation early.

### Exercise Summary {#exercise-summary .unnumbered}

  --------- ---------------------------------------------- ----------------------------- ------------------------------------------------------- ---------------
  **Ex.**   **What you change**                            **Run**                       **G2 signal**                                           **G1 status**

  0         Record baseline metrics                        API count, `nx graph`, CCI    $t_0$ snapshot                                          pass

  1         Payments exports enum, Shipments consumes it   `nx graph`, API count         $C_{\mathrm{undecl}}\uparrow$, new edge                 pass

  2         Composition root orchestrates 3 modules        wiring density, chain trace   blast radius $\times 3$                                 pass

  3         Payments exports 5 valid handlers              API count                     $G_{\mathrm{api}}\uparrow$ (3$\to$`<!-- -->`{=html}8)   pass
  --------- ---------------------------------------------- ----------------------------- ------------------------------------------------------- ---------------

*Key observation:* All three exercises pass G1's `test:boundary` gate. The degradation is only visible through G2's longitudinal metrics: dependency graph edges, API surface counts, wiring density, and change coupling analysis. This confirms that boundary correctness (G1) and boundary sustainability (G2) are complementary but distinct architectural concerns.

## Conclusion of the G2 Implementation {#conclusion-of-the-g2-implementation .unnumbered}

This section demonstrated that maintainability in a modular monolith cannot be reduced to boundary enforcement alone. G1 ensures that boundaries are *correct* at any given moment; G2 ensures that they remain *economically sustainable* over time. The distinction is practical: a system can pass every boundary test while accumulating convenience-driven type coupling, inflated API surfaces, and feature-centric wiring that progressively raises the cost of change.

The tutorial introduced maintainability-specific tooling (dependency graph extraction, API surface counting, wiring density measurement, and co-change analysis) that operationalizes G2's metrics on a real codebase. The exercises showed that each failure mode produces a specific, measurable signal: a new module-to-module edge that did not exist at baseline ($C_{\mathrm{undecl}}$), a transitive orchestration chain that expands the blast radius of composition root changes, and a growing public surface that creates contractual obligations faster than the module can absorb them ($G_{\mathrm{api}}$). None of these violations were caught by G1's boundary tests; they required longitudinal tracking to become visible.

Together, G1 and G2 establish a layered defense for progressive scalability. G1 provides the immediate, binary gate that prevents structural violations. G2 provides the longitudinal, quantitative signals that detect gradual erosion before it becomes irreversible. With both guidelines in place, the architecture retains the option to evolve incrementally (adding modules, extracting services, or scaling selectively) while keeping the cost of change bounded and predictable as the system grows.
