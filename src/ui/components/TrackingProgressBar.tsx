export function TrackingProgressBar(props: { percent: number }) {
  const percent = Math.max(0, Math.min(100, props.percent))

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: 8,
          borderRadius: 999,
          background: 'rgba(16, 42, 67, 0.15)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            transition: 'width 300ms ease-out',
            background: 'linear-gradient(90deg, #2a6db0, #35a46a)',
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{percent}% complete</div>
    </div>
  )
}
