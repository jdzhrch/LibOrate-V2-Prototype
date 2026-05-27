import { useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { WebShell } from './components/WebShell'
import { ZoomCheckInPanel } from './components/ZoomCheckInPanel'
import { ZoomChrome } from './components/ZoomChrome'
import { usePrototypeStore } from './state/prototypeStore'

function ZoomRouteView() {
  return (
    <div className="single-surface">
      <ZoomChrome>
        <ZoomCheckInPanel />
      </ZoomChrome>
    </div>
  )
}

function WebRouteView() {
  return (
    <div className="single-surface single-surface-wide">
      <WebShell className="web-shell-standalone" />
    </div>
  )
}

function App() {
  const { meetings, selectedMeetingId, setSelectedMeetingId } = usePrototypeStore()
  const location = useLocation()
  const isZoomRoute = location.pathname === '/zoom' || location.pathname === '/'
  const [showGuide, setShowGuide] = useState(() => {
    return localStorage.getItem('liborate-welcome-guide-dismissed') !== 'true'
  })

  const dismissGuide = () => {
    localStorage.setItem('liborate-welcome-guide-dismissed', 'true')
    setShowGuide(false)
  }

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all prototype data to default seed data?')) {
      window.localStorage.removeItem('liborate-welcome-guide-dismissed')
      window.localStorage.removeItem('liborate-prototype-state-v4')
      window.location.reload()
    }
  }

  return (
    <div className="page-shell">
      <header className="route-header">
        <div className="route-header-main">
          <div>
            <p className="section-label">Views</p>
            <h1 className="page-title">LibOrate prototype</h1>
          </div>
          <nav className="route-nav" aria-label="Prototype routes">
            <NavLink
              className={({ isActive }) => (isActive ? 'route-link route-link-active' : 'route-link')}
              to="/zoom"
            >
              Zoom
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'route-link route-link-active' : 'route-link')}
              to="/web"
            >
              Web
            </NavLink>
          </nav>
        </div>
        <div className="prototype-toolbar">
          <button
            className="secondary-pill secondary-pill-quiet reset-data-btn"
            onClick={handleResetData}
            type="button"
          >
            Reset Demo Data
          </button>
          {isZoomRoute ? (
            <div className="page-toolbar">
              <label className="toolbar-label" htmlFor="preview-meeting">
                Preview meeting
              </label>
              <select
                className="toolbar-select"
                id="preview-meeting"
                onChange={(event) => setSelectedMeetingId(event.target.value)}
                value={selectedMeetingId}
              >
                {meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </header>

      {showGuide ? (
        <div className="welcome-guide-card">
          <div className="welcome-guide-header">
            <div className="welcome-guide-title">
              <span className="welcome-guide-icon">✨</span>
              <h3>Welcome to LibOrate</h3>
            </div>
            <button
              type="button"
              className="close-guide-btn"
              aria-label="Dismiss guide"
              onClick={dismissGuide}
            >
              ×
            </button>
          </div>
          <div className="welcome-guide-body">
            <p className="welcome-guide-intro">
              LibOrate helps you practice self-compassion and balance emotional pressure during challenging meetings.
            </p>
            <div className="welcome-guide-steps">
              <div className="guide-step">
                <strong>1. Check in during meetings</strong>
                <p>Use the Zoom Check-in app to log your emotional state. It helps you pause, recognize common humanity, and find self-kindness.</p>
              </div>
              <div className="guide-step">
                <strong>2. Review your Patterns & History</strong>
                <p>Explore high-level emotional maps in **Patterns** and read the chronological timeline of support moments in **History**.</p>
              </div>
              <div className="guide-step">
                <strong>3. Customize your support</strong>
                <p>Rewrite reflection prompts in **Letters**, or edit the self-compassion phrases for any emotion card in **Emotions**.</p>
              </div>
            </div>
            <div className="welcome-guide-footer">
              <span className="privacy-badge">🔒 Private Space: All check-ins and letters are 100% private to you and never shared with others in meetings.</span>
            </div>
          </div>
        </div>
      ) : null}

      <Routes>
        <Route element={<ZoomRouteView />} path="/zoom" />
        <Route element={<WebRouteView />} path="/web" />
        <Route element={<Navigate replace to="/zoom" />} path="/" />
      </Routes>
    </div>
  )
}

export default App
