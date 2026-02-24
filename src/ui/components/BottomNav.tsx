export type TabId = 'home' | 'mail' | 'collection' | 'career' | 'market'

export type TabDefinition = {
  id: TabId
  label: string
  badge?: number | null // Number to show as badge, null for none
}

const DEFAULT_TABS: readonly TabDefinition[] = [
  { id: 'home', label: 'Home' },
  { id: 'mail', label: 'Mail' },
  { id: 'collection', label: 'Collection' },
  { id: 'career', label: 'Career' },
  { id: 'market', label: 'Market' },
] as const

export function BottomNav(props: {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  tabs?: readonly TabDefinition[]
}) {
  const tabs = props.tabs ?? DEFAULT_TABS

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav-inner">
        {tabs.map((t) => {
          const active = t.id === props.activeTab
          return (
            <button
              key={t.id}
              type="button"
              className="nav-button"
              data-active={active ? 'true' : 'false'}
              aria-current={active ? 'page' : undefined}
              aria-label={
                t.badge !== undefined && t.badge !== null && t.badge > 0
                  ? `${t.label} (${t.badge} unread mail)`
                  : t.label
              }
              onClick={() => props.onSelectTab(t.id)}
            >
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge !== null && t.badge > 0 && (
                <span className="nav-badge" aria-hidden="true">
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
