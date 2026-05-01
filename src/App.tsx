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
      </header>

      <Routes>
        <Route element={<ZoomRouteView />} path="/zoom" />
        <Route element={<WebRouteView />} path="/web" />
        <Route element={<Navigate replace to="/zoom" />} path="/" />
      </Routes>
    </div>
  )
}

export default App
