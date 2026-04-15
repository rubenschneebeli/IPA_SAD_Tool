import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { documents, type DocumentDto } from '../api'
import NavBar from '../components/NavBar'
import './OverviewPages.css'
import trashIcon from '../assets/trashIcon.svg'

export default function DocumentOverview() {
  const [list, setList] = useState<DocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setList(await documents.getAll())
    } catch {
      setError('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await documents.delete(id)
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
            <h1>Documents</h1>
          </div>
    
        </header>

          <div className="toolbar">
          <button className="btn secondaryButton" onClick={() => navigate('/templates/')}>
            Back to Templates
          </button>
        </div>
        {error && <p className="error">{error}</p>}

        {loading ? (
          <div className="loader"><div className="spinner" />Loading...</div>
        ) : list.length === 0 ? (
          <p className="empty">There are no Documents yet, create a new Document</p>
        ) : (
          <div className="grid">
            {list.map(t => (
              <div key={t.id} className="card">
                <div className="card-head">
                  <div className="label">Document</div>
                  <button className="deleteButton" onClick={() => handleDelete(t.id)} title="Delete">
                    <img src={trashIcon} width={14} height={14} />
                  </button>
                </div>
                <h3>{t.title}</h3>
                <p className="meta">Template: {t.templateTitle ?? '—'}</p>
                <p className="meta">Created by: {t.createdByUsername ?? '—'}</p>
                <p className="meta">Created: {new Date(t.createdAt).toLocaleDateString('en-GB')}</p>
                <div className="card-btns">
                  <button className="btn primaryButton" onClick={() => navigate(`/documents/${t.id}/edit`)}>
                    Edit
                  </button>
                  <button className="btn secondaryButton" /*onClick={() => PDF export*/>
                    Export as PDF
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
