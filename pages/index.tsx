import React from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="page-card">
      <div className="page-kicker">Persoenlichkeit verstehen</div>
      <h1 className="page-title">Klarer auf dich schauen. Klarer mit anderen umgehen.</h1>
      <p className="page-intro">
        TraitBridge verbindet Persoenlichkeitsprofil, Einordnung und Austausch an einem Ort. Ohne Schubladen, ohne pauschale
        Internet-Tipps.
      </p>
      <p className="home-promise">
        {"Lerne dich selbst kennen, verstehe andere besser und filtere unpassende Internet-Ratschl\u00e4ge."}
      </p>

      <section className="home-options">
        <h2 className="section-title home-options-title">Was du hier machen kannst</h2>
        <div className="home-options-grid">
          <article className="home-option-card">
            <div className="pill home-option-tag">
              <span className="pill-dot" />
              Selbstbild
            </div>
            <h3 className="home-option-title">Big-Five-Test starten</h3>
            <p className="section-text">
              Beantworte alltagsnahe Aussagen und erhalte ein differenziertes Profil statt vereinfachter Typen-Schubladen.
            </p>
            <Link href="/test" className="btn btn-primary">
              Jetzt testen
            </Link>
          </article>

          <article className="home-option-card">
            <div className="pill home-option-tag">
              <span className="pill-dot" />
              Verstaendnis
            </div>
            <h3 className="home-option-title">Profil einordnen</h3>
            <p className="section-text">
              Sieh deine Auspraegungen in Ruhe an und nutze die Hinweise, um Verhalten einzuordnen statt vorschnell zu bewerten.
            </p>
            {user ? (
              <Link href="/profile" className="btn btn-outline">
                Zu meinen Resultaten
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline">
                Anmelden und Resultate sehen
              </Link>
            )}
          </article>

          <article className="home-option-card">
            <div className="pill home-option-tag">
              <span className="pill-dot" />
              Perspektiven
            </div>
            <h3 className="home-option-title">Erfahrungen austauschen</h3>
            <p className="section-text">
              Stelle Fragen zu Alltag, Arbeit und Beziehungen und bekomme Antworten aus unterschiedlichen
              Persoenlichkeitsblickwinkeln.
            </p>
            <Link href="/community" className="btn btn-outline">
              Zur Community
            </Link>
          </article>

          <article className="home-option-card">
            <div className="pill home-option-tag">
              <span className="pill-dot" />
              Orientierung
            </div>
            <h3 className="home-option-title">Ratschlaege besser filtern</h3>
            <p className="section-text">
              Nutze Profil und Community, um zu erkennen, welche Tipps zu deiner Situation passen und welche eher 08/15
              bleiben.
            </p>
            <Link href="/community" className="btn btn-outline">
              Tipps vergleichen
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
