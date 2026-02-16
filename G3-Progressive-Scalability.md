# G3: Design for Progressive Scalability {#sec:g3-design-progressive-scalability}

This section presents G3, which focuses on designing modular monoliths so that scalability is achieved progressively rather than through premature distribution. In this dissertation, *progressive scalability* is defined as the capacity of a modular monolith to accommodate increasing load, data volume, and organizational growth through a deliberate sequence of architectural interventions, each proportional to the observed need, without requiring a wholesale migration to a distributed architecture. G3 operationalizes this capacity by identifying module-level scale points, introducing asynchronous boundaries where load demands diverge, and abstracting infrastructure dependencies so that extraction remains a controlled option rather than an emergency.

G3 completes the Architectural Design Dimension (G1--G3). While G1 enforces modular boundaries and G2 preserves maintainability through bounded cost of change, G3 ensures that the resulting modular structure can absorb growth without collapsing into either a monolithic bottleneck or a premature microservices decomposition. Together, these three guidelines establish the structural foundation upon which the Operational Fit, Organizational Alignment, and Guideline Orientation dimensions build.

## Intent and Rationale {#intent-and-rationale .unnumbered}

The prevailing narrative in cloud-native literature frames scalability as an inherently distributed concern: when the system must scale, it must be decomposed into independently deployable services [@arya2024beyond; @blinowski2022monolithic]. This framing creates a false dichotomy. Teams are implicitly told to choose between a monolith that cannot scale and microservices that can, ignoring the intermediate architectural states that a well-modularized monolith can occupy.

In practice, most early-stage systems do not face uniform scaling pressure. Load concentrates in specific modules, specific use cases exhibit disproportionate growth, and specific data domains expand faster than others. A system designed for progressive scalability acknowledges this unevenness and provides mechanisms to address it surgically, scaling the modules that need it while leaving the rest undisturbed.

G3 therefore treats scalability as a *gradient* rather than a binary switch. The guideline proposes that a modular monolith can traverse a scalability spectrum through deliberate, reversible interventions:

1.  *Vertical optimization within the monolith:* resource tuning, query optimization, caching, and concurrency improvements applied to specific modules without structural change.

2.  *Asynchronous decoupling of hot paths:* introducing message queues or event streams between modules whose throughput requirements diverge, converting synchronous bottlenecks into buffered pipelines.

3.  *Data isolation for divergent modules:* separating persistence for modules whose data access patterns, volume, or consistency requirements no longer fit a shared schema.

4.  *Selective extraction of bounded contexts:* deploying individual modules as independent services only when the preceding interventions are insufficient and the operational cost is justified.

This spectrum makes the migration to microservices an *option*, not an obligation. Each step is proportional to observed need, reversible if conditions change, and grounded in the boundary enforcement (G1) and maintainability discipline (G2) already established. The key insight is that a system with enforced modular boundaries and stable contracts is *already extraction-ready*; what G3 adds is the deliberate preparation of infrastructure seams, established from project inception, that make extraction low-risk when evidence warrants it.

## Conceptual Overview {#conceptual-overview .unnumbered}

Progressive scalability is embedded by designing modules so that growth is absorbed incrementally:

- Each module's resource consumption, throughput profile, and data growth trajectory are observable and attributable, enabling evidence-based scaling decisions.

- Communication between modules with divergent scaling needs can transition from synchronous to asynchronous without rewriting business logic.

- Persistence is designed so that schema ownership can be narrowed from shared to module-scoped without data migration crises.

- Infrastructure dependencies (databases, caches, queues, external APIs) are accessed through abstractions that decouple business logic from deployment topology.

## Applicability Conditions and Scope {#applicability-conditions-and-scope .unnumbered}

G3 applies to modular monolith systems that satisfy the following conditions:

- Module boundaries are enforced and dependencies are explicit, as established by G1.

- Maintainability discipline is in place, ensuring that contracts are stable and change locality is preserved, as established by G2.

- The system is expected to grow in load, data volume, or team size, but the timing and distribution of that growth are uncertain.

G3 does not prescribe specific cloud providers, container orchestrators, or scaling technologies. Its scope is limited to architectural preparation: the design decisions and structural properties that make scaling interventions feasible, proportional, and reversible. The guideline is agnostic to whether the system ultimately remains a monolith, becomes a set of microservices, or stabilizes at an intermediate state.

## Objectives {#objectives .unnumbered}

- *Identify module-level scale points:* Determine which modules are likely to experience disproportionate load, data growth, or throughput demands, and make these scale points visible in the architecture.

- *Enable asynchronous decoupling:* Design inter-module communication so that synchronous call paths can be replaced with asynchronous channels without modifying domain logic or violating module contracts.

- *Establish data isolation from inception:* Structure persistence so that each module owns a dedicated schema from the first deployment, ensuring that extraction never requires data migration.

- *Abstract infrastructure dependencies:* Ensure that modules interact with infrastructure (databases, caches, message brokers, external services) through ports or interfaces that can be re-bound to different implementations without changing business logic.

- *Preserve extraction optionality:* Maintain the ability to extract any bounded context as an independent service, without this extraction being a prerequisite for scaling.

## Key Principles {#key-principles .unnumbered}

- *Scale where it hurts, not where it might:* Scaling interventions should be driven by observed bottlenecks, not by speculative anticipation. Module-level metrics (see Metrics section) provide the evidence base. Premature optimization of modules that are not under pressure introduces unnecessary complexity and operational cost.

- *Asynchronous boundaries as scalability seams:* The boundary between two modules becomes a scalability seam when their throughput requirements diverge. Introducing an asynchronous channel (event bus, message queue) at this seam absorbs load spikes in the producer without propagating backpressure to the consumer, and vice versa. The key constraint is that asynchronous boundaries must respect the contracts established in G1 and the stability properties maintained by G2.

- *Schema isolation is established from project inception:* Each module owns a dedicated PostgreSQL schema from the first deployment. Cross-module data access is mediated exclusively through published contracts (events or API calls), never through direct table queries. This design decision, made at project inception rather than deferred to a future migration, ensures that data isolation is a structural property of the system rather than a prerequisite to be satisfied before extraction.

- *Infrastructure as a replaceable dependency:* Modules should depend on infrastructure through ports (interfaces) rather than concrete implementations. This is not an abstract design preference but a scalability prerequisite: when a module must move from an in-process event bus to a distributed message broker, or from a shared PostgreSQL instance to a dedicated read replica, the change should be confined to the infrastructure adapter, not the domain logic.

- *Extraction is the last resort, not the first reflex:* Extracting a module into an independent service introduces network boundaries, distributed failure modes, deployment complexity, and operational overhead. G3 positions extraction at the end of the scalability spectrum, after vertical optimization, async decoupling, and data isolation have been exhausted or proven insufficient. This ordering preserves system simplicity for as long as possible while ensuring that extraction remains feasible when genuinely needed.

## The Progressive Scalability Spectrum {#the-progressive-scalability-spectrum .unnumbered}

To make the gradient concrete, G3 proposes a four-level spectrum that teams can use to assess their current position and plan their next proportional intervention. Each level builds on the previous one, and progression is driven by evidence rather than anticipation.

::: {#tab:scalability-spectrum}
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Level**   **Intervention**        **Description**                                                                                                                                 **Trigger Condition**
  ----------- ----------------------- ----------------------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------
  L0          Vertical Optimization   Resource tuning, caching, query optimization, concurrency improvements within the monolith. No structural change.                               Module-level latency or throughput degradation detected.

  L1          Async Decoupling        Replace synchronous inter-module calls with asynchronous channels (event bus, message queue) for modules with divergent throughput.             Synchronous calls between modules create backpressure or latency spikes under load.

  L2          Data Isolation          Separate module-scoped persistence (dedicated schemas, read replicas, or separate databases) for modules with divergent data access patterns.   Shared database contention, conflicting consistency requirements, or schema evolution friction.

  L3          Selective Extraction    Deploy a bounded context as an independent service with its own runtime, persistence, and deployment pipeline.                                  L0--L2 exhausted; module requires independent scaling, independent release cadence, or technology heterogeneity.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  : Progressive Scalability Spectrum for Modular Monoliths
:::

The spectrum is not strictly linear: a team may apply L2 (data isolation) to one module while another module remains at L0. The key constraint is that each intervention at a given level should be justified by evidence that the previous level is insufficient for the module in question.

## Reference Implementation: Built-In Scalability Infrastructure {#reference-implementation-built-in-scalability-infrastructure .unnumbered}

The Tiny Store reference implementation demonstrates that progressive scalability infrastructure is embedded from day one as an architectural requirement, not added later as a scaling patch. The following code listings show the actual production code that ships with the initial deployment.

### L0: Vertical Optimization: Module-Scoped Caching {#l0-vertical-optimization-module-scoped-caching .unnumbered}

Tiny Store includes a Redis-backed caching layer from day one, not as an optimization added under pressure. The `CacheService` enforces module-namespaced keys, ensuring that cache entries are isolated per bounded context and can be invalidated independently.

``` {#lst:cache-service .TypeScript language="TypeScript" caption="CacheService with module-namespaced keys (cache.service.ts)" label="lst:cache-service"}
export class CacheService {
  private client: Redis;
  private defaultTtl: number;
  private globalPrefix: string;

  private buildKey(module: string, key: string): string {
    return `${this.globalPrefix}:${module}:${key}`;
  }

  async get<T>(module: string, key: string): Promise<T | null> {
    const raw = await this.client.get(this.buildKey(module, key));
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  }

  async set<T>(module: string, key: string, value: T,
               ttlSeconds?: number): Promise<void> {
    const fullKey = this.buildKey(module, key);
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.client.set(fullKey, JSON.stringify(value), 'EX', ttl);
  }

  async invalidatePattern(module: string, pattern: string): Promise<void> {
    const keys = await this.client.keys(this.buildKey(module, pattern));
    if (keys.length > 0) await this.client.del(...keys);
  }
}
```

A read-through caching decorator applies this pattern declaratively to any module method:

``` {#lst:cache-decorator .TypeScript language="TypeScript" caption="Read-through caching decorator (cache.decorator.ts)" label="lst:cache-decorator"}
export function Cacheable(
  module: string, ttlSeconds: number,
  keyFn: (...args: any[]) => string,
) {
  return function (_target: any, _propertyKey: string,
                   descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache = CacheService.getInstance();
      const key = keyFn(...args);
      const cached = await cache.get(module, key);
      if (cached !== null) return cached;
      const result = await original.apply(this, args);
      await cache.set(module, key, result, ttlSeconds);
      return result;
    };
    return descriptor;
  };
}
// Usage: @Cacheable('inventory', 60, (sku) => `product:${sku}`)
```

The key design decision is that the cache layer exists from the first deployment. When vertical optimization becomes necessary (L0 trigger), the team enables caching on specific queries by adding a decorator; no infrastructure provisioning or architectural change is required.

### L1: Async Decoupling: Module-Scoped Queues {#l1-async-decoupling-module-scoped-queues .unnumbered}

Asynchronous processing is an architectural requirement, not a scaling patch. The `QueueService` provides module-scoped BullMQ queues following the convention `module:purpose`:

``` {#lst:queue-service .TypeScript language="TypeScript" caption="QueueService with module-scoped queues (queue.service.ts)" label="lst:queue-service"}
export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  /** Convention: `module:purpose` e.g. `orders:fulfillment` */
  createQueue(name: string): Queue {
    if (this.queues.has(name)) return this.queues.get(name)!;
    const queue = new Queue(name, { connection: getQueueConnection() });
    this.queues.set(name, queue);
    return queue;
  }

  async addJob<T>(queueName: string, data: T,
                  opts?: JobsOptions): Promise<Job<T>> {
    const queue = this.createQueue(queueName);
    return queue.add(queueName, data, opts);
  }

  createWorker<T>(queueName: string, handler: Processor<T>): Worker<T> {
    if (this.workers.has(queueName))
      return this.workers.get(queueName)! as Worker<T>;
    const worker = new Worker<T>(queueName, handler, {
      connection: getQueueConnection(),
    });
    this.workers.set(queueName, worker);
    return worker;
  }
}
```

Listing [\[lst:email-job\]](#lst:email-job){reference-type="ref" reference="lst:email-job"} shows a concrete use case: order confirmation emails are enqueued asynchronously with exponential backoff, decoupling the critical path (order placement) from the non-critical side effect (email delivery).

``` {#lst:email-job .TypeScript language="TypeScript" caption="Order confirmation email job with async decoupling (order-confirmation-email.job.ts)" label="lst:email-job"}
const QUEUE_NAME = 'orders:confirmation-email';

export function registerOrderConfirmationWorker(): void {
  const queueService = QueueService.getInstance();
  queueService.createWorker<OrderConfirmationData>(
    QUEUE_NAME,
    async (job: Job<OrderConfirmationData>) => {
      const { orderId, customerEmail, orderTotal } = job.data;
      // In production: await emailService.send(...)
      return { sent: true, orderId };
    },
  );
}

export async function enqueueOrderConfirmation(
  data: OrderConfirmationData,
): Promise<void> {
  const queueService = QueueService.getInstance();
  await queueService.addJob(QUEUE_NAME, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}
```

Because BullMQ and Redis are present from day one, the team can introduce async decoupling for any inter-module interaction by defining a new queue; no infrastructure migration is required.

### L2: Data Isolation: Per-Module PostgreSQL Schemas {#l2-data-isolation-per-module-postgresql-schemas .unnumbered}

Schema isolation is a design decision made at project inception. Each module owns its data from the first deployment, ensuring that extraction never requires data migration. The `schema-isolation.ts` module creates per-module PostgreSQL schemas and provides module-scoped `DataSource` connections with isolated `search_path`:

``` {#lst:schema-isolation .TypeScript language="TypeScript" caption="Per-module PostgreSQL schema isolation (schema-isolation.ts)" label="lst:schema-isolation"}
const MODULE_SCHEMAS = ['orders', 'inventory', 'payments', 'shipments'];
export type ModuleName = (typeof MODULE_SCHEMAS)[number];

export async function createAllModuleSchemas(
  dataSource: DataSource,
): Promise<void> {
  for (const mod of MODULE_SCHEMAS) {
    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${mod}"`);
  }
}

export async function getModuleConnection(
  baseOptions: DataSourceOptions,
  moduleName: ModuleName,
  entities: Function[],
): Promise<DataSource> {
  const options: DataSourceOptions = {
    ...baseOptions,
    name: `module-${moduleName}`,
    schema: moduleName,
    entities,
    ...(baseOptions.type === 'postgres' ? {
      extra: {
        ...baseOptions.extra,
        options: `-c search_path="${moduleName}",public`,
      },
    } : {}),
  } as DataSourceOptions;

  const ds = new DataSource(options);
  await ds.initialize();
  return ds;
}
```

Each module operates within its own PostgreSQL schema from the first `docker-compose up`. Cross-module data access is mediated through published contracts (events or API calls), never through direct table queries. When L3 extraction occurs, the module's schema migrates to a dedicated database instance, a deployment topology change, not a data migration.

### Extraction Readiness Score {#extraction-readiness-score .unnumbered}

The readiness score provides the evidence that drives progression decisions. Tiny Store includes an automated extraction readiness calculator that scores each module across five dimensions:

``` {#lst:readiness-score .TypeScript language="TypeScript" caption="Extraction readiness scoring dimensions (extraction-readiness.ts)" label="lst:readiness-score"}
// Scoring dimensions (total: 100 points)
const checks: CheckResult[] = [
  checkCrossModuleImports(moduleName),  // 25pts: 0 imports = full score
  checkEventBusUsage(moduleName),       // 20pts: events + listeners
  checkACLLayer(moduleName),            // 15pts: anti-corruption layer
  checkDatabaseSchema(moduleName),      // 20pts: dedicated schema
  checkVersionedEvents(moduleName),     // 20pts: versioned contracts
];

// Readiness thresholds
if (percentage >= 80) console.log('READY for extraction');
else if (percentage >= 60) console.log('NEARLY READY');
else if (percentage >= 40) console.log('PARTIAL -- significant work needed');
else console.log('NOT READY -- major refactoring required');
```

Example output for the orders module:

    Extraction Readiness Score: orders
    ==================================================
    Cross-module imports [==========] 25/25
      No cross-module imports found
    Event-driven communication [==========] 20/20
      Events: yes, Listeners: yes
    ACL layer [==========] 15/15
      ACL adapter found for orders
    Database schema isolation [==========] 20/20
      Schema 'orders' configured
    Versioned event contracts [=====-----] 10/20
      Event contracts exist but no versioning
    ==================================================
    TOTAL SCORE: 90/100 (90/100)
    READY for extraction

The readiness score quantifies the $\varepsilon_m$ metric defined in the Metrics section. Teams run this check before any L3 extraction decision, ensuring that extraction is evidence-based rather than intuition-driven.

G3 is implemented through the following architectural mechanisms, all established from project inception:

- *Module-scoped resource profiling:* Each module's resource consumption (CPU, memory, I/O, query volume) is attributable through instrumentation or naming conventions, enabling identification of scale points without distributed tracing.

- *Communication abstraction layer:* Inter-module communication passes through a contract-based abstraction (e.g., an event bus interface or a command dispatcher) that can be backed by in-process dispatch, an in-memory queue, or a distributed broker without changing the caller or handler.

- *Persistence port pattern:* Each module accesses its data through repository interfaces (ports) backed by a dedicated PostgreSQL schema from project inception. The concrete implementation is injected at composition time; when a module is extracted (L3), the repository adapter is re-bound to a dedicated database instance without changing domain logic. Schema ownership is documented in the module descriptor introduced in G1.

- *Scalability decision records:* When a module transitions between spectrum levels (e.g., from L0 to L1), the decision is recorded in an Architecture Decision Record (ADR) that captures the trigger condition, the intervention applied, the expected outcome, and the rollback path. This ensures that scaling decisions remain traceable and reversible.

## Common Failure Modes and Anti-Patterns {#common-failure-modes-and-anti-patterns .unnumbered}

- *Premature Distribution ("Microservices Envy"):* Extracting modules into services before exhausting in-process optimizations. This introduces distributed-system complexity (network latency, partial failures, eventual consistency) without evidence that distribution is necessary. The cost is disproportionate to the benefit, particularly for early-stage teams with limited operational maturity [@gravanis2021dont; @su2024from].

- *Uniform Scaling Assumption:* Treating all modules as having identical scaling requirements and applying the same intervention (e.g., horizontal replication of the entire monolith) uniformly. This wastes resources on modules that are not under pressure and delays targeted intervention for the modules that are.

- *Shared Database as Implicit Coupling:* Allowing modules to query each other's tables directly, creating an invisible dependency that prevents data isolation (L2) and makes extraction (L3) require a coordinated schema migration. This anti-pattern often accumulates silently because it does not violate code-level boundary checks.

- *Synchronous Call Chains Under Load:* Maintaining synchronous inter-module communication paths for workflows that exhibit high throughput variance. Under load, synchronous chains propagate latency and failures upstream, creating cascading degradation that appears as a system-wide outage rather than a localized bottleneck.

- *Infrastructure Lock-In Through Concrete Dependencies:* Embedding infrastructure-specific code (e.g., direct database driver calls, cloud SDK invocations) in domain or application logic. This prevents the module from transitioning between spectrum levels without rewriting business logic, effectively freezing the architecture at its current scale point.

## Metrics and Verification {#metrics-and-verification .unnumbered}

G3 metrics are designed to make scaling pressure observable at the module level and to verify that the architectural preparation for progressive scalability is in place. They complement the structural metrics defined in G1 and G2 by adding resource, throughput, and isolation dimensions.

- *Module Throughput Profile ($\Theta_m$):* For each module $m$, the sustained request rate (operations per second) under normal and peak conditions. Divergence between modules indicates candidates for async decoupling (L1). $$\Delta\Theta = \max_{m \in M} \Theta_m - \min_{m \in M} \Theta_m$$ *Scalability meaning:* high $\Delta\Theta$ indicates uneven load distribution and potential synchronous bottlenecks.\

- *Module Latency Variance ($\sigma^2_{L,m}$):* The variance of response latency for operations within module $m$. High variance under load suggests resource contention or synchronous dependency on a slower module. *Scalability meaning:* sustained increase in $\sigma^2_{L,m}$ is a trigger for L0 or L1 intervention.\

- *Cross-Module Synchronous Call Ratio ($\rho_{\mathrm{sync}}$):* The proportion of inter-module interactions that are synchronous (blocking) versus asynchronous (event-driven or queued): $$\rho_{\mathrm{sync}} = \frac{|I_{\mathrm{sync}}|}{|I_{\mathrm{sync}}| + |I_{\mathrm{async}}|}$$ where $I_{\mathrm{sync}}$ and $I_{\mathrm{async}}$ are the sets of synchronous and asynchronous inter-module interactions, respectively. *Scalability meaning:* a high $\rho_{\mathrm{sync}}$ in the presence of divergent throughput profiles signals backpressure risk. Target: decrease $\rho_{\mathrm{sync}}$ for module pairs with high $\Delta\Theta$.\

- *Data Ownership Clarity Index ($\omega$):* The proportion of database tables (or collections) that are accessed by exactly one bounded-context module through its own repository: $$\omega = \frac{|T_{\mathrm{single\text{-}owner}}|}{|T|}$$ where $T$ is the set of all tables and $T_{\mathrm{single\text{-}owner}}$ is the subset accessed by only one module. *Scalability meaning:* $\omega < 1$ indicates shared tables that will block data isolation (L2) and extraction (L3). Target: $\omega \to 1$ over time.\

- *Infrastructure Abstraction Coverage ($\alpha$):* The proportion of infrastructure access points (database connections, cache clients, message broker producers/consumers, external API clients) that are mediated through an interface or port rather than used directly: $$\alpha = \frac{|A_{\mathrm{abstracted}}|}{|A|}$$ *Scalability meaning:* $\alpha < 1$ indicates infrastructure lock-in that will require code changes when transitioning between spectrum levels. Target: $\alpha = 1$ for modules identified as scale-point candidates.\

- *Extraction Readiness Score ($\varepsilon_m$):* A composite indicator for module $m$ that combines boundary enforcement (from G1), maintainability (from G2), and scalability preparation (from G3): $$\varepsilon_m = f\!\left(C_{\mathrm{undecl}}^{(m)},\; C_{\mathrm{leak}}^{(m)},\; \omega_m,\; \alpha_m,\; \rho_{\mathrm{sync}}^{(m)}\right)$$ where $C_{\mathrm{undecl}}^{(m)}$ and $C_{\mathrm{leak}}^{(m)}$ are the G1/G2 violation counts scoped to module $m$, and $\omega_m$, $\alpha_m$, $\rho_{\mathrm{sync}}^{(m)}$ are the G3 metrics scoped to module $m$. *Scalability meaning:* a high $\varepsilon_m$ indicates that the module can be extracted with low risk if L3 is triggered. A low $\varepsilon_m$ signals preparation debt that must be addressed before extraction is viable.\

*Verification strategy:* G3 metrics are tracked longitudinally alongside G1 and G2 metrics. The primary verification concern is not whether the system scales today, but whether it *can* scale proportionally when needed. An increase in $\Delta\Theta$ without a corresponding decrease in $\rho_{\mathrm{sync}}$ for the affected module pair indicates that scalability preparation is lagging behind actual load growth. A declining $\omega$ indicates increasing data coupling that will block future isolation. These signals enable proactive architectural intervention before scaling becomes an emergency.

## Documentation Guidelines {#documentation-guidelines .unnumbered}

- *Module Scale Profile:* Maintain a lightweight document (or section in the module descriptor) for each module that records its current spectrum level (L0--L3), its observed throughput profile, and any known scaling constraints. This profile is updated when monitoring data changes significantly or when a spectrum-level transition occurs.

- *Scalability ADRs:* Record each transition between spectrum levels as an Architecture Decision Record. The ADR should capture: the trigger condition (which metric crossed which threshold), the intervention applied, the expected outcome, the rollback path, and the actual outcome after implementation. This creates a traceable history of scaling decisions that can inform future interventions.

- *Infrastructure Dependency Map:* Document which infrastructure dependencies each module uses and whether they are accessed through abstractions ($\alpha = 1$) or directly ($\alpha < 1$). This map complements the module dependency descriptor from G1 and makes infrastructure lock-in visible.

## Tooling Capabilities Checklist {#tooling-capabilities-checklist .unnumbered}

Any open-source or proprietary tool used to support progressive scalability should address:

- *Module-scoped metrics collection:* Attribute resource consumption, latency, and throughput to individual modules within the monolith, without requiring distributed tracing infrastructure.

- *Communication abstraction:* Provide a dispatch mechanism that supports both synchronous and asynchronous inter-module communication through the same contract interface.

- *Schema ownership analysis:* Identify tables or collections accessed by multiple modules and quantify data ownership clarity ($\omega$).

- *Load simulation:* Support targeted load testing of individual modules or inter-module communication paths to validate scaling interventions before production deployment.

- *Extraction readiness assessment:* Combine G1 boundary metrics, G2 maintainability metrics, and G3 scalability metrics into a composite readiness view per module.

## Literature Support Commentary {#literature-support-commentary .unnumbered}

Scalability in the academic literature is predominantly framed as a property of distributed systems. Studies on microservices scalability [@arya2024beyond; @blinowski2022monolithic; @berry2024isItWorth] provide empirical evidence on horizontal scaling, but consistently assume that distribution is a prerequisite. Jatkiewicz and Okrój [@jatkiewicz2023differences] quantify these differences in performance, scalability, and cost between microservice and monolithic deployments, further illustrating that the trade-offs are context-dependent rather than universal. Conversely, studies that advocate for monoliths or modular monoliths [@montesi2021sliceable; @gravanis2021dont; @deLauretis2019from] acknowledge that monoliths can serve moderate scaling needs but rarely formalize *how* scaling should be approached incrementally within a monolithic boundary. Industry experience reports echo this sentiment: Segment's engineering team documented their retreat from microservices back to a monolith [@segment2023], Auth0 described the operational toll of premature distribution [@auth02019], and Medium's engineering team argued that monoliths remain viable at significant scale [@medium2019]. Lima and Silva [@lima2024accelerating] further show that monolithic architectures can accelerate early-stage development when combined with MVP practices, reinforcing the case for deferring distribution until evidence warrants it.

Montesi et al. [@montesi2021sliceable] come closest to the progressive scalability concept with their "sliceable monolith" proposal, which keeps the system unified until a slice needs independent deployment. However, their model focuses on deployment granularity rather than on the intermediate architectural interventions (async boundaries, data isolation) that G3 formalizes. Similarly, Ghemawat et al. [@ghemawat2023towards] propose a "write as a monolith, deploy as microservices" model (Service Weaver), which addresses the deployment dimension but does not provide guidance on how to prepare the monolith's internal architecture for selective scaling.

The gap that G3 addresses is the absence of a structured, evidence-driven guideline set for scaling modular monoliths progressively. Current literature offers a binary choice: stay monolithic (and accept scaling limits) or migrate to microservices (and accept distributed complexity). G3 fills this void by defining intermediate interventions, trigger conditions for each intervention, and measurable indicators that make scalability preparation observable and verifiable within the existing modular structure. This approach aligns with the evolutionary architecture perspective [@FordParsons2017] that architectural properties should be preserved through fitness functions and incremental adaptation rather than through disruptive transformations.

The scalability levels defined here provide the trigger criteria for G4 (Migration Readiness), which prepares individual modules for extraction.

## Reference Implementation: Source Files {#reference-implementation-source-files .unnumbered}

The code listings in this section are drawn from the Tiny Store reference implementation. The relevant source files are:

- `libs/shared/infrastructure/src/cache/cache.service.ts`: Module-namespaced Redis caching (L0)

- `libs/shared/infrastructure/src/cache/cache.decorator.ts`: Read-through caching decorator (L0)

- `libs/shared/infrastructure/src/queue/queue.service.ts`: Module-scoped BullMQ queues (L1)

- `libs/modules/orders/src/jobs/order-confirmation-email.job.ts`: Async email decoupling (L1)

- `libs/shared/infrastructure/src/database/schema-isolation.ts`: Per-module PostgreSQL schemas (L2)

- `tools/metrics/extraction-readiness.ts`: Extraction readiness score calculator ($\varepsilon_m$)
