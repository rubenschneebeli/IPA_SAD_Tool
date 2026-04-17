import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { documents, templates, type DocumentDto } from '../api'
import RichTextEditor from '../components/RichTextEditor'
import ExpandableChapters from '../components/ExpandableChapters'
import { parseChapters, mergeChapters, type Chapter } from '../components/ChapterParser'
import NavBar from '../components/NavBar'
import './DocumentEditorPage.css'

type ViewMode = 'full' | 'chapters'

export default function DocumentEditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEditing = !!id
  const navigate = useNavigate()

  const [doc, setDoc] = useState<DocumentDto | null>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [html, setHtml] = useState('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [view, setView] = useState<ViewMode>('chapters')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) {
      documents.getById(id!).then(data => {
        setDoc(data)
        setTitle(data.title)
        setHtml(data.htmlContent)
        setChapters(parseChapters(data.htmlContent))
        setLoading(false)
      }).catch(() => {
        setError('Failed to load document.')
        setLoading(false)
      })
    } else {

        const templateId = searchParams.get('templateId')
      if (!templateId) { navigate('/templates'); return }
      setTemplateId(templateId)
      templates.getById(templateId).then(tmpl => {
        setTitle(`SAD Document ${new Date().toLocaleDateString('en-GB')}`)
        const parsed = parseChapters(tmpl.htmlContent)
        const chaps = parsed
          .filter(chapter => chapter.title !== '')
          .map(chapter => ({
            title: chapter.title,
            content: '',
            placeholder: chapter.content.replace(/<[^>]*>/g, '').trim(),
          }))
        setChapters(chaps)
        setHtml(mergeChapters(chaps))
        setLoading(false)
      }).catch(() => {
        setError('Failed to load template.')
        setLoading(false)
      })
    }
  }, [id, isEditing, searchParams, navigate])

  function switchView(mode: ViewMode) {
    if (mode === 'chapters') {
      setChapters(parseChapters(html))
    } else {
      setHtml(mergeChapters(chapters))
    }
    setView(mode)
  }

  function handleChaptersChange(updated: Chapter[]) {
    setChapters(updated)
    setHtml(mergeChapters(updated))
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const content = view === 'chapters' ? mergeChapters(chapters) : html
    try {
      if (isEditing) {
        await documents.update(id!, { title, htmlContent: content })
        setDoc(prev => prev ? { ...prev, title, htmlContent: content } : null)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        const created = await documents.create({ title, templateId: templateId! })
        await documents.update(created.id, { title, htmlContent: content })
        navigate(`/documents/${created.id}/edit`, { replace: true })
      }
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loader"><div className="spinner" />Loading...</div>
  if (error && !doc && !html) return <p className="error">{error}</p>

  return (
    <>
      <NavBar   />
      <div className="container">
        <header className="pageheader">
          <div>
            <h1>{title || 'New Document'}</h1>
            {doc && <p className="subtitle">Template: {doc.templateTitle}</p>}
          </div>
          <div className="pageActions">
            <button className="btn secondaryButton" onClick={() => navigate('/documents')}>
              ← Back
            </button>
            {doc && (
              <button className="btn primaryButton" onClick={() => documents.downloadPdf(doc.id, doc.title)}>
                Export PDF
              </button>
            )}
          </div>
        </header>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="toggle">
            <button type="button" className={`toggleButton ${view === 'full' ? 'active' : ''}`} onClick={() => switchView('full')}>
              Full View
            </button>
            <button type="button" className={`toggleButton ${view === 'chapters' ? 'active' : ''}`} onClick={() => switchView('chapters')}>
              Chapters
            </button>
          </div>

          <div className="form-group">
            {view === 'full' ? (
              <RichTextEditor content={html} onChange={setHtml} readOnly />
            ) : (
              <ExpandableChapters chapters={chapters} onChange={handleChaptersChange} />
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <div className="formActions">
            <button type="submit" className="btn primaryButton" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && <span className="toast">✓ Saved</span>}
          </div>
        </form>
      </div>
    </>
  )
}
