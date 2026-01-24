import React from "react";

import { createInitialState, getMilestones } from "../../game/state";
import type { GameState, WatchItemDefinition } from "../../game/state";

type ThemeMode = "system" | "light" | "dark";

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type TabId =
  | "collection"
  | "career"
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
  saveStatus: string;
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
  saveStatus,
}: SaveTabProps) {
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
          <h2>Save</h2>
          <div className="controls">
            <button type="button" onClick={onExport}>
              Export
            </button>
          </div>

          <fieldset className="controls" data-testid="audio-controls">
            <legend>Audio settings</legend>
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
          </fieldset>

          <fieldset className="controls" data-testid="settings-controls">
            <legend>Preferences</legend>
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
            <div className="controls">
              <span className="muted">Visible tabs</span>
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
            {devSettings.enabled && (
              <div className="controls" data-testid="dev-controls">
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

          <div className="controls">
            <label htmlFor="import-save-text">Import data</label>
            <textarea
              id="import-save-text"
              rows={3}
              placeholder="Paste exported data here"
              aria-describedby="save-status"
              value={importText}
              onChange={(event) => onImportTextChange(event.target.value)}
            ></textarea>
            <button type="button" onClick={onImport}>
              Import
            </button>
          </div>

          <output id="save-status" aria-live="polite">
            {saveStatus}
          </output>
        </>
      )}
    </section>
  );
}
