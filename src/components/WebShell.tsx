import { useState } from 'react'
import { LetterToSelfPanel } from './LetterToSelfPanel'
import { MeetingHistoryPanel } from './MeetingHistoryPanel'
import { PhraseLibraryPanel } from './PhraseLibraryPanel'

type WebShellProps = {
  className?: string
}

export function WebShell({ className }: WebShellProps) {
  const [page, setPage] = useState<'patterns' | 'letters' | 'self-compassion-break'>('patterns')

  return (
    <section className={className ? `web-shell ${className}` : 'web-shell'}>
      <div className="web-topbar">
        <div className="web-brand">
          <span className="brand-mark" />
          <div className="web-app-title">LibOrate</div>
        </div>
        <div className="segmented-control" role="tablist" aria-label="Web pages">
          <button
            aria-selected={page === 'patterns'}
            className={page === 'patterns' ? 'segment-button segment-button-active' : 'segment-button'}
            onClick={() => setPage('patterns')}
            role="tab"
            type="button"
          >
            Patterns
          </button>
          <button
            aria-selected={page === 'letters'}
            className={page === 'letters' ? 'segment-button segment-button-active' : 'segment-button'}
            onClick={() => setPage('letters')}
            role="tab"
            type="button"
          >
            Letters
          </button>
          <button
            aria-selected={page === 'self-compassion-break'}
            className={page === 'self-compassion-break' ? 'segment-button segment-button-active' : 'segment-button'}
            onClick={() => setPage('self-compassion-break')}
            role="tab"
            type="button"
          >
            Self-Compassion Break
          </button>
        </div>
      </div>

      {page === 'patterns' ? <MeetingHistoryPanel /> : null}
      {page === 'letters' ? <LetterToSelfPanel /> : null}
      {page === 'self-compassion-break' ? <PhraseLibraryPanel /> : null}
    </section>
  )
}
