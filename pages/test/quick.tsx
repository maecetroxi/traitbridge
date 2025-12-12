import React from "react";
import BigFiveTest from "../../components/BigFiveTest";

const QuickTestPage: React.FC = () => {
  return (
    <>
      <div style={{ 
        background: "var(--warning-soft)", 
        border: "1.5px solid var(--warning)",
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        marginBottom: "2rem",
        boxShadow: "var(--shadow-sm)"
      }}>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
          <strong style={{ color: "var(--warning)" }}>⚠️ Wichtiger Hinweis:</strong> Dies ist eine kurze Demo-Version mit nur 10 Fragen. 
          Sie ist <strong>nicht wissenschaftlich validiert</strong> und dient nur zur Demonstration der Plattform. 
          Für eine zuverlässige Persönlichkeitsanalyse verwende bitte den vollständigen Test mit 120 Fragen.
        </p>
      </div>
      <BigFiveTest variant="quick" />
    </>
  );
};

export default QuickTestPage;








