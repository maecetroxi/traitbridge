import React from "react";
import Link from "next/link";

const BackgroundPage: React.FC = () => {
  return (
    <div className="page-card">
      <div className="page-kicker">Hintergrund</div>
      <h1 className="page-title">Was bedeuten die Big Five?</h1>
      <p className="page-intro">
        Die Big Five sind ein wissenschaftliches Modell zur Beschreibung von
        Persoenlichkeit. Es ordnet individuelle Unterschiede entlang von fuenf breiten
        Dimensionen ein. Die Werte sind keine starren Typen, sondern Positionen auf
        einem Kontinuum.
      </p>

      <div className="background-grid">
        <section className="card-subtle background-card">
          <div className="pill">
            <span className="pill-dot" />
            Offenheit
          </div>
          <p className="section-text">
            Beschreibt Interesse an Ideen, Fantasie, Aesthetik und neuen Erfahrungen.
            Hohe Werte gehen oft mit Neugier und geistiger Beweglichkeit einher,
            niedrigere Werte eher mit Bodenstaendigkeit und Vertrautem.
          </p>
        </section>

        <section className="card-subtle background-card">
          <div className="pill">
            <span className="pill-dot" />
            Gewissenhaftigkeit
          </div>
          <p className="section-text">
            Betont Organisation, Zielorientierung, Disziplin und Zuverlaessigkeit.
            Hohe Werte sprechen oft fuer Struktur und Ausdauer, niedrigere eher fuer
            mehr Spontaneitaet und geringere Planungstiefe.
          </p>
        </section>

        <section className="card-subtle background-card">
          <div className="pill">
            <span className="pill-dot" />
            Extraversion
          </div>
          <p className="section-text">
            Beschreibt Aktivitaet, Geselligkeit, positive Emotionalitaet und
            Durchsetzungsfreude. Hohe Werte passen oft zu sozialer Energie,
            niedrigere eher zu Reserviertheit und einem staerkeren Fokus auf Ruhe.
          </p>
        </section>

        <section className="card-subtle background-card">
          <div className="pill">
            <span className="pill-dot" />
            Vertraeglichkeit
          </div>
          <p className="section-text">
            Betrifft Kooperationsbereitschaft, Empathie, Nachsicht und soziale
            Ruecksicht. Hohe Werte stehen oft fuer Warmherzigkeit, niedrigere eher
            fuer Direktheit, Skepsis oder staerkere Interessenorientierung.
          </p>
        </section>

        <section className="card-subtle background-card">
          <div className="pill">
            <span className="pill-dot" />
            Emotionale Stabilitaet
          </div>
          <p className="section-text">
            Diese Dimension ist das Gegenstueck zu Neurotizismus. Sie beschreibt,
            wie stark jemand auf Stress, Unsicherheit und Belastung reagiert. Hohe
            Stabilitaet kann fuer Gelassenheit sprechen, niedrigere Werte fuer
            groessere emotionale Reagibilitaet.
          </p>
        </section>
      </div>

      <section className="card-subtle" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">Wie man Ergebnisse lesen sollte</h2>
        <div className="stack-md">
          <p className="section-text">
            Die Big Five sind keine Kategorien wie introvertiert oder extrovertiert
            im Entweder-oder-Sinn. Ein Profil zeigt, wo du im Vergleich zu anderen
            tendenziell liegst.
          </p>
          <p className="section-text">
            Ein hoher oder niedriger Wert ist nicht automatisch gut oder schlecht.
            Unterschiedliche Auspraegungen koennen je nach Kontext Staerken oder
            Herausforderungen mit sich bringen.
          </p>
          <p className="section-text">
            Wirklich interessant wird das Modell oft dann, wenn man die Kombination
            der fuenf Bereiche und ihrer Facetten betrachtet statt nur einzelne Werte
            isoliert zu lesen.
          </p>
        </div>
      </section>

      <div className="test-action-row" style={{ marginTop: "2rem" }}>
        <Link href="/test" className="btn btn-outline">
          Zur Testseite
        </Link>
        <Link href="/test/full" className="btn btn-primary">
          Direkt zum Test
        </Link>
      </div>
    </div>
  );
};

export default BackgroundPage;
