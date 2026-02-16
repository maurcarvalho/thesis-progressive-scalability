# G6: Introduce Observability Patterns {#sec:g6-introduce-observability-patterns}

This section presents G6, which focuses on embedding module-scoped observability into the modular monolith using the same instrumentation, tooling, and data formats that would be used in a distributed deployment. Observability is treated as a prerequisite for evidence-based architectural decisions: without module-level visibility into latency, throughput, error rates, and cross-module interaction patterns, the trigger conditions defined in G3's scalability spectrum and the readiness assessments prescribed by G4 cannot be evaluated. G6 ensures that the system is transparent by construction, not instrumented as an afterthought.

G6 completes the Operational Fit Dimension (G4--G6). While G4 prepared the module for extraction with production-grade infrastructure and G5 established the deployment pipeline, G6 provides the feedback loop that connects the two: the observability data that tells the team *when* to scale (G3), *whether* a module is ready to extract (G4), and *how* the deployment is performing after extraction (G5). Without G6, the scalability spectrum operates on intuition rather than evidence.

## Intent and Rationale {#intent-and-rationale .unnumbered}

Monolithic systems are traditionally treated as observability black boxes. Application Performance Monitoring (APM) tools report aggregate metrics, such as total request latency, overall error rate, and database query time, but these metrics do not distinguish between modules. When the system slows down, the team knows *that* something is slow, but not *which module* is responsible, *which cross-module interaction* is the bottleneck, or *whether the problem is localized* to a single bounded context.

This opacity creates two problems. First, it prevents evidence-based scaling decisions: G3's metrics ($\Theta_m$, $\sigma^2_{L,m}$, $\Delta\Theta$) require module-level attribution that aggregate APM cannot provide. Second, it makes post-extraction comparison impossible: if the team cannot measure module-level performance before extraction, they have no baseline against which to evaluate whether extraction improved or degraded the system.

Microservices solve this problem by default, because each service is a separate process with its own metrics endpoint, its own log stream, and its own trace context. G6 achieves the same visibility inside the monolith by scoping observability to module boundaries. The key insight is that the instrumentation is identical: OpenTelemetry spans, structured log entries with module context, and Prometheus metrics with module labels work the same way whether the module runs in-process or as a separate service. Because this instrumentation is embedded from project inception, the team builds observability muscle, establishes baselines, and validates that the monitoring infrastructure is production-ready as part of normal development. The same dashboards and traces survive extraction unchanged because they were module-scoped from day one.

## Conceptual Overview {#conceptual-overview .unnumbered}

Module-scoped observability is embedded through three complementary pillars, each applied at the module boundary:

- *Structured logging with module context:* Every log entry carries the originating module name, a correlation ID that tracks requests across module boundaries, and structured fields (JSON) that enable programmatic querying. Log aggregation tools (e.g., Loki, Elasticsearch) can filter by module without code changes after extraction.

- *Module-scoped metrics via OpenTelemetry:* Each module emits latency, throughput, and error rate metrics tagged with the module name. These metrics feed directly into G3's trigger conditions ($\Theta_m$, $\sigma^2_{L,m}$) and G4's extraction readiness assessment. Prometheus scrapes the metrics endpoint; Grafana visualizes them. The same setup works before and after extraction.

- *Distributed tracing inside the monolith:* OpenTelemetry spans are created for each module handler invocation, each Temporal workflow and activity execution, and each Kafka producer/consumer interaction. A single trace visualizes the full order fulfillment flow across module boundaries, making cross-module latency and failure propagation observable. Jaeger (or any OpenTelemetry-compatible backend) displays the traces. After extraction, the trace context propagates over the network automatically via OpenTelemetry's context propagation.

## Applicability Conditions and Scope {#applicability-conditions-and-scope .unnumbered}

G6 applies to modular monolith systems where:

- Module boundaries are enforced (G1) and modules are identifiable as distinct units within the codebase.

- The team needs evidence-based input for scaling decisions (G3) and extraction readiness assessments (G4).

- Production infrastructure (Kafka, Temporal) is already in place (G4/G5), providing natural instrumentation points for tracing and metrics.

G6 does not prescribe specific observability vendors or platforms. It is grounded in OpenTelemetry, which is vendor-neutral and supports all major backends (Prometheus, Grafana, Jaeger, Datadog, New Relic). The guideline focuses on what to instrument and how to scope it to modules, not on which SaaS platform to use.

## Objectives {#objectives .unnumbered}

- *Module-level attribution:* Every metric, log entry, and trace span is attributable to a specific module, enabling per-module dashboards, alerts, and performance baselines.

- *Cross-module interaction visibility:* Traces show the full request path across module boundaries, including synchronous handler calls, Temporal workflow and activity executions, and Kafka produce/consume cycles.

- *Baseline establishment:* Before any extraction, module-level performance baselines (latency distributions, throughput profiles, error rates) are recorded, enabling before/after comparison when extraction occurs.

- *Alert precision:* Alerts are scoped to modules rather than the entire application, reducing alert fatigue and enabling targeted incident response.

- *Observability survival across extraction:* The same instrumentation, metric names, trace formats, and dashboards work without modification after a module is extracted into a separate service.

## Key Principles {#key-principles .unnumbered}

- *Instrument at the module boundary, not inside it:* Observability instrumentation is placed at the module's public surface: handler entry points, event publisher calls, event listener invocations, and Temporal activity boundaries. Internal method calls within a module are not instrumented unless they represent distinct domain operations. This keeps instrumentation overhead low and ensures that module-level metrics remain meaningful after extraction (when internal calls become invisible to external traces).

- *Correlation IDs are non-negotiable:* Every request that enters the system receives a correlation ID (or trace ID in OpenTelemetry terms). This ID is propagated to every module invocation, every Kafka message header, every Temporal workflow context, and every log entry. Without correlation IDs, cross-module debugging requires manual timestamp alignment, which is impractical in production. OpenTelemetry's context propagation provides this automatically when spans are created at module boundaries.

- *Metrics feed architectural decisions, not just operational alerts:* G6 metrics are not only for incident response. They are the primary input for G3's scalability spectrum ("which module needs scaling?"), G4's readiness assessment ("is this module performing within expected bounds?"), and G5's deployment decisions ("does this deployment target need independent release cadence?"). Dashboards should be organized by module and by guideline dimension, not only by infrastructure component.

- *Temporal and Kafka provide observability for free:* Temporal's execution history records every workflow start, activity attempt, retry, timeout, and compensation, providing saga-level observability without custom instrumentation. The Temporal Web UI visualizes workflow state in real time. Similarly, Kafka's consumer group lag metrics (available via JMX or Prometheus exporters) signal backpressure between modules. G6 leverages these built-in capabilities rather than reimplementing them.

- *Same dashboards before and after extraction:* If the observability setup must be redesigned after extraction, the team loses the baseline and the debugging familiarity built during the monolith phase. G6 requires that metric names, trace span names, log structures, and dashboard layouts are designed to be extraction-agnostic. A Grafana dashboard for "Orders Module Latency" should display the same data whether orders runs in-process or as a separate service.

## Implementation: Instrumenting the Order Fulfillment Flow {#implementation-instrumenting-the-order-fulfillment-flow .unnumbered}

The following implementation demonstrates how G6 is applied to Tiny Store's order fulfillment flow, producing a single trace that spans the API handler, the Temporal workflow, and all four bounded contexts.

### Structured Logging with Module Context {#structured-logging-with-module-context .unnumbered}

Each module uses a shared logger factory that automatically injects the module name and the current correlation ID (extracted from OpenTelemetry's active span context).

``` {#lst:g6-logger .TypeScript language="TypeScript" caption="Module-scoped structured logger (\\texttt{libs/shared/infrastructure/src/observability/module-logger.ts})" label="lst:g6-logger"}
import { trace, context } from '@opentelemetry/api';

export interface ModuleLogger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

function getTraceInfo(): { trace_id?: string; span_id?: string } {
  const span = trace.getSpan(context.active());
  if (!span) return {};
  const ctx = span.spanContext();
  return { trace_id: ctx.traceId, span_id: ctx.spanId };
}

function log(level: string, moduleName: string,
  message: string, data?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level, module: moduleName, message,
    ...getTraceInfo(), ...data,
  };
  const output = JSON.stringify(entry);
  switch (level) {
    case 'error': console.error(output); break;
    case 'warn':  console.warn(output);  break;
    case 'debug': console.debug(output); break;
    default:      console.log(output);
  }
}

export function getModuleLogger(moduleName: string): ModuleLogger {
  return {
    info:  (message, data?) => log('info',  moduleName, message, data),
    warn:  (message, data?) => log('warn',  moduleName, message, data),
    error: (message, data?) => log('error', moduleName, message, data),
    debug: (message, data?) => log('debug', moduleName, message, data),
  };
}

// Usage: const logger = getModuleLogger('orders');
//        logger.info('Order placed', { orderId, customerId });
```

After extraction, the same logger produces identical JSON output. Log aggregation queries like `module="orders" AND level="error"` work without modification.

### Module-Scoped Metrics with OpenTelemetry {#module-scoped-metrics-with-opentelemetry .unnumbered}

Each module registers its own metrics (latency histogram, request counter, error counter) using OpenTelemetry's Metrics API. The module name is a required attribute on every metric, enabling per-module dashboards.

``` {#lst:g6-metrics .TypeScript language="TypeScript" caption="Module-scoped metrics with memoized meter (\\texttt{libs/shared/infrastructure/src/observability/module-meter.ts})" label="lst:g6-metrics"}
import { metrics, Meter, Counter, Histogram } from '@opentelemetry/api';

export interface ModuleMetrics {
  meter: Meter;
  requestCounter: Counter;
  errorCounter: Counter;
  latencyHistogram: Histogram;
}

const moduleMetrics = new Map<string, ModuleMetrics>();

export function getModuleMeter(moduleName: string): ModuleMetrics {
  if (!moduleMetrics.has(moduleName)) {
    const meter = metrics.getMeter(`tiny-store.${moduleName}`);
    const requestCounter = meter.createCounter(`${moduleName}.requests`, {
      description: `Total requests for ${moduleName} module`,
    });
    const errorCounter = meter.createCounter(`${moduleName}.errors`, {
      description: `Total errors for ${moduleName} module`,
    });
    const latencyHistogram = meter.createHistogram(`${moduleName}.latency`, {
      description: `Request latency for ${moduleName} module`,
      unit: 'ms',
    });
    moduleMetrics.set(moduleName, {
      meter, requestCounter, errorCounter, latencyHistogram,
    });
  }
  return moduleMetrics.get(moduleName)!;
}
```

These metrics are exported to Prometheus via OpenTelemetry's Prometheus exporter. A Grafana dashboard displays per-module latency distributions, throughput ($\Theta_m$ from G3), and error rates. The same dashboard works after extraction because the metric names and attributes are unchanged.

### Distributed Tracing Across Module Boundaries {#distributed-tracing-across-module-boundaries .unnumbered}

OpenTelemetry spans are created at each module boundary: API handler entry, Temporal workflow start, each Temporal activity invocation, Kafka produce, and Kafka consume. The resulting trace shows the complete order fulfillment flow as a single, connected trace.

``` {#lst:g6-tracing .TypeScript language="TypeScript" caption="Module-scoped tracer with memoization (\\texttt{libs/shared/infrastructure/src/observability/module-tracer.ts})" label="lst:g6-tracing"}
import { trace, Tracer } from '@opentelemetry/api';

const tracers = new Map<string, Tracer>();

export function getModuleTracer(moduleName: string): Tracer {
  if (!tracers.has(moduleName)) {
    tracers.set(moduleName, trace.getTracer(`tiny-store.${moduleName}`));
  }
  return tracers.get(moduleName)!;
}
```

The tracer factory returns a standard OpenTelemetry `Tracer` scoped to the module name. Callers use the standard `startActiveSpan` API to create spans at handler entry points. Trace context propagation across Kafka messages is handled by a dedicated utility:

``` {#lst:g6-kafka-propagation .TypeScript language="TypeScript" caption="Kafka trace context propagation via W3C traceparent (\\texttt{libs/shared/infrastructure/src/observability/kafka-propagation.ts})" label="lst:g6-kafka-propagation"}
import { context, trace, TraceFlags } from '@opentelemetry/api';

const TRACEPARENT_HEADER = 'traceparent';

/** Inject current span context into Kafka message headers. */
export function injectTraceContext(
  headers: Record<string, string>,
): Record<string, string> {
  const span = trace.getSpan(context.active());
  if (!span) return headers;
  const ctx = span.spanContext();
  headers[TRACEPARENT_HEADER] =
    `00-${ctx.traceId}-${ctx.spanId}-${
      (ctx.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED
        ? '01' : '00'}`;
  return headers;
}

/** Extract span context from Kafka headers for parent linking. */
export function extractTraceContext(
  headers: Record<string, string | Buffer | undefined>,
): SpanContext | undefined {
  const raw = headers[TRACEPARENT_HEADER];
  if (!raw) return undefined;
  const traceparent = typeof raw === 'string' ? raw : raw.toString('utf-8');
  const parts = traceparent.split('-');
  if (parts.length !== 4) return undefined;
  return {
    traceId: parts[1], spanId: parts[2],
    traceFlags: parts[3] === '01' ? TraceFlags.SAMPLED : TraceFlags.NONE,
    isRemote: true,
  };
}
```

``` {#lst:g6-traced-handler .TypeScript language="TypeScript" caption="Traced order placement handler ({\\ttfamily libs/modules/orders/src/features/place-order/handler.ts})" label="lst:g6-traced-handler"}
// libs/modules/orders/src/features/place-order/handler.ts
const tracer  = getModuleTracer('orders');
const logger  = getModuleLogger('orders');
const metrics = getModuleMeter('orders');

export async function placeOrderHandler(params: PlaceOrderParams) {
  return tracer.startActiveSpan('orders.placeOrder', async (span) => {
    const start = Date.now();
    try {
      logger.info('Placing order', { customerId: params.customerId });
      const order = Order.create(params);
      await orderRepository.save(order);

      // Publish to Kafka with trace context in headers
      const headers = injectTraceContext({});
      await eventPublisher.publish('orders.events', {
        eventId: generateId(), eventType: 'OrderPlaced',
        version: 1, timestamp: new Date().toISOString(),
        payload: order.toEventPayload(),
      }, headers);

      metrics.requestCounter.add(1, { handler: 'placeOrder' });
      logger.info('Order placed', { orderId: order.id });
      span.setStatus({ code: 0 });
      return order;
    } catch (error) {
      metrics.errorCounter.add(1, { handler: 'placeOrder' });
      span.setStatus({ code: 2, message: (error as Error).message });
      span.recordException(error as Error);
      throw error;
    } finally {
      metrics.latencyHistogram.record(Date.now() - start,
        { handler: 'placeOrder' });
      span.end();
    }
  });
}
```

When this flow executes, Jaeger displays a trace like:

``` {#lst:g6-jaeger-trace .bash language="bash" caption="Example trace in Jaeger (conceptual)" label="lst:g6-jaeger-trace"}
Trace: place-order-abc123  (total: 245ms)
|
|-- orders.placeOrder                      [12ms]  module=orders
|   |-- kafka.produce orders.events        [3ms]   module=orders
|
|-- inventory.reserveStock                 [45ms]  module=inventory
|   |-- kafka.consume orders.events        [2ms]   module=inventory
|   |-- kafka.produce inventory.events     [3ms]   module=inventory
|
|-- temporal.orderFulfillment              [180ms] module=orders
|   |-- activity.reserveInventory          [45ms]  module=inventory
|   |-- activity.processPayment            [85ms]  module=payments
|   |-- activity.createShipment            [50ms]  module=shipments
```

This trace is identical whether modules run in-process or as separate services. The only difference after extraction is that network latency appears between spans, which is precisely the information the team needs to evaluate whether extraction impacted performance.

### Built-In Observability from Temporal and Kafka {#built-in-observability-from-temporal-and-kafka .unnumbered}

G4 and G5 introduced Temporal and Kafka as production infrastructure. G6 leverages their built-in observability capabilities without additional instrumentation:

- *Temporal Web UI:* Displays every workflow execution, including: workflow ID, current state, activity history (start, complete, fail, retry), compensation events, and execution duration. For the order fulfillment saga, this means the team can inspect any order's fulfillment progress, identify which activity failed, and see whether compensation executed correctly, all without custom logging.

- *Temporal metrics:* Temporal's SDK emits OpenTelemetry-compatible metrics including workflow start rate, activity execution latency, retry count per activity, and workflow failure rate. These metrics are exported to the same Prometheus instance used by the application, enabling unified dashboards.

- *Kafka consumer lag:* The lag between the latest produced offset and the latest consumed offset for each consumer group indicates backpressure between modules. If the inventory consumer group falls behind on the `orders.events` topic, it signals that inventory processing cannot keep up with order volume, which is a direct input to G3's scalability assessment.

- *Kafka producer metrics:* Record batch size, request latency, and error rate per topic, providing visibility into event publishing performance per module.

### OpenTelemetry SDK Bootstrap {#opentelemetry-sdk-bootstrap .unnumbered}

The observability infrastructure is initialized once at application startup, before any module code is imported. This ensures that HTTP and Express auto-instrumentation patches are applied globally, and that all module-scoped tracers and meters export to the configured OTLP endpoint (Jaeger for traces, Prometheus for metrics).

``` {#lst:g6-otel-config .TypeScript language="TypeScript" caption="OpenTelemetry SDK configuration (\\texttt{libs/shared/infrastructure/src/observability/otel.config.ts})" label="lst:g6-otel-config"}
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION }
  from '@opentelemetry/semantic-conventions';

export function createNodeSDK(config?: Partial<OtelConfig>): NodeSDK {
  const c = { ...createOtelConfig(), ...config };
  return new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: c.serviceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.0.0',
      'deployment.environment': process.env.NODE_ENV || 'development',
    } as any),
    traceExporter: new OTLPTraceExporter({
      url: `${c.otlpEndpoint}/v1/traces` }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${c.otlpEndpoint}/v1/metrics` }),
      exportIntervalMillis: c.metricIntervalMs,
    }),
    instrumentations: [
      new HttpInstrumentation(), new ExpressInstrumentation(),
    ],
  });
}
```

``` {#lst:g6-otel-init .TypeScript language="TypeScript" caption="Bootstrap entry point (\\texttt{libs/shared/infrastructure/src/observability/otel.init.ts})" label="lst:g6-otel-init"}
export function initOpenTelemetry(config?: Partial<OtelConfig>): NodeSDK {
  if (sdk) return sdk;
  sdk = createNodeSDK(config);
  sdk.start();
  process.on('SIGTERM', () => sdk?.shutdown().catch(console.error));
  process.on('SIGINT',  () => sdk?.shutdown().catch(console.error));
  console.log('[otel] OpenTelemetry initialized');
  return sdk;
}
```

The `initOpenTelemetry` call is placed at the very top of the application entry point (`apps/api/src/main.ts`), ensuring all subsequent module imports are automatically instrumented.

### Module-Scoped Alert Rules {#module-scoped-alert-rules .unnumbered}

Prometheus alert rules are scoped to modules, enabling targeted incident response. The following rules are defined in `infra/prometheus/alerts.yml`:

``` {#lst:g6-prometheus-alerts .bash language="bash" caption="Prometheus alert rules scoped to modules (\\texttt{infra/prometheus/alerts.yml})" label="lst:g6-prometheus-alerts"}
groups:
  - name: module_health
    rules:
      - alert: HighErrorRate
        expr: |
          (sum(rate({__name__=~".+_errors_total"}[5m])) by (module)
           / sum(rate({__name__=~".+_requests_total"}[5m])) by (module)
          ) > 0.05
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "High error rate in {{ $labels.module }} module"

      - alert: HighP95Latency
        expr: |
          histogram_quantile(0.95,
            sum(rate({__name__=~".+_latency_bucket"}[5m])) by (le, module)
          ) > 500
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "High P95 latency in {{ $labels.module }} module"

      - alert: KafkaConsumerLagHigh
        expr: kafka_consumer_group_lag > 1000
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "Kafka consumer lag high for {{ $labels.group }}"
```

These alerts feed directly into G3's trigger conditions: `HighErrorRate` and `HighP95Latency` signal per-module degradation that may warrant an L0 or L1 intervention, while `KafkaConsumerLagHigh` indicates backpressure between modules that may warrant an L1 (async decoupling) or L3 (extraction) response.

### Grafana Dashboard: Module Overview {#grafana-dashboard-module-overview .unnumbered}

The reference implementation includes a pre-configured Grafana dashboard (`infra/grafana/dashboards/module-overview.json`) with four panels that provide the observability surface required by G3 and G4:

- *Request Rate per Module:* `sum(rate({__name__=~".+_requests_total"}[5m])) by (module)`: visualizes $\Theta_m$ from G3.

- *P95 Latency per Module:* `histogram_quantile(0.95, ...)`: tracks $\sigma^2_{L,m}$ and triggers L0/L1 interventions.

- *Error Rate per Module:* per-module error rate for alert correlation.

- *Kafka Consumer Lag:* consumer group lag by topic, signaling cross-module backpressure.

Because all metrics are tagged with `module` labels from inception, the same dashboard panels display identical data whether the module runs in-process or as an extracted service. The dashboard is provisioned automatically via Grafana's dashboard provisioning, ensuring it is available in every environment from the first deployment.

## Common Failure Modes and Anti-Patterns {#common-failure-modes-and-anti-patterns .unnumbered}

- *Aggregate-only monitoring (the black box monolith):* Monitoring only application-level metrics (total latency, total errors) without module attribution. When a performance issue arises, the team cannot isolate which module is responsible, leading to unfocused investigation and delayed resolution.

- *Instrumentation after extraction:* Adding observability only after a module is extracted. This eliminates the pre-extraction baseline, making it impossible to determine whether performance changes are caused by the extraction or by unrelated factors. It also means the team learns to use monitoring tools under the pressure of a production incident.

- *Log-only observability:* Relying exclusively on log searching for debugging without traces or metrics. Logs provide point-in-time information but lack the causal chain that traces provide and the statistical patterns that metrics reveal. Module-scoped debugging requires all three pillars.

- *Custom observability frameworks:* Building bespoke logging, metrics, and tracing infrastructure instead of adopting OpenTelemetry. Custom frameworks create vendor lock-in, increase maintenance burden, and are unlikely to integrate with the observability built into Temporal and Kafka. OpenTelemetry's vendor-neutral approach ensures interoperability.

- *Alert fatigue from application-level thresholds:* Setting alert thresholds on aggregate application metrics rather than per-module metrics. When a single module's latency spikes, an application-level threshold may or may not trigger, depending on overall traffic distribution. Module-scoped alerts (e.g., "orders module p99 latency \> 200ms") are more precise and actionable.

## Metrics and Verification {#metrics-and-verification .unnumbered}

G6 metrics assess the completeness and effectiveness of the observability implementation across modules.

- *Trace Completeness Rate ($\tau$):* The proportion of cross-module request flows that produce a complete, connected trace (all expected spans present): $$\tau = \frac{|F_{\mathrm{traced}}|}{|F|}$$ where $F$ is the set of all cross-module flows and $F_{\mathrm{traced}}$ is the subset with complete traces. *Observability meaning:* $\tau < 1$ indicates instrumentation gaps at module boundaries, which will become debugging blind spots after extraction.\

- *Metric Coverage per Module ($\kappa_m$):* The proportion of module public surface operations (handlers, event publishers, event listeners) that emit latency, throughput, and error metrics: $$\kappa_m = \frac{|O_{\mathrm{instrumented}}^{(m)}|}{|O^{(m)}|}$$ *Observability meaning:* $\kappa_m < 1$ means that some module operations are invisible to the metrics system, preventing complete $\Theta_m$ and $\sigma^2_{L,m}$ calculation for G3.\

- *Log Module Attribution Rate ($\lambda$):* The proportion of log entries that include a `module` field and a `traceId`: $$\lambda = \frac{|L_{\mathrm{attributed}}|}{|L|}$$ *Observability meaning:* $\lambda < 1$ indicates log entries that cannot be filtered by module or correlated with traces. Target: $\lambda = 1$.\

- *Alert Precision ($\alpha_{\mathrm{alert}}$):* The proportion of triggered alerts that are scoped to a specific module rather than the application as a whole: $$\alpha_{\mathrm{alert}} = \frac{|A_{\mathrm{module\text{-}scoped}}|}{|A|}$$ *Observability meaning:* low $\alpha_{\mathrm{alert}}$ indicates that alerts lack the specificity needed for targeted incident response.\

- *Baseline Coverage ($\beta$):* The proportion of modules for which a performance baseline (latency distribution, throughput profile, error rate) has been recorded prior to any extraction: $$\beta = \frac{|M_{\mathrm{baselined}}|}{|M|}$$ *Observability meaning:* $\beta < 1$ before extraction means the team cannot evaluate extraction impact for some modules. Target: $\beta = 1$ before any L3 transition.\

- *Mean Time to Detect (MTTD):* The average time between a module-level performance degradation occurring and an alert firing. This is the primary operational effectiveness metric. *Observability meaning:* decreasing MTTD over time indicates improving observability maturity.

*Verification strategy:* G6 metrics are assessed as part of the extraction readiness review (G4). Before any module is extracted, $\tau$, $\kappa_m$, $\lambda$, and $\beta$ must meet threshold values. After extraction, the same metrics are compared against the pre-extraction baseline to verify that observability survived the topology change. A drop in $\tau$ after extraction indicates that trace context propagation is failing across the network boundary, requiring investigation of OpenTelemetry context propagation configuration.

## Documentation Guidelines {#documentation-guidelines .unnumbered}

- *Observability Runbook:* For each module, document the available dashboards, the metric names and their meaning, the expected alert thresholds, and the debugging workflow ("when this alert fires, check this dashboard, then look at this trace"). This runbook is part of the module's operational documentation and should be reviewed during G4's extraction readiness assessment.

- *Dashboard Registry:* Maintain a registry of Grafana dashboards organized by module and by guideline dimension. Each dashboard should include: the G3 scalability metrics ($\Theta_m$, $\sigma^2_{L,m}$, $\Delta\Theta$), the G4 readiness indicators, and the G6 observability health metrics ($\tau$, $\kappa_m$).

- *Performance Baseline Archive:* Before any extraction, record the module's performance baseline (latency percentiles, throughput range, error rate distribution) as a versioned document. This baseline serves as the reference for post-extraction comparison.

## Tooling Capabilities Checklist {#tooling-capabilities-checklist .unnumbered}

Any open-source or proprietary tool used to support module-scoped observability should address:

- *Vendor-neutral instrumentation:* OpenTelemetry SDK for traces, metrics, and logs. Vendor-neutral instrumentation ensures portability and avoids lock-in.

- *Metrics collection and visualization:* Prometheus for metrics scraping and storage; Grafana for per-module dashboards. OpenTelemetry's Prometheus exporter bridges the two.

- *Distributed trace collection:* Jaeger (or any OpenTelemetry-compatible backend) for trace visualization. Trace context propagation via OpenTelemetry ensures traces span module boundaries, Kafka messages, and Temporal activities.

- *Log aggregation:* Loki, Elasticsearch, or equivalent for structured log aggregation with support for filtering by module name and trace ID.

- *Workflow observability:* Temporal Web UI for real-time workflow and activity inspection. Temporal's OpenTelemetry integration for workflow-level metrics.

- *Event stream monitoring:* Kafka consumer lag monitoring via JMX exporters or Prometheus Kafka exporter, integrated into per-module Grafana dashboards.

## Observability Maturity Levels {#observability-maturity-levels .unnumbered}

Table [1](#tab:observability-maturity){reference-type="ref" reference="tab:observability-maturity"} defines the observability maturity levels that correspond to increasing instrumentation depth within the modular monolith.

::: {#tab:observability-maturity}
  **Level**                     **Traces**               **Metrics**              **Logs**          **Dashboard**
  --------------------- -------------------------- ------------------------ -------------------- -------------------
  O0 (None)                        None                      None                   None                None
  O1 (Application)               App-wide              Global counters          Unstructured       Single overview
  O2 (Module-scoped)         Per-module spans          Module counters       Structured, tagged      Per-module
  O3 (Cross-boundary)    Cross-module correlation   $\Theta_m$, $\kappa_m$      Trace-linked      Per-module + flow

  : Observability maturity levels for modular monoliths
:::

## Literature Support Commentary {#literature-support-commentary .unnumbered}

Observability is extensively discussed in the microservices literature, where distributed tracing, centralized logging, and metrics collection are considered essential operational requirements [@arya2024beyond; @johnson2024serviceweaver]. However, these practices are rarely advocated for monolithic systems, where the assumption is that a single process does not need distributed observability tools.

This assumption creates a dangerous gap. When a module is extracted, the team must simultaneously learn new monitoring tools, establish baselines, and debug a newly distributed system. G6 eliminates this gap by introducing production-grade observability (OpenTelemetry, Prometheus, Grafana, Jaeger) inside the monolith, scoped to module boundaries. The result is that extraction does not change the observability posture: the same dashboards, the same traces, and the same alerts continue to function, with the addition of network latency visibility between spans.

Montesi et al. [@montesi2021sliceable] note that monoliths lack comparable observability practices to microservices, treating the system as a "single black box." G6 addresses this directly by making the monolith's internal module interactions as observable as inter-service communication in a distributed system. The key contribution is not the tooling itself, which is well-established, but the practice of introducing it at the module boundary level inside a monolith, creating continuity of observability across the entire scalability spectrum from L0 through L3.

Together with G3's scalability spectrum, G4's extraction patterns, and G5's deployment pipeline, the observability infrastructure completes a self-reinforcing cycle where monitoring evidence drives scaling decisions.

## Reference Implementation {#reference-implementation .unnumbered}

The observability infrastructure described in this guideline is fully implemented in the Tiny Store reference implementation. The observability layer resides in `libs/shared/infrastructure/src/observability/` and comprises six files: `otel.config.ts` and `otel.init.ts` (SDK bootstrap), `module-tracer.ts` (per-module tracer factory), `module-meter.ts` (per-module metrics factory), `module-logger.ts` (structured logger with trace correlation), and `kafka-propagation.ts` (W3C traceparent injection/extraction for Kafka messages). The infrastructure layer (`infra/`) includes Prometheus alert rules (`prometheus/alerts.yml`) scoped to module labels, and a pre-configured Grafana dashboard (`grafana/dashboards/module-overview.json`) with panels for per-module request rate, P95 latency, error rate, and Kafka consumer lag. The Docker Compose configuration provisions Jaeger, Prometheus, and Grafana alongside the application from the first deployment, ensuring that observability is embedded from project inception rather than retrofitted during extraction. The same dashboards and traces survive extraction unchanged because they were module-scoped from day one.
