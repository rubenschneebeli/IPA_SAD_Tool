import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { templates } from '../api'
import RichTextEditor from '../components/RichTextEditor'
import NavBar from '../components/NavBar'

const DEFAULT_HTML = `
<h1>Software Architecture Document</h1>
<p><strong>Project:</strong> [Project Name]</p>
<p><strong>Version:</strong> 1.0</p>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Author:</strong> [Author]</p>

<h2>1. Introduction</h2>
<p>This document describes the software architecture of [Project Name]. It serves as the central reference for all architectural decisions and technical design choices made during development.</p>

<h2>2. Business Context</h2>
<p>Describe the business background and the problem this system solves within the banking context. Include regulatory requirements (e.g. PSD2, DSGVO, FINMA) that influence the architecture.</p>

<h2>3. System Overview</h2>
<p>High-level description of the system and its purpose. Include a brief description of the system boundaries and its role within the broader banking infrastructure.</p>

<h2>4. Stakeholders</h2>
<p>List the key stakeholders and their architectural concerns:</p>
<ul>
  <li><strong>Product Owner:</strong> Feature delivery, time-to-market</li>
  <li><strong>Security Team:</strong> Data protection, compliance, audit trails</li>
  <li><strong>Operations:</strong> Availability, monitoring, deployability</li>
  <li><strong>Compliance:</strong> Regulatory requirements, data residency</li>
</ul>

<h2>5. Architecture Decisions</h2>
<p>Document the key architectural decisions (ADRs) and their rationale:</p>
<ul>
  <li><strong>ADR-01:</strong> [Decision title] — [Rationale]</li>
  <li><strong>ADR-02:</strong> [Decision title] — [Rationale]</li>
</ul>

<h2>6. System Components</h2>
<p>Description of the individual system components and their responsibilities. Include which team owns each component.</p>

<h2>7. Data Architecture</h2>
<p>Overview of the data model, storage strategy and data flows. Include data classification (e.g. PII, financial data) and corresponding handling requirements.</p>

<h2>8. Integration & Interfaces</h2>
<p>Description of internal and external interfaces:</p>
<ul>
  <li><strong>Internal:</strong> APIs consumed from other internal services (e.g. core banking, identity provider)</li>
  <li><strong>External:</strong> Third-party integrations (e.g. payment networks, SWIFT, card schemes)</li>
</ul>

<h2>9. Security Architecture</h2>
<p>Security requirements and measures relevant to this system:</p>
<ul>
  <li><strong>Authentication:</strong> [e.g. OAuth2 / OIDC via internal IdP]</li>
  <li><strong>Authorization:</strong> [e.g. Role-based access control]</li>
  <li><strong>Encryption:</strong> [e.g. TLS 1.3 in transit, AES-256 at rest]</li>
  <li><strong>Audit Logging:</strong> [e.g. All financial transactions logged with tamper-proof audit trail]</li>
</ul>

<h2>10. Deployment & Infrastructure</h2>
<p>Describe the deployment model, environments (dev/test/prod) and infrastructure. Include cloud provider, on-premise requirements and data residency constraints.</p>

<h2>11. Availability & Resilience</h2>
<p>Define SLA targets and describe measures to meet them:</p>
<ul>
  <li><strong>Target Availability:</strong> [e.g. 99.95%]</li>
  <li><strong>RPO / RTO:</strong> [Recovery Point / Time Objectives]</li>
  <li><strong>Failover Strategy:</strong> [e.g. Active-active across two data centres]</li>
</ul>

<h2>12. Open Issues & Risks</h2>
<p>Document known open questions, unresolved decisions and technical risks that need to be addressed.</p>
`

export default function TemplateEditorPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    templates.getById(id!).then(t => {
      setTitle(t.title)
      setHtml(t.htmlContent)
    }).catch(() => {
      setError('Failed to load template.')
    })
  }, [id, isEditing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isEditing) {
        await templates.update(id!, { title, htmlContent: html })
      } else {
        await templates.create({ title, htmlContent: html })
      }
      navigate('/templates')
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <header className="pageHeader">
          <div>
            <h1>{isEditing ? 'Edit Template' : 'New Template'}</h1>
          </div>
        </header>
        <button className="btn secondaryButton" onClick={() => navigate('/templates')}>
            ← Back
          </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter your Template title"
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <RichTextEditor content={html} onChange={setHtml} />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn primaryButton" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn secondaryButton" onClick={() => navigate('/templates')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
