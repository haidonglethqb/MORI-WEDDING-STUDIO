import type { TrackStepDef } from './order-tracking-types'
import { TrackingStepIcon } from './tracking-step-icon'

interface OrderProgressTrackProps {
  title: string
  steps: TrackStepDef[]
  currentStepIndex: number
  isCancelled: boolean
}

export function OrderProgressTrack({
  title,
  steps,
  currentStepIndex,
  isCancelled,
}: OrderProgressTrackProps) {
  return (
    <div className="tracking-progress-block">
      <div className="tracking-progress-head">
        <h3>{title}</h3>
        <span className="tracking-progress-status">
          {isCancelled ? 'Đã hủy' : steps[currentStepIndex]?.label ?? steps[0]?.label}
        </span>
      </div>

      <ol className="tracking-stepper" aria-label={title}>
        {steps.map((step, index) => {
          const isDone = !isCancelled && index < currentStepIndex
          const isCurrent = !isCancelled && index === currentStepIndex
          const stateClass = isCancelled
            ? 'is-muted'
            : isDone
              ? 'is-done'
              : isCurrent
                ? 'is-current'
                : 'is-upcoming'

          return (
            <li key={step.key} className={`tracking-step-node ${stateClass}`}>
              <div className="tracking-node-icon">
                <TrackingStepIcon name={step.icon} />
              </div>
              <span className="tracking-node-index">Bước 0{index + 1}</span>
              <span className="tracking-node-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
