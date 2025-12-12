import React from "react";
import Link from "next/link";

const TestPage: React.FC = () => {
  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 1</div>
      <h1 className="page-title">Big-Five-Test wählen</h1>
      <p className="page-intro">
        Wähle zwischen einer kurzen Demo-Version oder dem vollständigen wissenschaftlich validierten Test.
      </p>

      <div style={{ marginTop: "2.5rem", display: "grid", gap: "2rem" }}>
        <div className="card-subtle">
          <h2 className="section-title">Kurze Demo-Version (10 Fragen)</h2>
          <p className="section-text">
            Ein schneller Überblick über die fünf Persönlichkeitsdimensionen. 
            <strong style={{ display: "block", marginTop: "0.75rem", color: "var(--warning)", fontSize: "0.9375rem" }}>
              ⚠️ Hinweis: Dies ist kein wissenschaftlich validierter Test und dient nur zur Demonstration.
            </strong>
          </p>
          <ul className="section-text" style={{ paddingLeft: "1.5rem", marginTop: "0.75rem", listStyleType: "disc" }}>
            <li>Dauer: ca. 2-3 Minuten</li>
            <li>10 Fragen (2 pro Dimension)</li>
            <li>Nur zur Orientierung</li>
          </ul>
          <Link href="/test/quick" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Kurze Version starten
          </Link>
        </div>

        <div className="card-subtle">
          <h2 className="section-title">Vollständiger Test (120 Fragen)</h2>
          <p className="section-text">
            Der offizielle Big-Five-Test basierend auf IPIP-NEO-PI-R. 
            Wissenschaftlich validiert und bietet detaillierte Einblicke in deine Persönlichkeitsstruktur.
          </p>
          <ul className="section-text" style={{ paddingLeft: "1.5rem", marginTop: "0.75rem", listStyleType: "disc" }}>
            <li>Dauer: ca. 15-20 Minuten</li>
            <li>120 Fragen (24 pro Dimension)</li>
            <li>Wissenschaftlich validiert</li>
            <li>Detaillierte Auswertung</li>
          </ul>
          <Link href="/test/full" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Vollständigen Test starten
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
