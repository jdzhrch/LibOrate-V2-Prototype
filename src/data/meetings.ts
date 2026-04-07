import type { MeetingInfo } from '../types'

export const meetings: MeetingInfo[] = [
  {
    id: 'design-review',
    title: 'Tuesday Design Review',
    startTime: 'Today · 3:30 PM',
    contextNote: 'A product review with five teammates. The first update is yours.',
  },
  {
    id: 'client-kickoff',
    title: 'Client Kickoff',
    startTime: 'Friday · 9:00 AM',
    contextNote: 'A higher-stakes intro meeting with new people on the call.',
  },
  {
    id: 'practice-circle',
    title: 'Practice Circle',
    startTime: 'Tomorrow · 11:00 AM',
    contextNote: 'A lower-pressure space where you can slow down without needing to perform.',
  },
]
