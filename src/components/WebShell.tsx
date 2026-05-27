import { useState } from 'react'
import { LetterToSelfPanel } from './LetterToSelfPanel'
import { MeetingHistoryPanel } from './MeetingHistoryPanel'
import { PhraseLibraryPanel } from './PhraseLibraryPanel'

type WebShellProps = {
  className?: string
}

export function WebShell({ className }: WebShellProps) {
  const [page, setPage] = useState<'patterns' | 'history' | 'letters' | 'self-compassion-break'>('patterns')

  return (
    <section className={className ? `web-shell ${className}` : 'web-shell'}>
      <div className="web-topbar">
        <div className="web-brand">
          <span className="brand-mark" />
          <div className="web-app-title">LibOrate</div>
        </div>
        <nav className="web-nav-tabs" role="tablist" aria-label="Web pages">
          <button
            aria-selected={page === 'patterns'}
            className={page === 'patterns' ? 'web-nav-tab web-nav-tab-active' : 'web-nav-tab'}
            onClick={() => setPage('patterns')}
            role="tab"
            type="button"
          >
            Insights
          </button>
          <button
            aria-selected={page === 'history'}
            className={page === 'history' ? 'web-nav-tab web-nav-tab-active' : 'web-nav-tab'}
            onClick={() => setPage('history')}
            role="tab"
            type="button"
          >
            History
          </button>
          <button
            aria-selected={page === 'letters'}
            className={page === 'letters' ? 'web-nav-tab web-nav-tab-active' : 'web-nav-tab'}
            onClick={() => setPage('letters')}
            role="tab"
            type="button"
          >
            Letters
          </button>
          <button
            aria-selected={page === 'self-compassion-break'}
            className={page === 'self-compassion-break' ? 'web-nav-tab web-nav-tab-active' : 'web-nav-tab'}
            onClick={() => setPage('self-compassion-break')}
            role="tab"
            type="button"
          >
            Emotions
          </button>
        </nav>
      </div>

      <div style={{ display: page === 'patterns' ? 'block' : 'none' }}>
        <MeetingHistoryPanel activeSection="patterns" />
      </div>
      <div style={{ display: page === 'history' ? 'block' : 'none' }}>
        <MeetingHistoryPanel activeSection="history" />
      </div>
      <div style={{ display: page === 'letters' ? 'block' : 'none' }}>
        <LetterToSelfPanel />
      </div>
      <div style={{ display: page === 'self-compassion-break' ? 'block' : 'none' }}>
        <PhraseLibraryPanel />
      </div>
    </section>
  )
}
