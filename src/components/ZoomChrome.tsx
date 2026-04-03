import type { ReactNode } from 'react'

type ZoomChromeProps = {
  children: ReactNode
}

export function ZoomChrome({ children }: ZoomChromeProps) {
  return (
    <section className="zoom-chrome">
      <div className="zoom-window-bar">
        <div className="zoom-window-title">Apps</div>
        <div className="window-actions" aria-hidden="true">
          <span className="window-icon window-icon-angles" />
          <span className="window-icon window-icon-expand" />
          <span className="window-icon window-icon-close" />
        </div>
      </div>
      <div className="zoom-app-bar">
        <div className="zoom-app-back" aria-hidden="true">
          <span className="window-icon window-icon-back" />
        </div>
        <div className="app-brand">
          <span className="brand-mark" />
          <span>LibOrate</span>
          <span className="zoom-app-caret" aria-hidden="true" />
        </div>
        <div className="zoom-app-spacer" />
        <div className="zoom-app-menu" aria-hidden="true">
          <span className="window-icon window-icon-kebab" />
        </div>
      </div>
      <div className="zoom-scroll-area">{children}</div>
    </section>
  )
}
