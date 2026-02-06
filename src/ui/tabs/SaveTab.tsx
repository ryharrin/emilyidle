import React from "react";

import { createInitialState, getMilestones } from "../../game/state";
import type { GameState, WatchItemDefinition } from "../../game/state";
import { ConfirmModal } from "../components/ConfirmModal";

type ThemeMode = "system" | "light" | "dark";

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type TabId =
  | "collection"
  | "career"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "catalog"
  | "stats"
  | "save";

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
  notificationPreferences: {
    sessionsReady: boolean;
    prestigeReady: boolean;
    achievements: boolean;
    events: boolean;
  };
};

type DevSettings = {
  enabled: boolean;
  speedMultiplier: number;
};

type TabOption = {
  id: TabId;
  label: string;
};

type SaveTabProps = {
  isActive: boolean;
  state: GameState;
  watchItems: ReadonlyArray<WatchItemDefinition>;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (nextSettings: AudioSettings) => void;
  settings: Settings;
  persistSettings: (nextSettings: Settings) => void;
  visibleTabOptions: TabOption[];
  hiddenTabsSet: Set<TabId>;
  devSettings: DevSettings;
  setDevSettings: React.Dispatch<React.SetStateAction<DevSettings>>;
  onPurchase: (nextState: GameState) => void;
  importText: string;
  onImportTextChange: (next: string) => void;
  onExport: () => void;
  onImport: () => void;
  onImportFile: (file: File | null) => void;
  saveStatus: string;
  onClearSave: () => void;
};

export function SaveTab({
  isActive,
  state,
  watchItems,
  audioSettings,
  onUpdateAudioSettings,
  settings,
  persistSettings,
  visibleTabOptions,
  hiddenTabsSet,
  devSettings,
  setDevSettings,
  onPurchase,
  importText,
  onImportTextChange,
  onExport,
  onImport,
  onImportFile,
  saveStatus,
  onClearSave,
}: SaveTabProps) {
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);

  return (
    <section
      className="panel"
      id="save"
      role="tabpanel"
      aria-labelledby="save-tab"
      hidden={!isActive}
    >
      {isActive && (
        <>
          <header className="panel-header">
            <div>
              <p className="eyebrow">Preferences</p>
              <h2>Settings</h2>
              <p className="muted">
                Back up your progress, import a save string, and adjust settings.
              </p>
            </div>
          </header>
          <div className="settings-shell">
            <fieldset className="settings-section settings-section--save">
              <legend>Save data</legend>
              <div className="control-row">
                <button type="button" className="secondary" onClick={onExport}>
                  Export
                </button>
                <button
                  type="button"
                  className="danger"
                  data-testid="settings-clear-save"
                  onClick={() => setConfirmClearOpen(true)}
                >
                  Clear save
                </button>
              </div>
            </fieldset>

            <ConfirmModal
              open={confirmClearOpen}
              title="Clear local save?"
              description="This clears the local save on this device and reloads the page. Export first if you want a backup."
              confirmLabel="Clear save"
              confirmClassName="danger"
              confirmTestId="settings-clear-save-confirm"
              cancelTestId="settings-clear-save-cancel"
              onCancel={() => setConfirmClearOpen(false)}
              onConfirm={() => {
                setConfirmClearOpen(false);
                onClearSave();
              }}
            />

            <fieldset className="settings-section" data-testid="audio-controls">
              <legend>Audio settings</legend>
              <div className="controls">
                <label>
                  <input
                    type="checkbox"
                    data-testid="audio-sfx-toggle"
                    checked={audioSettings.sfxEnabled}
                    onChange={(event) =>
                      onUpdateAudioSettings({
                        ...audioSettings,
                        sfxEnabled: event.target.checked,
                      })
                    }
                  />
                  Enable SFX
                </label>
                <label>
                  <input
                    type="checkbox"
                    data-testid="audio-bgm-toggle"
                    checked={audioSettings.bgmEnabled}
                    onChange={(event) =>
                      onUpdateAudioSettings({
                        ...audioSettings,
                        bgmEnabled: event.target.checked,
                      })
                    }
                  />
                  Enable BGM
                </label>
              </div>
            </fieldset>

            <fieldset className="settings-section" data-testid="settings-controls">
              <legend>Preferences</legend>
              <div className="controls">
                <label>
                  Theme mode
                  <select
                    data-testid="settings-theme"
                    value={settings.themeMode}
                    onChange={(event) =>
                      persistSettings({
                        ...settings,
                        themeMode: event.target.value as ThemeMode,
                      })
                    }
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    data-testid="settings-hide-achievements"
                    checked={settings.hideCompletedAchievements}
                    onChange={(event) =>
                      persistSettings({
                        ...settings,
                        hideCompletedAchievements: event.target.checked,
                      })
                    }
                  />
                  Hide completed achievements
                </label>
              </div>

              <div className="settings-visibility">
                <span className="muted settings-visibility-label">Notifications</span>
                <div className="controls settings-visibility-grid">
                  <label>
                    <input
                      type="checkbox"
                      data-testid="settings-notify-sessions"
                      checked={settings.notificationPreferences.sessionsReady}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            sessionsReady: event.target.checked,
                          },
                        })
                      }
                    />
                    Sessions ready
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      data-testid="settings-notify-prestige"
                      checked={settings.notificationPreferences.prestigeReady}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            prestigeReady: event.target.checked,
                          },
                        })
                      }
                    />
                    Prestige ready
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      data-testid="settings-notify-achievements"
                      checked={settings.notificationPreferences.achievements}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            achievements: event.target.checked,
                          },
                        })
                      }
                    />
                    Achievement toasts
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      data-testid="settings-notify-events"
                      checked={settings.notificationPreferences.events}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            events: event.target.checked,
                          },
                        })
                      }
                    />
                    Event updates
                  </label>
                </div>
              </div>

              <div className="settings-visibility">
                <span className="muted settings-visibility-label">Visible tabs</span>
                <div className="controls settings-visibility-grid">
                  {visibleTabOptions.map((tab) => (
                    <label key={tab.id}>
                      <input
                        type="checkbox"
                        data-testid={`tab-visibility-${tab.id}`}
                        checked={!hiddenTabsSet.has(tab.id)}
                        onChange={(event) => {
                          const nextHiddenTabs = event.target.checked
                            ? settings.hiddenTabs.filter((hiddenTab) => hiddenTab !== tab.id)
                            : Array.from(new Set([...settings.hiddenTabs, tab.id]));
                          persistSettings({
                            ...settings,
                            hiddenTabs: nextHiddenTabs,
                          });
                        }}
                      />
                      {tab.label}
                    </label>
                  ))}
                </div>
              </div>

              {devSettings.enabled && (
                <div className="controls settings-dev-controls" data-testid="dev-controls">
                  <span className="muted">Dev mode</span>
                  <label>
                    Speed
                    <select
                      value={String(devSettings.speedMultiplier)}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDevSettings((current) => ({
                          ...current,
                          speedMultiplier: Number.isFinite(value) ? value : 1,
                        }));
                      }}
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="4">4x</option>
                    </select>
                  </label>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        onPurchase({
                          ...state,
                          currencyCents: state.currencyCents + 500_000,
                        })
                      }
                    >
                      Grant $500k
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        const boostedItems = watchItems.reduce<Record<string, number>>(
                          (acc, item) => {
                            acc[item.id] = Math.max(state.items[item.id] ?? 0, 10);
                            return acc;
                          },
                          {},
                        );
                        onPurchase({
                          ...state,
                          items: {
                            ...state.items,
                            ...boostedItems,
                          },
                          unlockedMilestones: getMilestones().map((milestone) => milestone.id),
                        });
                      }}
                    >
                      Unlock watches
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        onPurchase(createInitialState());
                      }}
                    >
                      Reset save
                    </button>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset className="settings-section settings-section--import">
              <legend>Import data</legend>
              <label htmlFor="import-save-text">Import data</label>
              <textarea
                id="import-save-text"
                rows={3}
                placeholder="Paste exported data here"
                aria-describedby="save-status"
                value={importText}
                onChange={(event) => onImportTextChange(event.target.value)}
              ></textarea>
              <div className="control-row control-row--end">
                <button type="button" onClick={onImport}>
                  Import
                </button>
              </div>
              <div className="file-import">
                <label htmlFor="import-save-file">Import from file</label>
                <input
                  id="import-save-file"
                  type="file"
                  accept=".json,application/json"
                  data-testid="import-save-file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    onImportFile(file);
                    event.target.value = "";
                  }}
                />
                <p className="muted">Use a JSON export from this game.</p>
              </div>
            </fieldset>
          </div>

          <output id="save-status" aria-live="polite">
            {saveStatus}
          </output>
        </>
      )}
    </section>
  );
}
