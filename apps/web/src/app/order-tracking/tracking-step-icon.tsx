import type { TrackingIconName } from './order-tracking-types'

const STEP_PATHS: Record<TrackingIconName, string> = {
  inbox: 'M4 4h16v12h-4l-2 3h-4l-2-3H4V4Zm0 8h16',
  check: 'm5 12 4.5 4.5L19 7',
  pen: 'm14 4 6 6-10 10H4v-6L14 4Z',
  eye: 'M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  stamp: 'M7 18h10M6 21h12M9 14v-2a3 3 0 1 1 6 0v2H5v4h14v-4H9Z',
  printer: 'M6 9V4h12v5M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6v-6Z',
  truck: 'M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6Zm-7.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  sparkles: 'm12 3 1.6 4.8L18.5 9.5l-4.9 1.7L12 16l-1.6-4.8-4.9-1.7 4.9-1.7L12 3Zm6.5 12 .7 2 2 .8-2 .7-.7 2-.8-2-2-.7 2-.8.8-2Z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9m0-18c-2.5 2.7-3.8 5.7-3.8 9s1.3 6.3 3.8 9M3.5 9h17m-17 6h17',
  link: 'M10 13a5 5 0 0 0 7.1.1l2.8-2.8a5 5 0 0 0-7.1-7.1L11.2 4.8M14 11a5 5 0 0 0-7.1-.1L4.1 13.7a5 5 0 0 0 7.1 7.1l1.5-1.5',
}

export function TrackingStepIcon({ name }: { name: TrackingIconName }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={STEP_PATHS[name]} />
    </svg>
  )
}
