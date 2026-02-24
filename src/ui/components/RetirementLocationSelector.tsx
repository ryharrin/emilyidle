import type { PlayerLocation, USRegion } from '../../game/types'

const RETIREMENT_CHOICES: Array<{ region: USRegion; label: string }> = [
  { region: 'west', label: 'West Coast' },
  { region: 'midwest', label: 'Midwest' },
  { region: 'northeast', label: 'Northeast' },
  { region: 'southeast', label: 'Southeast' },
  { region: 'southwest', label: 'Southwest' },
  { region: 'northwest', label: 'Northwest' },
  { region: 'mountain', label: 'Mountain' },
]

export function RetirementLocationSelector(props: {
  onConfirm: (location: PlayerLocation) => void
}) {
  return (
    <div>
      <p style={{ marginTop: 0 }}>Choose Emily's retirement location for future package routes.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {RETIREMENT_CHOICES.map((choice) => (
          <button
            key={choice.region}
            type="button"
            className="pill"
            onClick={() =>
              props.onConfirm({
                type: 'custom',
                customRegion: choice.region,
                displayName: `Retirement Home (${choice.label})`,
              })
            }
            style={{ justifyContent: 'flex-start' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  )
}
