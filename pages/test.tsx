import React from "react";
import Link from "next/link";

const TestPage: React.FC = () => {
  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 1</div>
      <div className="test-hero">
        <div className="test-hero-copy">
          <h1 className="page-title">Big-Five-Test</h1>
          <p className="page-intro">
            Dieser Test misst die fuenf breiten Persoenlichkeitsdimensionen und ihre
            Facetten. Du beantwortest 120 Aussagen und erhaeltst danach ein deutlich
            differenzierteres Profil als bei sehr kurzen Schnelltests.
          </p>

          <div className="test-meta-row">
            <div className="test-meta-card">
              <span className="test-meta-label">Dauer</span>
              <strong>ca. 15 bis 20 Minuten</strong>
            </div>
            <div className="test-meta-card">
              <span className="test-meta-label">Umfang</span>
              <strong>120 Items, 30 Facetten</strong>
            </div>
            <div className="test-meta-card">
              <span className="test-meta-label">Ergebnis</span>
              <strong>Profil + Detailauswertung</strong>
            </div>
          </div>

          <div className="test-action-row">
            <Link href="/test/full" className="btn btn-primary">
              Test starten
            </Link>
            <Link href="/hintergrund" className="btn btn-outline">
              Hintergrund lesen
            </Link>
          </div>
        </div>

        <aside className="test-side-card">
          <div className="pill">
            <span className="pill-dot" />
            Verwendetes Inventar
          </div>
          <h2 className="section-title" style={{ marginTop: "1rem" }}>
            IPIP-NEO-120
          </h2>
          <p className="section-text">
            Eine oeffentliche 120-Item-Version zur Erfassung der Big Five und ihrer 30
            Facetten. Sie verbindet gute Breite mit praktikabler Testlaenge.
          </p>

          <div className="inventory-popover-wrap">
            <button type="button" className="btn btn-outline inventory-popover-trigger">
              Mehr zum Inventar
            </button>
            <div className="inventory-popover-panel">
              <h3 className="inventory-popover-title">Was genau wird hier verwendet?</h3>
              <p className="section-text">
                Verwendet wird das IPIP-NEO-120 nach Johnson (2014). Es bildet die
                fuenf Big-Five-Dimensionen und 30 Facetten mit je vier Items pro
                Facette ab und basiert auf dem International Personality Item Pool.
              </p>
              <p className="section-text">
                Das Inventar ist public domain und wird deshalb haeufig in Forschung,
                Lehre und offenen Assessment-Umgebungen eingesetzt. Es orientiert sich
                inhaltlich am NEO PI-R beziehungsweise an dessen Facettenstruktur,
                ohne das proprietaere Original zu sein.
              </p>
              <p className="section-text">
                In der Entwicklungsarbeit wurde das Instrument als ausreichend reliabel
                und valide beschrieben, um sowohl die fuenf Hauptdimensionen als auch
                die 30 Facetten mit 120 Items abzubilden. Fuer Selbstreflexion und
                Forschungszwecke ist das sehr nuetzlich; fuer klinische Diagnosen ist
                es nicht gedacht.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TestPage;
