import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import './LoginPage.css'
import documentIcon from '../assets/documentIcon.svg'


export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/templates')
    } catch (err: any) { {
          setError('Username or password is not correct')
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="Logo">
          <div className="icon">
            <img src={documentIcon} width={30} height={30} />
          </div>
          <span className="header">SAD Tool</span>
        </div>
        <p className="pageTitle">Sign In</p>
        <p className="subTitle">Software Architecture Documents</p>
        <form onSubmit={handleLoginSubmit}>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="errorText">{error}</p>}
          <button type="submit" className="btn primaryButton" disabled={loading}>
            {loading ? 'Signing you in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
