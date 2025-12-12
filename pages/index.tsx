import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {

  return (
    <div className="page-card">
      <div className="page-kicker">Überblick</div>
      <h1 className="page-title">OCEAN Community – Big Five und Austausch</h1>
      <p className="page-intro">
        Diese Demo-Plattform führt dich in drei Schritten vom Big-Five-Test zu einer kleinen Fragen-und-Antworten-Community.
        Sie ist bewusst schlicht gehalten und speichert alle Daten nur lokal im Browser.
      </p>

      <section style={{ marginTop: "2.5rem" }}>
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          Dein Weg in drei Schritten
        </h2>
        <div className="home-steps" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div>
            <div className="pill" style={{ marginBottom: "0.75rem" }}>
              <span className="pill-dot" />
              Schritt 1 · Test
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
              Big-Five-Test durchführen
            </h3>
            <p className="section-text" style={{ marginBottom: "1rem" }}>
              Mache eine kurze Big-Five-Selbsteinschätzung. Die Aussagen sind alltagstauglich formuliert und schnell beantwortet.
            </p>
            <Link href="/test" className="btn btn-primary">
              Big-Five-Test starten
            </Link>
          </div>
          <div>
            <div className="pill" style={{ marginBottom: "0.75rem" }}>
              <span className="pill-dot" />
              Schritt 2 · Resultate
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
              Dein Persönlichkeitsprofil
            </h3>
            <p className="section-text" style={{ marginBottom: "1rem" }}>
              Sieh dir dein Profil in den fünf Dimensionen an und lies kurze Hinweise dazu, wie diese Werte verstanden werden können.
            </p>
            <Link href="/results" className="btn btn-outline">
              Resultate ansehen
            </Link>
          </div>
          <div>
            <div className="pill" style={{ marginBottom: "0.75rem" }}>
              <span className="pill-dot" />
              Schritt 3 · Community
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
              Fragen & Austausch
            </h3>
            <p className="section-text" style={{ marginBottom: "1rem" }}>
              Stelle Fragen oder teile Erfahrungen zu Themen, die mit Persönlichkeit, Arbeit, Beziehungen oder Alltag zu tun haben.
            </p>
            <Link href="/community" className="btn btn-outline">
              Zur Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
