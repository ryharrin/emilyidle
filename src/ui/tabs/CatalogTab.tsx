import React from "react";

import { EmptyStateCTA } from "../components/EmptyStateCTA";

import { getCatalogEntryTags, getCatalogImageUrl } from "../../game/catalog";
import type { CatalogEntry } from "../../game/catalog";

type TabId =
  | "collection"
  | "career"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "catalog"
  | "stats"
  | "save";

type CatalogTabProps = {
  isActive: boolean;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  catalogSearch: string;
  onCatalogSearchChange: (next: string) => void;
  catalogBrand: string;
  onCatalogBrandChange: (next: string) => void;
  catalogStyle: "all" | "womens";
  onCatalogStyleChange: (next: "all" | "womens") => void;
  catalogSort: "default" | "brand" | "year" | "tier";
  onCatalogSortChange: (next: "default" | "brand" | "year" | "tier") => void;
  catalogEra: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  onCatalogEraChange: (next: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown") => void;
  catalogType: "all" | "gmt" | "chronograph" | "dress" | "diver";
  onCatalogTypeChange: (next: "all" | "gmt" | "chronograph" | "dress" | "diver") => void;
  catalogTab: "unowned" | "owned";
  onCatalogTabChange: (next: "unowned" | "owned") => void;
  catalogBrands: ReadonlyArray<string>;
  filteredCatalogEntries: ReadonlyArray<CatalogEntry>;
  discoveredCatalogEntries: ReadonlyArray<CatalogEntry>;
  discoveredCatalogIds: ReadonlyArray<string>;
  catalogEntries: ReadonlyArray<CatalogEntry>;
  hasOwnedCatalogTiers: boolean;
};

export function CatalogTab({
  isActive,
  onNavigate,
  catalogSearch,
  onCatalogSearchChange,
  catalogBrand,
  onCatalogBrandChange,
  catalogStyle,
  onCatalogStyleChange,
  catalogSort,
  onCatalogSortChange,
  catalogEra,
  onCatalogEraChange,
  catalogType,
  onCatalogTypeChange,
  catalogTab,
  onCatalogTabChange,
  catalogBrands,
  filteredCatalogEntries,
  discoveredCatalogEntries,
  discoveredCatalogIds,
  catalogEntries,
  hasOwnedCatalogTiers,
}: CatalogTabProps) {
  return (
    <section
      className="panel catalog-panel"
      id="catalog"
      role="tabpanel"
      aria-labelledby="catalog-tab"
      hidden={!isActive}
    >
      {isActive && (
        <>
          <header className="panel-header catalog-header">
            <div>
              <p className="eyebrow">Archive</p>
              <h2>Catalog</h2>
              <p className="muted">Explore reference pieces and track licensing sources.</p>
            </div>
            <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
              {filteredCatalogEntries.length} results · {discoveredCatalogEntries.length} discovered
            </div>
          </header>
          <form
            className="catalog-filters"
            data-testid="catalog-filters"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-search">
                Search
              </label>
              <input
                id="catalog-search"
                data-testid="catalog-search"
                type="search"
                placeholder="Search by model, year, tags"
                value={catalogSearch}
                onChange={(event) => onCatalogSearchChange(event.target.value)}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-brand">
                Brand
              </label>
              <select
                id="catalog-brand"
                data-testid="catalog-brand"
                value={catalogBrand}
                onChange={(event) => onCatalogBrandChange(event.target.value)}
              >
                {catalogBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-style">
                Style
              </label>
              <select
                id="catalog-style"
                data-testid="catalog-style"
                value={catalogStyle}
                onChange={(event) =>
                  onCatalogStyleChange(event.target.value as typeof catalogStyle)
                }
              >
                <option value="all">All</option>
                <option value="womens">Womens</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-sort">
                Sort
              </label>
              <select
                id="catalog-sort"
                data-testid="catalog-sort"
                value={catalogSort}
                onChange={(event) => onCatalogSortChange(event.target.value as typeof catalogSort)}
              >
                <option value="default">Default</option>
                <option value="brand">Brand (A→Z)</option>
                <option value="year">Year (newest→oldest)</option>
                <option value="tier">Tier (starter→tourbillon)</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-era">
                Era
              </label>
              <select
                id="catalog-era"
                data-testid="catalog-era"
                value={catalogEra}
                onChange={(event) => onCatalogEraChange(event.target.value as typeof catalogEra)}
              >
                <option value="all">All</option>
                <option value="pre-1970">Pre-1970</option>
                <option value="1970-1999">1970-1999</option>
                <option value="2000+">2000+</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-type">
                Type
              </label>
              <select
                id="catalog-type"
                data-testid="catalog-type"
                value={catalogType}
                onChange={(event) => onCatalogTypeChange(event.target.value as typeof catalogType)}
              >
                <option value="all">All</option>
                <option value="gmt">GMT</option>
                <option value="chronograph">Chronograph</option>
                <option value="dress">Dress</option>
                <option value="diver">Diver</option>
              </select>
            </div>
            <div className="filter-field" data-testid="catalog-owned-tabs">
              <span className="filter-label">View</span>
              <div className="catalog-tablist" role="tablist" aria-label="Catalog ownership">
                {(
                  [
                    { id: "unowned", label: "Unowned" },
                    { id: "owned", label: "Owned" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                    aria-selected={catalogTab === tab.id}
                    aria-controls={`catalog-${tab.id}`}
                    id={`catalog-${tab.id}-tab`}
                    tabIndex={catalogTab === tab.id ? 0 : -1}
                    onClick={() => onCatalogTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
          <section className="catalog-collection" aria-labelledby="catalog-collection-title">
            <header className="panel-header">
              <div>
                <p className="eyebrow">Collection book</p>
                <h3 id="catalog-collection-title">Archive shelf</h3>
                <p className="muted">Discovered references appear here for quick review.</p>
              </div>
              <div className="results-count" data-testid="catalog-discovered-count">
                {discoveredCatalogEntries.length} / {catalogEntries.length} discovered
              </div>
            </header>
            {discoveredCatalogEntries.length > 0 ? (
              <div className="catalog-grid" data-testid="catalog-discovered-grid">
                {discoveredCatalogEntries.map((entry) => {
                  const tags = getCatalogEntryTags(entry);
                  return (
                    <article
                      key={entry.id}
                      className="catalog-card catalog-discovered"
                      data-testid="catalog-card"
                    >
                      <div className="catalog-media">
                        <img
                          src={getCatalogImageUrl(entry)}
                          alt={`${entry.brand} ${entry.model}`}
                          loading="lazy"
                          onError={(event) => {
                            const target = event.currentTarget;
                            const placeholder =
                              "data:image/svg+xml;utf8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                  `<rect width='100%' height='100%' fill='#131720'/>` +
                                  `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                  `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                  `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                  `</svg>`,
                              );

                            if (target.dataset.fallback !== "true") {
                              target.dataset.fallback = "true";
                              target.src = placeholder;
                            }
                          }}
                        />
                      </div>
                      <div className="catalog-content">
                        <div className="catalog-title">
                          <div>
                            <p className="catalog-brand">{entry.brand}</p>
                            <h3>{entry.model}</h3>
                          </div>
                          <p className="catalog-year">{entry.year}</p>
                        </div>
                        <p>{entry.description}</p>
                        <p className="catalog-tags">{tags.join(" · ")}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="catalog-empty" data-testid="catalog-discovered-empty">
                <EmptyStateCTA
                  title="No references discovered yet"
                  body="Buy and interact with watches in the Vault to discover catalog references and unlock tier bonuses."
                  ctaLabel="Go to Vault"
                  onCta={() => onNavigate("collection", "collection-list")}
                />
              </div>
            )}
          </section>
          <section
            id="catalog-unowned"
            role="tabpanel"
            aria-labelledby="catalog-unowned-tab"
            hidden={catalogTab !== "unowned"}
          >
            {catalogTab === "unowned" && (
              <div className="catalog-grid" data-testid="catalog-grid">
                {filteredCatalogEntries.map((entry) => {
                  const discovered = discoveredCatalogIds.includes(entry.id);
                  const tags = getCatalogEntryTags(entry);
                  return (
                    <article
                      key={entry.id}
                      className={`catalog-card ${
                        discovered ? "catalog-discovered" : "catalog-locked"
                      }`}
                      data-testid="catalog-card"
                    >
                      <div className="catalog-media">
                        <img
                          src={getCatalogImageUrl(entry)}
                          alt={`${entry.brand} ${entry.model}`}
                          loading="lazy"
                          onError={(event) => {
                            const target = event.currentTarget;
                            const placeholder =
                              "data:image/svg+xml;utf8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                  `<rect width='100%' height='100%' fill='#131720'/>` +
                                  `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                  `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                  `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                  `</svg>`,
                              );

                            if (target.dataset.fallback !== "true") {
                              target.dataset.fallback = "true";
                              target.src = placeholder;
                            }
                          }}
                        />
                        {!discovered && <span className="catalog-badge">Undiscovered</span>}
                      </div>
                      <div className="catalog-content">
                        <div className="catalog-title">
                          <div>
                            <p className="catalog-brand">{entry.brand}</p>
                            <h3>{entry.model}</h3>
                          </div>
                          <p className="catalog-year">{entry.year}</p>
                        </div>
                        <p>{entry.description}</p>
                        <p className="catalog-tags">{tags.join(" · ")}</p>
                        <p className="catalog-attribution">{entry.image.attribution}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
          <section
            id="catalog-owned"
            role="tabpanel"
            aria-labelledby="catalog-owned-tab"
            hidden={catalogTab !== "owned"}
          >
            {catalogTab === "owned" && (
              <>
                {!hasOwnedCatalogTiers ? (
                  <div className="catalog-empty" data-testid="catalog-owned-empty">
                    <EmptyStateCTA
                      title="No owned references yet"
                      body="Build your vault collection to start filling your archive shelf with owned references."
                      ctaLabel="Build collection"
                      onCta={() => onNavigate("collection", "collection-list")}
                    />
                  </div>
                ) : (
                  <div className="catalog-grid" data-testid="catalog-grid">
                    {filteredCatalogEntries.map((entry) => {
                      const discovered = discoveredCatalogIds.includes(entry.id);
                      const tags = getCatalogEntryTags(entry);
                      return (
                        <article
                          key={entry.id}
                          className={`catalog-card ${
                            discovered ? "catalog-discovered" : "catalog-locked"
                          }`}
                          data-testid="catalog-card"
                        >
                          <div className="catalog-media">
                            <img
                              src={getCatalogImageUrl(entry)}
                              alt={`${entry.brand} ${entry.model}`}
                              loading="lazy"
                              onError={(event) => {
                                const target = event.currentTarget;
                                const placeholder =
                                  "data:image/svg+xml;utf8," +
                                  encodeURIComponent(
                                    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                      `<rect width='100%' height='100%' fill='#131720'/>` +
                                      `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                      `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                      `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                      `</svg>`,
                                  );

                                if (target.dataset.fallback !== "true") {
                                  target.dataset.fallback = "true";
                                  target.src = placeholder;
                                }
                              }}
                            />
                            {!discovered && <span className="catalog-badge">Undiscovered</span>}
                          </div>
                          <div className="catalog-content">
                            <div className="catalog-title">
                              <div>
                                <p className="catalog-brand">{entry.brand}</p>
                                <h3>{entry.model}</h3>
                              </div>
                              <p className="catalog-year">{entry.year}</p>
                            </div>
                            <p>{entry.description}</p>
                            {entry.facts && entry.facts.length > 0 && (
                              <details className="catalog-facts" data-testid="catalog-facts">
                                <summary>Collector notes</summary>
                                <ul>
                                  {entry.facts.map((fact) => (
                                    <li key={fact}>{fact}</li>
                                  ))}
                                </ul>
                              </details>
                            )}
                            <p className="catalog-tags">{tags.join(" · ")}</p>
                            <p className="catalog-attribution">{entry.image.attribution}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="panel catalog-sources" data-testid="catalog-sources">
            <h2>Sources &amp; Licenses</h2>
            <p className="muted">
              Every image in the archive lists its original source and license for compliance.
            </p>

            <ul className="sources-list" data-testid="sources-list">
              {catalogEntries.map((entry) => (
                <li key={entry.id} data-testid="source-item">
                  <strong className="source-title">
                    {entry.brand} {entry.model}
                  </strong>
                  <span className="muted">{entry.image.attribution}</span>
                  <div className="source-links" data-testid="source-links">
                    <a href={entry.image.sourceUrl} target="_blank" rel="noreferrer">
                      Source
                    </a>
                    {entry.image.licenseUrl ? (
                      <a href={entry.image.licenseUrl} target="_blank" rel="noreferrer">
                        {entry.image.licenseName}
                      </a>
                    ) : (
                      <span>{entry.image.licenseName}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="panel catalog-dealers" data-testid="catalog-dealers">
              <h3>Trusted dealers (external)</h3>
              <p className="muted">
                Dealer names are provided for reference only; no affiliation or endorsement is
                implied.
              </p>
              <ul className="card-stack" data-testid="dealer-list">
                {["Hodinkee", "Crown & Caliber", "WatchBox", "Bob's Watches", "Tourneau"].map(
                  (dealer) => (
                    <li key={dealer}>{dealer}</li>
                  ),
                )}
              </ul>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
