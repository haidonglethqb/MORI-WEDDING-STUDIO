import type { SVGProps } from 'react'

export type MoriIconName =
  | 'arrow-right'
  | 'calendar'
  | 'check'
  | 'close'
  | 'envelope'
  | 'heart'
  | 'leaf'
  | 'lock'
  | 'map-pin'
  | 'paper'
  | 'palette'
  | 'play'
  | 'search'
  | 'spark'

interface MoriIconProps extends SVGProps<SVGSVGElement> {
  name: MoriIconName
}

const paths: Record<MoriIconName, string> = {
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13H3V6a2 2 0 0 1 2-2Z',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M18 6 6 18',
  envelope: 'M3 5h18v14H3zM3 6l9 7 9-7',
  heart: 'M20.8 8.6c0 5.1-8.8 10-8.8 10S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6Z',
  leaf: 'M20 4c-8 0-14 3-14 9a5 5 0 0 0 5 5c6 0 9-6 9-14ZM4 21c2-5 6-9 12-12',
  lock: 'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3m-4 4v3',
  'map-pin': 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  paper: 'M6 3h9l4 4v14H6zM15 3v5h5M9 12h7M9 16h7',
  palette: 'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.8 1.8 0 0 1 1.3-3.1H18a3 3 0 0 0 3-3c0-4.7-4-8.5-9-8.5ZM7.5 11h.1m3-4h.1m5 1h.1m-7 8h.1',
  play: 'm8 5 11 7-11 7z',
  search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  spark: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
}

export function MoriIcon({ name, ...props }: MoriIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
