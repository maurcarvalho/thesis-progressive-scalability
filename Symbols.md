%%%%%%%% Symbols and Notation %%%%%%%%

% ── Progressive Scalability Spectrum (G3) ──
}, description={Vertical Optimization: single-process performance tuning (caching, query optimization, connection pooling)}, sort={L0}}
}, description={Asynchronous Decoupling: event-driven communication and background job queues within the monolith}, sort={L1}}
}, description={Data Isolation: per-module schema separation, independent connection pools, schema-scoped migrations}, sort={L2}}
}, description={Selective Extraction: deployment of individual modules as independent services when evidence justifies}, sort={L3}}

% ── Deployment Spectrum (G5) ──
}, description={Single Artifact: one Docker image from the monorepo; all modules ship together as a standard monolith deployment}, sort={D0}}
}, description={Module-Aware CI: Nx `affected` scopes tests and builds to changed modules; still produces one artifact, but CI is faster and module-scoped}, sort={D1}}
}, description={Multi-Artifact: the monorepo produces multiple Docker images (e.g., `api` + `orders-service`); shared libraries remain in the repo; each image has its own deployment pipeline}, sort={D2}}

% ── Metrics ──
}, description={Extraction Readiness Score: composite metric (0--100) assessing a module's readiness for independent deployment, based on coupling, cohesion, and data isolation criteria}, sort={ERS}}

% ── Guideline Identifiers ──
}, description={Guideline identifier, where }. $G_1$--$G_6$ are detailed in this work; $G_7$--$G_{12}$ are deferred to future research}, sort={Gn}}
