import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { templates, type TemplateDto } from '../api'
import NavBar from '../components/NavBar'
import './OverviewPages.css'
import trashIcon from '../assets/trashIcon.svg'

const PAGE_SIZES = [6, 12, Infinity]

export default function TemplatesPage() {
  const [list, setList] = useState<TemplateDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(6)

  const totalPages = pageSize === Infinity ? 1 : Math.ceil(list.length / pageSize)
  const paged = pageSize === Infinity ? list : list.slice(page * pageSize, (page + 1) * pageSize)

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(0)
  }


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
          <p className="empty">There are no Templates yet, create a new Template</p>
        ) : (
          <div className="grid">
            {paged.map(t => (
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
        <div className="pagination">
          <div className="paginationButtons">
            {PAGE_SIZES.map(s => (
              <button
                key={s}
                className={`pageSizeButton ${pageSize === s ? 'active' : ''}`}
                onClick={() => handlePageSizeChange(s)}
              >
                {s === Infinity ? 'All' : s}
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="paginationNavigation">
              <button className="pageNavButton" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ‹
              </button>
              <span className="pageInfo">{page + 1} / {totalPages}</span>
              <button className="pageNavButton" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>
                ›
              </button>
            </div>
          )}
        </div>
      </div>

    </>
  )
}
