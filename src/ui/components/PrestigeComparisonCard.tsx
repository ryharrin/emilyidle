import React from "react";

import { formatMoneyFromCents } from "../../game/format";

type PrestigeLayerInfo = {
  visible: boolean;
  ratio: number;
  gain: number;
  thresholdCents: number;
  resetsWhat: string[];
  carriesWhat: string[];
};

type PrestigeComparisonCardProps = {
  atelier: PrestigeLayerInfo;
  maison: PrestigeLayerInfo;
  nostalgia: PrestigeLayerInfo;
};

export function PrestigeComparisonCard({
  atelier,
  maison,
  nostalgia,
}: PrestigeComparisonCardProps) {
  const layers = [
    { id: "atelier", label: "Atelier", ...atelier },
    { id: "maison", label: "Maison", ...maison },
    { id: "nostalgia", label: "Nostalgia", ...nostalgia },
  ].filter((l) => l.visible);

  if (layers.length === 0) return null;

  return (
    <section className="prestige-comparison" data-testid="prestige-comparison">
      <header className="prestige-comparison__header">
        <p className="eyebrow">Reset loops</p>
        <h3>Prestige Overview</h3>
        <p className="muted">Compare what resets, what carries, and current gains.</p>
      </header>

      <div className="prestige-comparison__grid">
        {layers.map((layer) => (
          <article
            key={layer.id}
            className={`prestige-comparison__layer ${layer.ratio >= 1 ? "prestige-comparison__layer--ready" : ""}`}
            data-testid={`prestige-layer-${layer.id}`}
          >
            <header className="prestige-comparison__layer-header">
              <h4>{layer.label}</h4>
              <span className="prestige-comparison__gain">+{layer.gain}</span>
            </header>

            <div className="prestige-comparison__progress">
              <div className="prestige-comparison__progress-bar">
                <div
                  className="prestige-comparison__progress-fill"
                  style={{ width: `${Math.min(100, layer.ratio * 100)}%` }}
                />
              </div>
              <span className="prestige-comparison__progress-text">
                {Math.round(layer.ratio * 100)}% · {formatMoneyFromCents(layer.thresholdCents)}
              </span>
            </div>

            <div className="prestige-comparison__details">
              <div className="prestige-comparison__resets">
                <p className="eyebrow">Resets</p>
                <ul>
                  {layer.resetsWhat.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="prestige-comparison__carries">
                <p className="eyebrow">Carries</p>
                <ul>
                  {layer.carriesWhat.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
