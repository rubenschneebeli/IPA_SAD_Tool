import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { templates } from '../api'
import RichTextEditor from '../components/RichTextEditor'
import NavBar from '../components/NavBar'

const DEFAULT_HTML = `
<h1>Software Architecture Document</h1>

<h2>Introduction</h2>
<p>Insert a brief description of the project and the purpose of this document. Explain what system is being documented and why this architecture document exists.</p>

<h2>Business Context</h2>
<p>Insert the business background and the problem this system solves. Include any relevant regulatory requirements (e.g. PSD2, DSGVO, FINMA) that influence the architecture.</p>

<h2>System Overview</h2>
<p>Insert a high-level description of the system, its purpose and its role within the broader banking infrastructure. Describe the system boundaries.</p>

<h2>Stakeholders</h2>
<p>Insert the key stakeholders and their architectural concerns:</p>
<ul>
  <li><strong>Product Owner:</strong> Insert concerns (e.g. feature delivery, time-to-market)</li>
  <li><strong>Security Team:</strong> Insert concerns (e.g. data protection, compliance, audit trails)</li>
  <li><strong>Operations:</strong> Insert concerns (e.g. availability, monitoring, deployability)</li>
  <li><strong>Compliance:</strong> Insert concerns (e.g. regulatory requirements, data residency)</li>
</ul>

<h2>Architecture Decisions</h2>
<p>Insert the key architectural decisions (ADRs) and their rationale:</p>
<ul>
  <li><strong>ADR-01:</strong> Insert decision title — Insert rationale</li>
  <li><strong>ADR-02:</strong> Insert decision title — Insert rationale</li>
</ul>

<h2>System Components</h2>
<p>Insert a description of the individual system components and their responsibilities. Include which team owns each component.</p>

<h2>Data Architecture</h2>
<p>Insert an overview of the data model, storage strategy and data flows. Include data classification (e.g. PII, financial data) and the corresponding handling requirements.</p>

<h2>Integration & Interfaces</h2>
<p>Insert a description of internal and external interfaces:</p>
<ul>
  <li><strong>Internal:</strong> Insert APIs consumed from internal services (e.g. core banking, identity provider)</li>
  <li><strong>External:</strong> Insert third-party integrations (e.g. payment networks, SWIFT, card schemes)</li>
</ul>

<h2>Security Architecture</h2>
<p>Insert the security requirements and measures relevant to this system:</p>
<ul>
  <li><strong>Authentication:</strong> Insert authentication method (e.g. OAuth2 / OIDC via internal IdP)</li>
  <li><strong>Authorization:</strong> Insert authorization model (e.g. role-based access control)</li>
  <li><strong>Encryption:</strong> Insert encryption standards (e.g. TLS 1.3 in transit, AES-256 at rest)</li>
  <li><strong>Audit Logging:</strong> Insert audit logging approach (e.g. all financial transactions logged with tamper-proof audit trail)</li>
</ul>

<h2>Deployment & Infrastructure</h2>
<p>Insert the deployment model, environments (dev / test / prod) and infrastructure details. Include cloud provider, on-premise requirements and data residency constraints.</p>

<h2>Availability & Resilience</h2>
<p>Insert SLA targets and describe the measures to meet them:</p>
<ul>
  <li><strong>Target Availability:</strong> Insert availability target (e.g. 99.95%)</li>
  <li><strong>RPO / RTO:</strong> Insert recovery point and recovery time objectives</li>
  <li><strong>Failover Strategy:</strong> Insert failover approach (e.g. active-active across two data centres)</li>
</ul>

<h2>Open Issues & Risks</h2>
<p>Insert known open questions, unresolved decisions and technical risks that still need to be addressed.</p>
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
