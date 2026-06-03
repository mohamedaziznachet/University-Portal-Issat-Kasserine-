import React from "react";
import { Download } from "lucide-react";
import "../styles/dashboard.css";

const files = [
  { name: "Attestation de scolarité", format: "PDF", size: "120 Ko" },
  { name: "Relevé de notes", format: "PDF", size: "85 Ko" },
  { name: "Certificat d’inscription", format: "PDF", size: "95 Ko" },
];

function Downloads() {
  return (
    <div className="dashboard page-pad">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">Documents</p>
          <h1 className="dashboard__title">Téléchargements</h1>
          <p className="dashboard__subtitle">
            Documents administratifs fréquemment demandés. Cliquez pour simuler un téléchargement.
          </p>
        </header>

        <section className="panel">
          <ul className="download-list">
            {files.map((f) => (
              <li key={f.name} className="download-item">
                <div className="download-item__info">
                  <span className="download-item__name">{f.name}</span>
                  <span className="download-item__meta">
                    {f.format} · {f.size}
                  </span>
                </div>
                <button type="button" className="download-item__btn" aria-label={`Télécharger ${f.name}`}>
                  <Download size={20} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Downloads;
