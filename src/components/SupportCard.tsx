import type { CheckInRecord } from '../types'

type SupportCardProps = {
  record: CheckInRecord
}

export function SupportCard({ record }: SupportCardProps) {
  return (
    <article className="support-card">
      <h3>{record.supportTitle}</h3>

      <div className="support-block">
        <p className="support-block-title">Common humanity</p>
        <p>{record.commonHumanity}</p>
      </div>

      <div className="support-block">
        <p className="support-block-title">Kindness phrase</p>
        <p className="support-highlight">{record.kindnessPhrase}</p>
      </div>
    </article>
  )
}
