import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answer {
  label: string
  value: number
}

interface Question {
  id: string
  text: string
  hint?: string
  answers: Answer[]
}

interface Domain {
  id: string
  number: number
  title: string
  subtitle: string
  icon: string
  color: string
  questions: Question[]
  controls: {
    title: string
    description: string
  }[]
}

// ─── Survey Data (7 Domains from the Article) ─────────────────────────────────

const DOMAINS: Domain[] = [
  {
    id: 'envelope',
    number: 1,
    title: 'Define the Operating Envelope',
    subtitle: 'Purpose, authority & acceptable boundaries before deployment',
    icon: '◈',
    color: '#8B6914',
    questions: [
      {
        id: 'env_1',
        text: 'Is the agent\'s business objective and intended use clearly documented?',
        hint: 'Not just a project brief — a formal statement of what "success" means and what the agent is actually allowed to do.',
        answers: [
          { label: 'Not defined', value: 0 },
          { label: 'Partially documented', value: 1 },
          { label: 'Defined but not formally approved', value: 2 },
          { label: 'Formally documented & approved by relevant stakeholders', value: 3 },
        ],
      },
      {
        id: 'env_2',
        text: 'Are unacceptable outcomes and stop conditions explicitly defined?',
        hint: 'What would cause the system to pause, escalate, or shut down? If this is vague, you have a problem.',
        answers: [
          { label: 'No stop conditions defined', value: 0 },
          { label: 'Informal understanding only', value: 1 },
          { label: 'Documented but not tested', value: 2 },
          { label: 'Documented & rehearsed', value: 3 },
        ],
      },
      {
        id: 'env_3',
        text: 'Is the agent\'s action-space formally mapped and approved?',
        hint: 'Can it read customer data? Write to systems? Send external messages? Approve transactions? Create or close cases?',
        answers: [
          { label: 'No map of action-space', value: 0 },
          { label: 'Informal mental model only', value: 1 },
          { label: 'Map exists but gaps remain', value: 2 },
          { label: 'Fully mapped & approved by risk function', value: 3 },
        ],
      },
      {
        id: 'env_4',
        text: 'Are the risk appetite thresholds for this use case formally defined?',
        hint: 'What error rate is tolerable? What customer impact threshold triggers escalation?',
        answers: [
          { label: 'No thresholds defined', value: 0 },
          { label: 'Generic thresholds only', value: 1 },
          { label: 'Use-case-specific thresholds defined', value: 2 },
          { label: 'Thresholds defined, approved & connected to monitoring', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Operating Envelope Document',
        description: 'A formal document defining purpose, users, material decisions, obligations, risk appetite, performance expectations, unacceptable outcomes, escalation triggers, and stop conditions. A management decision, not a technical artefact.',
      },
      {
        title: 'Action-Space Map',
        description: 'A formal inventory of everything the agent can do: read customer data, write to systems, send messages, approve actions, trigger payments, call other agents, make irreversible changes. Approved by risk and technology.',
      },
      {
        title: 'Stop/Escalation Playbook',
        description: 'Pre-defined conditions that cause the system to pause, escalate, or stop. Who is notified? What is paused? What authority can override? Rehearsed with tabletop exercises.',
      },
    ],
  },
  {
    id: 'authority',
    number: 2,
    title: 'Bound the Authority',
    subtitle: 'First-class control over what the agent can and cannot do',
    icon: '◇',
    color: '#2D5A3D',
    questions: [
      {
        id: 'auth_1',
        text: 'Is the principle of least privilege applied to the agent\'s permissions?',
        hint: 'Does it have exactly the access it needs — no more? Read-only where it only reads? No write access to sensitive systems?',
        answers: [
          { label: 'Agent has broad/unrestricted access', value: 0 },
          { label: 'Ad-hoc permissions, not formally reviewed', value: 1 },
          { label: 'Least privilege applied but not tested', value: 2 },
          { label: 'Formally reviewed, tested, & enforced continuously', value: 3 },
        ],
      },
      {
        id: 'auth_2',
        text: 'Are irreversible actions subject to mandatory human approval?',
        hint: 'Can the agent close a case, delete a record, approve a refund, or change a configuration without a human in the loop?',
        answers: [
          { label: 'No human approval for irreversible actions', value: 0 },
          { label: 'Some ad-hoc gates exist', value: 1 },
          { label: 'Human approval gates defined but not enforced technically', value: 2 },
          { label: 'Technically enforced human approval for all irreversible actions', value: 3 },
        ],
      },
      {
        id: 'auth_3',
        text: 'Are transaction value limits and blast radius constraints defined?',
        hint: 'If the agent makes a mistake, what is the maximum financial or operational impact you\'re willing to absorb?',
        answers: [
          { label: 'No value limits defined', value: 0 },
          { label: 'Limits exist but not technically enforced', value: 1 },
          { label: 'Limits enforced but not monitored in real-time', value: 2 },
          { label: 'Real-time enforced limits with automatic circuit-breaker', value: 3 },
        ],
      },
      {
        id: 'auth_4',
        text: 'Is multi-agent authority delegation formally controlled?',
        hint: 'If one agent consumes another agent\'s output, is there a trust boundary? Can Agent A grant Agent B additional authority?',
        answers: [
          { label: 'No controls on agent-to-agent delegation', value: 0 },
          { label: 'Implicit trust between agents', value: 1 },
          { label: 'Delegation rules defined but not enforced', value: 2 },
          { label: 'Formal delegation controls with audit trail', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Permission Architecture',
        description: 'Read-only vs. write access, reversible vs. irreversible actions, low-value vs. high-value transactions, internal-only vs. customer-facing communications. Segregated environments for agents with different risk levels.',
      },
      {
        title: 'Human-in-the-Loop Gates',
        description: 'Targeted human approval at specific decision points — not a slogan, but a technically enforced checkpoint at points where authority, uncertainty, and consequence justify it.',
      },
      {
        title: 'Blast Radius Limiting',
        description: 'Assume the agent will make mistakes. Limit the blast radius to things the organisation can withstand. Separate environments, rate limits, allow-lists, sandboxes.',
      },
    ],
  },
  {
    id: 'testing',
    number: 3,
    title: 'Test the System',
    subtitle: 'Beyond prompt testing — end-to-end socio-technical validation',
    icon: '△',
    color: '#1A4A6B',
    questions: [
      {
        id: 'test_1',
        text: 'Is end-to-end behaviour tested beyond individual prompt responses?',
        hint: 'Multi-step task completion, tool-use accuracy across the full workflow, escalation behaviour, refusal behaviour, recovery from bad inputs.',
        answers: [
          { label: 'Only prompt-level testing', value: 0 },
          { label: 'Some workflow testing but informal', value: 1 },
          { label: 'Comprehensive end-to-end test suite', value: 2 },
          { label: 'Continuous end-to-end testing in staging & production shadow', value: 3 },
        ],
      },
      {
        id: 'test_2',
        text: 'Are conceptual soundness and design assumptions formally reviewed?',
        hint: 'For an agent: does the objective, tools, permissions, memory, orchestration, policy constraints, and human checkpoints make sense for the delegated work?',
        answers: [
          { label: 'No formal design review', value: 0 },
          { label: 'Informal peer review', value: 1 },
          { label: 'Structured design review with risk sign-off', value: 2 },
          { label: 'Independent review with formal attestation', value: 3 },
        ],
      },
      {
        id: 'test_3',
        text: 'Is the agent tested against policy conflicts and edge cases?',
        hint: 'What happens when two policies conflict? When retrieved data is stale or missing? When a tool fails mid-workflow? When input is adversarial?',
        answers: [
          { label: 'No conflict/edge case testing', value: 0 },
          { label: 'Some ad-hoc testing', value: 1 },
          { label: 'Structured test suite for known edge cases', value: 2 },
          { label: 'Adversarial red-teaming with continuous updates', value: 3 },
        ],
      },
      {
        id: 'test_4',
        text: 'Are the test scenarios representative of actual production conditions?',
        hint: 'Agents are often too difficult to test with traditional methods — are you using production-like data, real tool behaviour, live API responses?',
        answers: [
          { label: 'Synthetic/test data only', value: 0 },
          { label: 'Partially realistic data', value: 1 },
          { label: 'Production-mirror environment with anonymised real data', value: 2 },
          { label: 'Shadow production with staged roll-out', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'End-to-End Test Protocol',
        description: 'Task completion rates, tool-use accuracy, permission boundary testing, escalation and refusal behaviour, recovery testing, multi-agent interaction testing, and actual customer/business outcomes — not just text quality.',
      },
      {
        title: 'Red Team & Adversarial Testing',
        description: 'Structured red-teaming exercises covering prompt injection, corpus poisoning, tool-call manipulation, privilege escalation, and cascade failures. Regular updates as new attack patterns emerge.',
      },
      {
        title: 'Independent Conceptual Review',
        description: 'Someone who did not build the agent formally reviews whether the objective, tools, permissions, memory, orchestration, and human checkpoints are appropriate. Same standard as independent model validation.',
      },
    ],
  },
  {
    id: 'instrument',
    number: 4,
    title: 'Instrument the Runtime',
    subtitle: 'Visibility is governance — you cannot manage what you cannot see',
    icon: '◉',
    color: '#5A3472',
    questions: [
      {
        id: 'inst_1',
        text: 'Is there a comprehensive audit log of agent actions at runtime?',
        hint: 'What the agent was asked to do, what context it used, what tools it called, what data it accessed, what policy checks passed/failed, where humans approved or overrode.',
        answers: [
          { label: 'No runtime logging', value: 0 },
          { label: 'Basic logging, not comprehensive', value: 1 },
          { label: 'Comprehensive logs exist but not structured for governance review', value: 2 },
          { label: 'Structured audit logs designed for governance, audit & incident response', value: 3 },
        ],
      },
      {
        id: 'inst_2',
        text: 'Are runtime events connected to governance evidence requirements?',
        hint: 'Can you show regulators or auditors that controls worked? "We think controls work" vs. "we can show controls work."',
        answers: [
          { label: 'Logs exist for debugging only', value: 0 },
          { label: 'Logs exist but not accessible for governance review', value: 1 },
          { label: 'Logs structured for governance but manual reporting', value: 2 },
          { label: 'Real-time governance dashboard with audit-ready evidence packages', value: 3 },
        ],
      },
      {
        id: 'inst_3',
        text: 'Is there observability into the retrieval corpus and tool-call chains?',
        hint: 'Can you see what data the agent is pulling? What external platforms it\'s calling? Whether the vector store is returning relevant results?',
        answers: [
          { label: 'No observability into retrieval or tool calls', value: 0 },
          { label: 'Some observability, not comprehensive', value: 1 },
          { label: 'Full observability with alerting', value: 2 },
          { label: 'Real-time observability with automated anomaly detection', value: 3 },
        ],
      },
      {
        id: 'inst_4',
        text: 'Is the instrumentation designed for incident reconstruction?',
        hint: 'When something goes wrong, can you reconstruct exactly what happened, in what order, with what context?',
        answers: [
          { label: 'Cannot reconstruct incidents', value: 0 },
          { label: 'Partial reconstruction possible', value: 1 },
          { label: 'Full reconstruction with human effort', value: 2 },
          { label: 'Automatic incident reconstruction with causal chain analysis', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Comprehensive Audit Trail',
        description: 'Every agent request, context used, tool call, data access, policy check, human approval/override, and outcome. Not just for debugging — this is governance evidence. Tamper-evident logging.',
      },
      {
        title: 'Runtime Observability Dashboard',
        description: 'Real-time visibility into what the agent is doing, connected to thresholds. Who is seeing this dashboard? Who has authority to act on what they see?',
      },
      {
        title: 'Evidence Package System',
        description: 'Pre-built evidence packages for audit, regulatory review, and vendor challenge. When an examiner asks, you can produce the records in minutes, not weeks.',
      },
    ],
  },
  {
    id: 'monitor',
    number: 5,
    title: 'Monitor Outcomes Continuously',
    subtitle: 'Runtime governance — the heart of agent risk management',
    icon: '◎',
    color: '#7A3B1C',
    questions: [
      {
        id: 'mon_1',
        text: 'Is there a formal ongoing monitoring programme for agent outcomes?',
        hint: 'Not just a dashboard — a programme. Who reviews it? How often? What triggers a review?',
        answers: [
          { label: 'No formal monitoring programme', value: 0 },
          { label: 'Ad-hoc monitoring when issues arise', value: 1 },
          { label: 'Formal programme but manual reporting', value: 2 },
          { label: 'Automated monitoring with threshold-triggered escalation', value: 3 },
        ],
      },
      {
        id: 'mon_2',
        text: 'Are the right things being monitored — not just activity but outcomes?',
        hint: 'Action success/failure rates, policy breaches, near misses, escalation patterns, unusual tool-call behaviour, customer complaints, drift in retrieved content or model behaviour.',
        answers: [
          { label: 'Activity metrics only (volume, latency)', value: 0 },
          { label: 'Some outcome metrics tracked', value: 1 },
          { label: 'Comprehensive outcome metrics with regular review', value: 2 },
          { label: 'Outcome metrics connected to automated responses', value: 3 },
        ],
      },
      {
        id: 'mon_3',
        text: 'Are monitoring thresholds formally defined and connected to responses?',
        hint: 'If threshold X is breached, what happens? Who is notified? What is paused? This is where most monitoring programmes fail.',
        answers: [
          { label: 'No formal thresholds', value: 0 },
          { label: 'Thresholds defined but not connected to response', value: 1 },
          { label: 'Thresholds with defined responses', value: 2 },
          { label: 'Automated threshold responses with runbooks', value: 3 },
        ],
      },
      {
        id: 'mon_4',
        text: 'Is there monitoring for vendor and platform behaviour changes?',
        hint: 'The agent may depend on a foundation model or external platform that continues to evolve. Are you watching for changes that could affect agent behaviour?',
        answers: [
          { label: 'No vendor change monitoring', value: 0 },
          { label: 'Informal awareness only', value: 1 },
          { label: 'Formal vendor change monitoring process', value: 2 },
          { label: 'Automated monitoring with impact assessment triggers', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Outcome Monitoring Programme',
        description: 'A formal programme — not a dashboard — covering what is monitored, who reviews it, how often, what triggers a review, and what authority the reviewer has to act. Connected to SR 11-7 / APRA CPS 220 ongoing monitoring expectations.',
      },
      {
        title: 'Threshold-Driven Escalation',
        description: 'Every metric with a threshold must have a defined response. When breached: who is notified, what is paused, what gets reviewed, what authority is invoked. Without this, monitoring is theatre.',
      },
      {
        title: 'Vendor & Model Behaviour Monitoring',
        description: 'Tracking changes in the foundation model, external platforms, APIs, and retrieval corpus. Version tracking, change log monitoring, and impact assessment when vendor behaviour shifts.',
      },
    ],
  },
  {
    id: 'verify',
    number: 6,
    title: 'Trust, But Verify',
    subtitle: 'Independent challenge — because the builders will believe in the build',
    icon: '⬡',
    color: '#3D5A7A',
    questions: [
      {
        id: 'ver_1',
        text: 'Is there a formally independent review function for agent systems?',
        hint: 'Not the team that built it. Not the team that runs it. Someone with authority to challenge whether the operating envelope is appropriate.',
        answers: [
          { label: 'No independent review function', value: 0 },
          { label: 'Informal peer review', value: 1 },
          { label: 'Structured independent review (e.g., model risk, second line)', value: 2 },
          { label: 'Formal independent review with attestation and sign-off authority', value: 3 },
        ],
      },
      {
        id: 'ver_2',
        text: 'Does independent review cover the full socio-technical system?',
        hint: 'Not just the model or prompt — the objectives, tools, permissions, memory, orchestration, policy constraints, human checkpoints, and operational context.',
        answers: [
          { label: 'Independent review of model/prompt only', value: 0 },
          { label: 'Review covers some system components', value: 1 },
          { label: 'Full socio-technical system review', value: 2 },
          { label: 'Full review with regular re-validation cycles', value: 3 },
        ],
      },
      {
        id: 'ver_3',
        text: 'Is there regular re-validation as the agent, vendor, or environment changes?',
        hint: 'Conditions, uses, products, exposures, clients, data relevance, and market conditions change over time. Is the agent re-validated periodically?',
        answers: [
          { label: 'One-time validation only', value: 0 },
          { label: 'Re-validation on ad-hoc basis', value: 1 },
          { label: 'Scheduled periodic re-validation', value: 2 },
          { label: 'Continuous re-validation triggered by change events', value: 3 },
        ],
      },
      {
        id: 'ver_4',
        text: 'Are governance arrangements reviewed as AI adoption accelerates?',
        hint: 'ASIC warned that a governance gap could emerge as AI adoption accelerates. Is your governance keeping pace with the scope of agent deployment?',
        answers: [
          { label: 'No governance gap assessment', value: 0 },
          { label: 'Informal annual review', value: 1 },
          { label: 'Formal periodic governance review', value: 2 },
          { label: 'Continuous governance assessment scaled to deployment pace', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Independent Review Function',
        description: 'Model risk, second line risk, or specialist AI risk function — whoever is independent of the build and run teams. With authority to challenge the operating envelope, thresholds, test quality, and monitoring coverage.',
      },
      {
        title: 'Full System Re-Validation',
        description: 'Periodic re-validation as conditions change: model updates, vendor changes, new tools, new use cases, new regulatory requirements, or material incidents. Triggered re-validation on significant events.',
      },
      {
        title: 'Aggregate Risk Visibility',
        description: 'A consolidated view of all agents, their action-spaces, their risk ratings, and their current monitoring status. So the organisation can see its total agent exposure, not just individual system views.',
      },
    ],
  },
  {
    id: 'correct',
    number: 7,
    title: 'Correct Quickly',
    subtitle: 'A risk system that cannot change is a reporting system, not a risk system',
    icon: '⛁',
    color: '#6B3A2A',
    questions: [
      {
        id: 'corr_1',
        text: 'Is there a formal incident response playbook for agent failures?',
        hint: 'When an agent drifts, fails, surprises us, or produces poor outcomes — is there a pre-defined playbook or does everyone improvise?',
        answers: [
          { label: 'No incident playbook', value: 0 },
          { label: 'Generic IT incident playbook', value: 1 },
          { label: 'Agent-specific playbook defined', value: 2 },
          { label: 'Agent-specific playbook tested, maintained, and integrated with business continuity', value: 3 },
        ],
      },
      {
        id: 'corr_2',
        text: 'Can the organisation actually pull an agent back when needed?',
        hint: 'Circuit breakers, rollback capability, kill switches, immediate access removal. Not just "we could theoretically stop it."',
        answers: [
          { label: 'No formal rollback/decommission capability', value: 0 },
          { label: 'Manual process to decommission', value: 1 },
          { label: 'Technical rollback capability defined', value: 2 },
          { label: 'Automated circuit-breaker with tested rollback', value: 3 },
        ],
      },
      {
        id: 'corr_3',
        text: 'Is customer impact addressed as part of the correction process?',
        hint: 'When the agent produces poor outcomes, do you have a process for customer notification, remediation, and regulatory reporting?',
        answers: [
          { label: 'No customer impact process defined', value: 0 },
          { label: 'Legal/compliance-led response only', value: 1 },
          { label: 'Defined customer notification and remediation process', value: 2 },
          { label: 'Integrated customer response with regulatory reporting built-in', value: 3 },
        ],
      },
      {
        id: 'corr_4',
        text: 'Is there a formal remediation tracking and lessons-learned process?',
        hint: 'When an incident is resolved, does it drive system improvement? Or does the same failure happen again six months later?',
        answers: [
          { label: 'Incidents resolved, no formal lessons learned', value: 0 },
          { label: 'Informal lessons captured', value: 1 },
          { label: 'Formal remediation tracking with risk sign-off', value: 2 },
          { label: 'Closed-loop remediation with system improvement and governance attestation', value: 3 },
        ],
      },
    ],
    controls: [
      {
        title: 'Incident Response Playbook',
        description: 'Immediate actions: customer contact, regulatory notification, system isolation. Then longer-term response: reduce action-space, tighten retrieval, add approval gates, change model or vendor, retrain users, decommission. Pre-defined, rehearsed, maintained.',
      },
      {
        title: 'Circuit Breakers & Rollback',
        description: 'Technical ability to immediately halt the agent, revoke permissions, and restore state. Tested and documented. Not improvised at 2am during an incident.',
      },
      {
        title: 'Virtuous Correction Cycle',
        description: 'When the system drifts, fails, or surprises — the organisation has the sensing, authority, and discipline to pull it back. Incidents drive improvement. Monitoring feeds design. Governance drives accountability.',
      },
    ],
  },
]

// ─── Scoring Helpers ───────────────────────────────────────────────────────────

type Answers = Record<string, number>

function scoreDomain(domain: Domain, answers: Answers): number {
  const total = domain.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  const max = domain.questions.length * 3
  return Math.round((total / max) * 100)
}

function scoreColor(pct: number): string {
  if (pct >= 75) return '#2D5A3D'
  if (pct >= 50) return '#8B6914'
  return '#8B2C2C'
}

function scoreLabel(pct: number): string {
  if (pct >= 75) return 'Mature'
  if (pct >= 50) return 'Developing'
  if (pct >= 25) return 'Initial'
  return 'Nascent'
}

function scoreDescription(pct: number, domain: Domain): string {
  if (pct >= 75) return `Your ${domain.title} controls are well-established. Maintain rigour and ensure continuous re-validation as the system and environment evolve.`
  if (pct >= 50) return `${domain.title} has foundational elements but significant gaps remain. Prioritise the unanswered questions below to move toward maturity.`
  if (pct >= 25) return `${domain.title} is in early stages. The concepts are understood but not implemented. Focus on the highest-impact controls first.`
  return `${domain.title} requires substantial work. This is the highest-risk area of your agent governance programme. Immediate attention is needed.`
}

function maturityBarColor(pct: number): string {
  if (pct >= 75) return 'var(--green)'
  if (pct >= 50) return 'var(--amber)'
  if (pct >= 25) return 'var(--orange)'
  return 'var(--red)'
}

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          SECTION {current} OF {total}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--accent)',
          borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}

function DomainCard({ domain, open, onClick }: { domain: Domain; open: boolean; onClick: () => void }) {
  return (
    <div style={{
      border: `1px solid ${open ? domain.color : 'var(--border)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      boxShadow: open ? `0 4px 24px rgba(0,0,0,0.08)` : 'none',
    }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: open ? `${domain.color}08` : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'left',
        }}
      >
        <span style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: `${domain.color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0,
          color: domain.color,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>
          {String(domain.number).padStart(2, '0')}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {domain.title}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: 400 }}>
            {domain.subtitle}
          </div>
        </div>
        <span style={{
          color: domain.color,
          fontSize: '0.85rem',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
    </div>
  )
}

function QuestionCard({ question, value, onChange }: {
  question: Question
  value: number
  onChange: (val: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const selected = question.answers.find(a => a.value === value)

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '0.75rem',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          marginTop: '0.4rem',
          flexShrink: 0,
          background: selected ? 'var(--accent)' : 'var(--border)',
          border: selected ? 'none' : '1.5px solid var(--text-secondary)',
          transition: 'all 0.2s ease',
        }} />
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          lineHeight: 1.4,
          transition: 'color 0.2s ease',
        }}>
          {question.text}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '0 1.25rem 1rem 2.5rem' }}>
          {question.hint && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              marginBottom: '0.75rem',
              lineHeight: 1.5,
              borderLeft: '2px solid var(--border)',
              paddingLeft: '0.75rem',
            }}>
              {question.hint}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {question.answers.map((answer) => (
              <button
                key={answer.value}
                onClick={() => onChange(answer.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: answer.value === value ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: answer.value === value ? 'var(--accent-bg)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: answer.value === value ? 'none' : '1.5px solid var(--text-secondary)',
                  background: answer.value === value ? 'var(--accent)' : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {answer.value === value && (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  color: answer.value === value ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: answer.value === value ? 500 : 400,
                  lineHeight: 1.3,
                }}>
                  {answer.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsView({ answers }: { answers: Answers }) {
  const domainScores = DOMAINS.map(d => ({
    domain: d,
    score: scoreDomain(d, answers),
  }))
  const overallPct = Math.round(domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length)

  const sortedByRisk = [...domainScores].sort((a, b) => a.score - b.score)

  const overallMaturityColor = scoreColor(overallPct)
  const overallLabel = scoreLabel(overallPct)

  return (
    <div style={{ animation: 'fadeUp 0.6s ease' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block',
          background: `${overallMaturityColor}12`,
          border: `1px solid ${overallMaturityColor}30`,
          borderRadius: '100px',
          padding: '0.35rem 1rem',
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: overallMaturityColor,
          letterSpacing: '0.08em',
          fontWeight: 500,
        }}>
          ASSESSMENT COMPLETE
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          lineHeight: 1.15,
        }}>
          Agent Risk Maturity Score
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
          Based on your self-assessment across {DOMAINS.length} risk management domains
        </p>
      </div>

      {/* Overall Score */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
        }}>OVERALL MATURITY</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3.5rem, 10vw, 5.5rem)',
          fontWeight: 700,
          color: overallMaturityColor,
          lineHeight: 1,
          marginBottom: '0.25rem',
        }}>
          {overallPct}
          <span style={{ fontSize: '0.35em', fontWeight: 400, color: 'var(--text-secondary)' }}>%</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: `${overallMaturityColor}12`,
          borderRadius: '100px',
          padding: '0.3rem 0.85rem',
          marginBottom: '1rem',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overallMaturityColor }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: overallMaturityColor }}>
            {overallLabel}
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto' }}>
          {overallPct >= 75
            ? 'Your agent risk management programme demonstrates genuine organisational maturity. Continue to invest in independent challenge and continuous improvement.'
            : overallPct >= 50
            ? 'Your programme has solid foundations but significant gaps remain across key domains. Prioritise the lowest-scoring areas below.'
            : overallPct >= 25
            ? 'Agent risk management is in early stages. Immediate focus on the highest-priority gaps will reduce your exposure most effectively.'
            : 'Your organisation has substantial work ahead. Agent governance requires dedicated attention before further deployment.'}
        </p>
      </div>

      {/* Per-Domain Breakdown */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        Domain Breakdown
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {domainScores.map(({ domain, score }) => {
          const color = scoreColor(score)
          const label = scoreLabel(score)
          return (
            <div key={domain.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: domain.color,
                  fontWeight: 500,
                  width: '24px',
                  flexShrink: 0,
                }}>
                  {String(domain.number).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  flex: 1,
                }}>
                  {domain.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color,
                }}>
                  {score}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{
                  height: '100%',
                  width: `${score}%`,
                  background: color,
                  borderRadius: '2px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color,
                  background: `${color}10`,
                  borderRadius: '4px',
                  padding: '0.1rem 0.4rem',
                }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {domain.questions.length} questions · max {domain.questions.length * 3} pts
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Priority Improvement Areas */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        Priority Improvement Areas
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {sortedByRisk.map(({ domain, score }) => (
          <div key={domain.id} style={{
            background: `${scoreColor(score)}08`,
            border: `1px solid ${scoreColor(score)}25`,
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: scoreColor(score),
                fontWeight: 600,
                background: `${scoreColor(score)}15`,
                borderRadius: '4px',
                padding: '0.15rem 0.4rem',
                flexShrink: 0,
                marginTop: '0.1rem',
              }}>
                {score}%
              </span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {domain.title}
                </div>
                {domain.controls.map((ctrl, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: i < domain.controls.length - 1 ? '0.5rem' : 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ctrl.title}: </span>
                    {ctrl.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Reference */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        The Seven Controls Framework
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {DOMAINS.map(({ id, number, title, controls, color }) => (
          <details key={id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <summary style={{
              padding: '0.85rem 1.25rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              listStyle: 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color,
                fontWeight: 600,
              }}>
                {String(number).padStart(2, '0')}
              </span>
              {title}
            </summary>
            <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
              {controls.map((ctrl, i) => (
                <div key={i} style={{
                  padding: '0.85rem',
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  marginBottom: i < controls.length - 1 ? '0.5rem' : 0,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.3rem',
                  }}>
                    {ctrl.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {ctrl.description}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Regulatory Context */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        Regulatory Alignment
      </h2>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        {[
          { jurisdiction: 'United States', framework: 'SR 11-7 / 2026 Revised Interagency Guidance', note: 'Conceptual soundness, outcomes analysis, ongoing monitoring. GenAI and agentic systems effectively moved back to institution-defined standards.' },
          { jurisdiction: 'United Kingdom', framework: 'PRA SS1/23', note: 'Model identification, risk classification, governance, development, independent validation, monitoring, mitigants.' },
          { jurisdiction: 'Australia', framework: 'APRA CPS 220 + CPS 230 + ASIC Report 798', note: 'Operational resilience, third-party AI supplier risk, governance gap warnings. Existing obligations apply with no AI-specific rulebook needed.' },
          { jurisdiction: 'Singapore', framework: '2026 Model AI Governance Framework for Agentic AI', note: 'Autonomy and action-space as the central frame. Gradual rollout with continuous monitoring. Authoritative reference for agent-specific guidance.' },
        ].map(({ jurisdiction, framework, note }, i) => (
          <div key={i} style={{
            padding: '1rem 1.25rem',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>
                {jurisdiction}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {framework}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
              {note}
            </p>
          </div>
        ))}
      </div>

      {/* Regulatory Context */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.05em',
          lineHeight: 1.7,
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          This self-assessment framework draws on industry standards, regulatory guidance, and practitioner experience across financial services. It is designed for risk functions, compliance teams, and technology leaders managing AI agent deployments.
        </p>
        <button
          onClick={() => window.print()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          Save / Print Results
        </button>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [section, setSection] = useState(0) // 0=intro, 1..7=domains, 8=results
  const [answers, setAnswers] = useState<Answers>({})
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const domain = section >= 1 && section <= 7 ? DOMAINS[section - 1] : null

  useEffect(() => {
    if (section > 0) {
      // Instant scroll without animation to prevent flickering
      topRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
  }, [section])

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const answeredForDomain = domain
    ? domain.questions.filter(q => answers[q.id] !== undefined).length
    : 0
  const allAnsweredForDomain = domain
    ? domain.questions.every(q => answers[q.id] !== undefined)
    : false

  const totalAnswered = Object.keys(answers).length
  const totalQuestions = DOMAINS.reduce((sum, d) => sum + d.questions.length, 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        body { margin: 0; }
        @media print {
          body { background: white; }
          button { display: none !important; }
        }
      `}</style>

      <div ref={topRef} />

      <div style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
      }}>

        {/* Header */}
        <header style={{ marginBottom: '2.5rem', paddingTop: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
            fontWeight: 500,
          }}>
            RISK MANAGEMENT FRAMEWORK
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.15,
          }}>
            Agent Risk Management
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-secondary)' }}>
              Self-Assessment Survey
            </span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '480px',
          }}>
            A structured diagnostic across 7 risk management domains for organisations deploying AI agents in financial services.
          </p>
          <div style={{
            width: '40px',
            height: '2px',
            background: 'var(--accent)',
            marginTop: '1rem',
            borderRadius: '1px',
          }} />
        </header>

        {/* ── INTRO ── */}
        {section === 0 && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '2rem',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}>
                About this Assessment
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                This self-assessment framework covers 7 risk management domains. Each domain includes questions drawn from industry standards, regulatory guidance, and practitioner experience. Your responses generate a maturity score across all 7 domains, with prioritised recommendations for improvement.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {DOMAINS.map(d => (
                  <div key={d.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: `${d.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: d.color,
                      flexShrink: 0,
                    }}>
                      {String(d.number).padStart(2, '0')}
                    </span>
                    {d.title}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                Each question includes guidance based on the 7-domain risk management framework. Your responses generate a maturity score across all 7 domains, with prioritised recommendations for improvement.
              </p>
            </div>

            <div style={{
              background: `${DOMAINS[0].color}08`,
              border: `1px solid ${DOMAINS[0].color}25`,
              borderRadius: '14px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                The Core Question
              </h3>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                "Can we design an organisational risk management system that keeps delegated autonomy inside an acceptable operating envelope over time?"
              </p>
            </div>

            <button
              onClick={() => setSection(1)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--text-primary)',
                color: '#FDFCF8',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s ease',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Begin Assessment →
            </button>
          </div>
        )}

        {/* ── DOMAIN SECTION ── */}
        {domain && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            <ProgressBar current={section} total={7} />

            {/* Domain Header */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: domain.color,
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}>
                DOMAIN {domain.number} OF 7
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
                lineHeight: 1.2,
              }}>
                {domain.title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                {domain.subtitle}
              </p>
            </div>

            {/* Questions */}
            <div style={{ marginBottom: '1.75rem' }}>
              {domain.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  value={answers[question.id] ?? -1}
                  onChange={(val) => handleAnswer(question.id, val)}
                />
              ))}
            </div>

            {/* Controls Reference */}
            <div
              style={{
                background: `${domain.color}06`,
                border: `1px solid ${domain.color}20`,
                borderRadius: '10px',
                marginBottom: '1.75rem',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: domain.color,
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{expandedDomain === domain.id ? '−' : '+'}</span>
                What are the recommended controls for this domain?
              </button>
              <div 
                style={{ 
                  display: expandedDomain === domain.id ? 'block' : 'none',
                  padding: '0 1.25rem 1rem 1.25rem',
                }}
              >
                {domain.controls.map((ctrl, i) => (
                  <div key={i} style={{
                    padding: '0.85rem',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    marginBottom: i < domain.controls.length - 1 ? '0.5rem' : 0,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.3rem',
                    }}>
                      {ctrl.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {ctrl.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {section > 1 && (
                <button
                  onClick={() => setSection(section - 1)}
                  style={{
                    flex: '0 0 auto',
                    padding: '0.85rem 1.25rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => {
                  if (section === 7 && allAnsweredForDomain) {
                    setSection(8)
                  } else if (allAnsweredForDomain) {
                    setSection((s) => s + 1)
                  } else {
                    setSection((s) => s + 1)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: allAnsweredForDomain ? 'var(--text-primary)' : 'var(--border)',
                  color: allAnsweredForDomain ? '#FDFCF8' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: allAnsweredForDomain ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                disabled={!allAnsweredForDomain}
              >
                {section === 7 && allAnsweredForDomain
                  ? 'View Results →'
                  : `${answeredForDomain}/${domain.questions.length} answered · Continue →`}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {section === 8 && <ResultsView answers={answers} />}

        {/* Progress dots — only during survey */}
        {section >= 1 && section <= 7 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.4rem',
            marginTop: '2rem',
            flexWrap: 'wrap',
          }}>
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setSection(d.number)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: section === d.number ? d.color : 'var(--border)',
                  transition: 'all 0.2s ease',
                  transform: section === d.number ? 'scale(1.3)' : 'scale(1)',
                }}
                title={d.title}
              />
            ))}
          </div>
        )}

        {/* Restart */}
        {section === 8 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => { setSection(0); setAnswers({}); setExpandedDomain(null) }}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
              }}
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
