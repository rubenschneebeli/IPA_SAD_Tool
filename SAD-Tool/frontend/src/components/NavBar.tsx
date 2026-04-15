import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import documentIcon from '../assets/documentIcon.svg'
import './Navbar.css'

export default function Nav() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const onTemplates = location.pathname.startsWith('/templates')
  const onDocuments = location.pathname.startsWith('/documents')

  return (
    <nav className="navBar">
      <button className="navBarLogo" onClick={() => navigate('/templates')}>
        <div className="navBarIcon-">
        <img src={documentIcon} width={30} height={30} />
        </div>
        <span className="navBartitle">SAD Tool</span>
      </button>
      <div className="navBarlinks">
        <button className={`navBarlink ${onTemplates ? 'active' : ''}`} onClick={() => navigate('/templates')}>
          Templates
        </button>
        <button className={`navBarlink ${onDocuments ? 'active' : ''}`} onClick={() => navigate('/documents')}>
          Documents
        </button>
      </div>
      <span className="navBarusername">{username}</span>
      <button className="navBarButton" onClick={handleLogout}>Sign Out</button>
    </nav>
  )
}
