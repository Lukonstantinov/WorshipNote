interface Props {
  cents: number
  active: boolean
}

export function CentIndicator({ cents, active }: Props) {
  // Map cents (-50 to +50) to position (0% to 100%)
  const position = active ? Math.max(0, Math.min(100, (cents + 50) * 100 / 100)) : 50
  const isInTune = active && Math.abs(cents) < 5

  const indicatorColor = isInTune
    ? 'var(--color-success)'
    : Math.abs(cents) < 15
      ? 'var(--color-warning)'
      : 'var(--color-error)'

  return (
    <div className="px-6 py-4">
      {/* Labels */}
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>♭</span>
        <span className="text-xs font-medium" style={{ color: active ? indicatorColor : 'var(--color-text-muted)' }}>
          {active ? `${cents > 0 ? '+' : ''}${cents}¢` : '—'}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>♯</span>
      </div>

      {/* Track */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)' }}
      >
        {/* Center line */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-border)' }}
        />

        {/* Indicator dot */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full transition-all duration-100"
          style={{
            left: `${position}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: active ? indicatorColor : 'var(--color-text-muted)',
            boxShadow: active && isInTune ? `0 0 12px ${indicatorColor}` : 'none',
          }}
        />
      </div>
    </div>
  )
}
