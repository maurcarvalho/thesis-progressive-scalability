/**
 * Create_Form.gs
 *
 * Google Apps Script that programmatically builds the post-interview form
 * for the expert validation phase of the dissertation:
 *   "Towards a Progressive Scalability for Modular Monolith Applications"
 *
 * How to deploy:
 *   1. Open https://script.google.com and create a new project.
 *   2. Replace the default Code.gs contents with this file.
 *   3. Save the project (give it any name).
 *   4. Run the function createInterviewForm. Google will ask for
 *      permission the first time (grants Forms and Drive scopes).
 *   5. Check View > Execution log (or Logs in the new editor) for the
 *      form URLs printed at the end of the run.
 *
 * Re-running the function creates a brand new form each time.
 */

function createInterviewForm() {
  var form = FormApp.create(
    'Post-Interview Form — Towards a Progressive Scalability for Modular Monolith Applications'
  );

  form.setDescription(
    'Thank you for the conversation. This short form complements our interview by gathering ' +
    'structured ratings that we can aggregate across all participants. It takes about 10 to 15 ' +
    'minutes. The rating sections are required; the final two questions are optional. Please ' +
    'return it within one week of the interview.\n\n' +
    'Your responses are correlated to your interviewee identifier through the email address you ' +
    'submit with the form. No additional profile fields are requested here.'
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setConfirmationMessage(
    'Thank you. Your responses are recorded. They will be analyzed alongside your interview ' +
    'transcript and aggregated with other participants\' responses. If specific revisions to ' +
    'the guidelines emerge from the analysis, they will be re-circulated for your confirmation.'
  );

  var ratingColumns = ['1', '2', '3', '4', '5'];
  var likertLow = 'Strongly disagree';
  var likertHigh = 'Strongly agree';
  var positions = ['1', '2', '3', '4', '5', '6'];

  // -----------------------------------------------------------------
  // Section 1 — General framing
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 1 — General framing')
    .setHelpText('The next three questions are required.');

  form.addScaleItem()
    .setTitle(
      'The four analytical dimensions (Architectural Design, Operational Fit, ' +
      'Organizational Alignment, Guideline Orientation) reflect the architectural concerns ' +
      'I encounter in practice.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'The paper\'s framing of modular monoliths as a deliberate architectural destination, ' +
      'rather than a transitional step toward microservices, aligns with how I have seen ' +
      'successful systems evolve.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'The G1 to G6 ordering, with structural dependencies between guidelines, matches how ' +
      'an engineering team would actually approach these concerns.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'The set of six guidelines G1 through G6 is complete; no essential guideline is missing ' +
      'from the operational scope of Architectural Design and Operational Fit.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  // -----------------------------------------------------------------
  // Section 2 — Per-guideline ratings
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 2 — Per-guideline ratings')
    .setHelpText(
      'For each of G1 through G6, please rate the guideline on four dimensions. ' +
      'Scale: 1 = Very low, 5 = Very high. All ratings are required.'
    );

  function addGuidelineGrid(guidelineTitle, namedGap, metrics) {
    form.addGridItem()
      .setTitle(guidelineTitle)
      .setRows([
        'Practical applicability to systems I work on',
        'Clarity of metric definitions (' + metrics + ')',
        'Importance of the named gap (' + namedGap + ')',
        'Likelihood of adoption in my environment',
        'Completeness of principles, metrics, and anti-patterns for this guideline'
      ])
      .setColumns(ratingColumns)
      .setRequired(true);
  }

  addGuidelineGrid(
    'G1: Enforce Modular Boundaries',
    'the Enforcement Gap',
    'Undeclared Dependencies, Forbidden Dependencies, Encapsulation Leakage, Event Violations, Isolation Pass Rate'
  );

  addGuidelineGrid(
    'G2: Embed Maintainability',
    'the Incremental Maintainability Degradation',
    'API Boundary Ratio, Change Coupling Index, Dependency Attraction, Complexity Concentration, Contract Stability'
  );

  addGuidelineGrid(
    'G3: Design for Progressive Scalability',
    'the Progressive Scalability Gap',
    'Sync Ratio, Data Ownership, Abstraction Coverage'
  );

  addGuidelineGrid(
    'G4: Promote Migration Readiness',
    'the Migration Readiness Gap',
    'Anti-Corruption Layer Coverage, Saga Completeness, API Version Coverage, Data Ownership, Abstraction Coverage'
  );

  addGuidelineGrid(
    'G5: Streamline Deployment Strategy',
    'the Deployment-Architecture Mismatch',
    'CI Scope Efficiency, Build Time per Scope, Infrastructure Parity, Independent Deployment Rate, Rollback Success Rate'
  );

  addGuidelineGrid(
    'G6: Introduce Observability Patterns',
    'the Observability Deficit',
    'Trace Completeness, Metric Coverage, Log Attribution Rate, Alert Precision, Baseline Coverage'
  );

  // -----------------------------------------------------------------
  // Section 3 — Named gap recognition
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 3 — Named gap recognition');

  form.addCheckboxItem()
    .setTitle(
      'Which of the following named gaps have you personally encountered in a production ' +
      'system? Select all that apply.'
    )
    .setChoiceValues([
      'The Enforcement Gap (G1): boundaries recognized but not enforced',
      'The Incremental Maintainability Degradation (G2): drift in contractual surfaces over time',
      'The Progressive Scalability Gap (G3): architectural correctness without operational readiness to scale a specific module',
      'The Migration Readiness Gap (G4): structural readiness without operational readiness for safe extraction',
      'The Deployment-Architecture Mismatch (G5): architecture ready for extraction, pipeline cannot produce multiple artifacts',
      'The Observability Deficit (G6): module-level visibility absent in systems whose decisions depend on it',
      'None of the above'
    ])
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'The set of named failure-mode concepts above is complete; no essential failure mode is ' +
      'missing.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  // -----------------------------------------------------------------
  // Section 4 — Anti-pattern recognition
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 4 — Anti-pattern recognition')
    .setHelpText(
      'For each guideline, which of the listed anti-patterns have you personally encountered ' +
      'in production systems? Select all that apply.'
    );

  function addAntiPatternItem(title, options) {
    var values = options.slice();
    values.push('None of the above');
    form.addCheckboxItem()
      .setTitle(title)
      .setChoiceValues(values)
      .setRequired(true);
  }

  addAntiPatternItem('G1 anti-patterns', [
    'Convenience-driven imports (shortcuts that bypass the public API)',
    'Shared utility creep (a shared/utils package that quietly absorbs domain logic)',
    'Implicit framework wiring through dependency injection or auto-configuration'
  ]);

  addAntiPatternItem('G2 anti-patterns', [
    'Overloaded module exports (public surface growing materially across sprints)',
    'Exposing internal types for cross-module convenience',
    'Feature-centric coupling across modules (one feature requiring coordinated changes to multiple bounded contexts)'
  ]);

  addAntiPatternItem('G3 anti-patterns', [
    'Premature distribution (treating extraction as the default response to load)',
    'Uniform scaling assumption (identical auto-scaling rules applied to modules with order-of-magnitude differences in traffic)',
    'Shared databases coupling modules implicitly'
  ]);

  addAntiPatternItem('G4 anti-patterns', [
    'Deferred readiness (postponing preparation until extraction is imminent)',
    'Cross-module transactions that hide failure modes that surface after extraction',
    'Payload coupling without anti-corruption layers (binding downstream modules to upstream schema)'
  ]);

  addAntiPatternItem('G5 anti-patterns', [
    'Repository splitting at extraction time',
    'Build-everything continuous integration (running all tests on every commit regardless of what changed)',
    'Coordinated deployments after extraction (monolith and extracted service forced to release together)'
  ]);

  addAntiPatternItem('G6 anti-patterns', [
    'Aggregate-only monitoring (no per-module attribution)',
    'Instrumentation added only after extraction',
    'Log-only observability (relying on log searches without traces or metrics)'
  ]);

  // -----------------------------------------------------------------
  // Section 5 — Spectrum and gate evaluation
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 5 — Spectrum and gate evaluation')
    .setHelpText('All questions in this section are required.');

  form.addScaleItem()
    .setTitle(
      'The G3 progressive scalability spectrum (Tune, Decouple, Isolate, Extract) is a useful ' +
      'way to reason about scaling decisions in real systems.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(
      'The G3 Extraction Readiness gate (epsilon_m = 1 requires b_m = 1, g_m = 1, and all ' +
      'three G3 verification metrics) is calibrated correctly.'
    )
    .setChoiceValues([
      'Too strict to be practically achievable',
      'About right',
      'Too lenient',
      'I am not confident enough about the right calibration to answer'
    ])
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'The G5 deployment spectrum (D0 single artifact, D1 module-aware CI, D2 multi-artifact) ' +
      'is a useful way to reason about how a pipeline should evolve alongside the architecture.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  form.addScaleItem()
    .setTitle(
      'Composite binary gates (a module passes when all underlying metrics meet their targets ' +
      'simultaneously) are a useful enforcement mechanism, rather than brittle in noisy ' +
      'real-world data.'
    )
    .setBounds(1, 5)
    .setLabels(likertLow, likertHigh)
    .setRequired(true);

  // -----------------------------------------------------------------
  // Section 6 — Forced prioritization
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 6 — Forced prioritization')
    .setHelpText(
      'Both questions in this section are required. Use the grid: each guideline row selects ' +
      'one position column (1 = highest priority, 6 = lowest). Try to use each position only once.'
    );

  form.addGridItem()
    .setTitle(
      'Rank G1 through G6 by which would generate the most value first if introduced into a ' +
      'typical early-stage cloud-native startup. 1 = highest priority, 6 = lowest.'
    )
    .setRows([
      'G1: Enforce Modular Boundaries',
      'G2: Embed Maintainability',
      'G3: Design for Progressive Scalability',
      'G4: Promote Migration Readiness',
      'G5: Streamline Deployment Strategy',
      'G6: Introduce Observability Patterns'
    ])
    .setColumns(positions)
    .setRequired(true);

  form.addGridItem()
    .setTitle(
      'Rank G7 through G12 (the research agenda) by priority for the next phase of this work. ' +
      '1 = highest priority, 6 = lowest.'
    )
    .setHelpText(
      'G7 Team-Architecture Balance; G8 SRE and DevOps Maturity; G9 Frictionless Onboarding; ' +
      'G10 Actionable Design Patterns; G11 Contextual Adaptation; G12 Trade-offs over Dogma ' +
      '(cross-cutting meta-guidance).'
    )
    .setRows([
      'G7: Team-Architecture Balance',
      'G8: SRE and DevOps Maturity',
      'G9: Frictionless Onboarding',
      'G10: Actionable Design Patterns',
      'G11: Contextual Adaptation',
      'G12: Trade-offs over Dogma'
    ])
    .setColumns(positions)
    .setRequired(true);

  // -----------------------------------------------------------------
  // Section 7 — Final reflections
  // -----------------------------------------------------------------
  form.addPageBreakItem()
    .setTitle('Section 7 — Final reflections')
    .setHelpText('Both questions in this section are optional.');

  form.addParagraphTextItem()
    .setTitle(
      'Is there anything you reflected on after the interview that we did not discuss, or that ' +
      'you would like to add to your earlier comments?'
    )
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle(
      'If you were the author, what is the single change you would make to how the guidelines ' +
      'are framed, named, or organized?'
    )
    .setRequired(false);

  // -----------------------------------------------------------------
  // Output URLs
  // -----------------------------------------------------------------
  Logger.log('Editor URL:    ' + form.getEditUrl());
  Logger.log('Published URL: ' + form.getPublishedUrl());
}
