import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import issatPages from "../data/issatPages.json";
import api from "../services/api";
import "../styles/dashboard.css";

function decodeEntities(text) {
  if (!text) return "";
  return text
    .replace(/&oelig;/g, "oe")
    .replace(/&deg;/g, "°")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderCreationLaw(desc) {
  const normalized = decodeEntities(desc);
  const lines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);

  const bulletStart = lines.findIndex((l) => l.toLowerCase().includes("ces offres sont régies par"));
  const contactStart = lines.findIndex((l) => l.toLowerCase().startsWith("directeur"));

  const intro = lines.slice(0, bulletStart > -1 ? bulletStart : lines.length);
  const bullets =
    bulletStart > -1
      ? lines.slice(bulletStart + 1, Math.min(contactStart > -1 ? contactStart : lines.length, bulletStart + 4))
      : [];
  const contacts = contactStart > -1 ? lines.slice(contactStart) : [];

  return (
    <section className="panel">
      <h2 className="panel__title panel__title--solo">Présentation et cadre légal</h2>
      <div className="info-rich">
        {intro.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}
      </div>

      {bullets.length > 0 ? (
        <>
          <h3 className="info-rich__subtitle">Organisation de la formation (LMD)</h3>
          <ul className="info-rich__list">
            {bullets.map((item, i) => (
              <li key={`b-${i}`}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      {contacts.length > 0 ? (
        <>
          <h3 className="info-rich__subtitle">Direction et contact</h3>
          <ul className="info-rich__list">
            {contacts.map((item, i) => (
              <li key={`c-${i}`}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function renderScientificCouncil(title, desc) {
  const normalized = decodeEntities(desc);
  const lines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);
  const headIndex = lines.findIndex((l) => l.toLowerCase().includes("nom & prénom"));
  const rowsSource = headIndex > -1 ? lines.slice(headIndex + 3) : [];
  const rows = [];

  for (let i = 0; i + 2 < rowsSource.length; i += 3) {
    rows.push({
      name: rowsSource[i],
      grade: rowsSource[i + 1],
      role: rowsSource[i + 2],
    });
  }

  return (
    <section className="panel">
      <h2 className="panel__title panel__title--solo">{title}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom & Prénom</th>
              <th>Grade</th>
              <th>Qualité</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`r-${i}`}>
                <td data-label="Nom & Prénom">{r.name}</td>
                <td data-label="Grade">{r.grade}</td>
                <td data-label="Qualité">{r.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InfoPage() {
  const { pageKey } = useParams();
  const [data, setData] = useState(issatPages[pageKey] || null);
  const [loading, setLoading] = useState(!issatPages[pageKey]);

  useEffect(() => {
    if (!issatPages[pageKey]) {
      // Essayons de récupérer d'abord comme un Post (actualité), puis comme une SitePage
      api.get(`/public/posts/${pageKey}`)
        .then((res) => {
          setData({ title: res.data.title, desc: res.data.content || res.data.summary });
          setLoading(false);
        })
        .catch(() => {
          api.get(`/public/pages/${pageKey}`)
            .then((res) => {
              setData({ title: res.data.title, desc: res.data.content });
              setLoading(false);
            })
            .catch(() => {
              setLoading(false);
            });
        });
    } else {
      setData(issatPages[pageKey]);
      setLoading(false);
    }
  }, [pageKey]);

  if (loading) {
    return (
      <div className="dashboard page-pad">
        <div className="container dashboard__inner">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard page-pad">
        <div className="container dashboard__inner">
          <header className="dashboard__head">
            <h1 className="dashboard__title">Page non trouvée</h1>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard page-pad">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">ISSAT Kasserine</p>
          <h1 className="dashboard__title">{data.title}</h1>
          <p className="dashboard__subtitle" style={{ whiteSpace: "pre-line" }}>
            {data.desc || "Contenu non disponible pour le moment."}
          </p>
        </header>

        {pageKey === "creationLaw" ? (
          renderCreationLaw(data.desc)
        ) : pageKey === "scientificCouncil" ? (
          renderScientificCouncil(data.title, data.desc)
        ) : (
          <section className="panel">
            <div className="info-rich">
              <p style={{ whiteSpace: "pre-line" }}>{decodeEntities(data.desc || "Contenu non disponible pour le moment.")}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default InfoPage;
