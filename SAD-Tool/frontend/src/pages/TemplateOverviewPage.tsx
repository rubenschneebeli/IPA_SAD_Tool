import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { templates, type TemplateDto } from '../api'
import NavBar from '../components/NavBar'
import './TemplateOverview.css'
import trashIcon from '../assets/trashIcon.svg'

export default function TemplatesPage() {
  const [list, setList] = useState<TemplateDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setList(await templates.getAll())
    } catch {
      setError('Failed to load templates.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await templates.delete(id)
      setList(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <header className="pageHeader">
          <div>
            <h1>Templates</h1>
          </div>
        </header>

        <div className="toolbar">
          <button className="btn primaryButton" onClick={() => navigate('/templates/new')}>
            + New Template
          </button>
          <button className="btn secondaryButton" onClick={() => navigate('/documents')}>
            View Documents
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <div className="loader"><div className="spinner" />Loading...</div>
        ) : list.length === 0 ? (
          <p className="empty">There are no Templates yet, you can be the first to create a template</p>
        ) : (
          <div className="grid">
            {list.map(t => (
              <div key={t.id} className="card">
                <div className="card-head">
                  <div className="label">Template</div>
                  <button className="deleteButton" onClick={() => handleDelete(t.id)} title="Delete">
                    <img src={trashIcon} width={14} height={14} />
                  </button>
                </div>
                <h3>{t.title}</h3>
                <p className="meta">Created by: {t.createdByUsername ?? '—'}</p>
                <p className="meta">Created: {new Date(t.createdAt).toLocaleDateString('en-GB')}</p>
                <div className="card-btns">
                  <button className="btn primaryButton" onClick={() => navigate(`/documents/new?templateId=${t.id}`)}>
                    Create Document
                  </button>
                  <button className="btn secondaryButton" onClick={() => navigate(`/templates/${t.id}/edit`)}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
