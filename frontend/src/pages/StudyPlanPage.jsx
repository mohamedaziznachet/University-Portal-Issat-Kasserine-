import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/dashboard.css";
import { getStudentGrades } from "../services/api";
import api, { toUploadUrl } from "../services/api";
import { getStoredUser } from "../utils/auth";

const studyPlans = {
  eea: {
    title: "Licence Nationale en Electronique, Electrotechnique et Automatique",
    code: "LNEEA",
    objective:
      "Former des diplômés capables de concevoir, analyser et maintenir des systèmes électroniques et électrotechniques."
  },
  glsi: {
    title: "Sciences de l'Informatique - Parcours Génie Logiciels et Systèmes d'Information",
    code: "LN GLSI",
    objective:
      "Former des spécialistes en développement logiciel, bases de données, architecture applicative et systèmes d'information."
  },
  isi: {
    title: "Ingénierie des Systèmes Informatiques - Parcours Systèmes Embarqués et IoT",
    code: "LN ISI",
    objective:
      "Former des ingénieurs applicatifs en systèmes embarqués, objets connectés et intégration logiciel-matériel."
  },
  tic: {
    title: "Technologies de l'Information et de la Communication",
    code: "LN TIC",
    objective:
      "Développer des compétences en réseaux, télécommunications, développement web et services numériques."
  },
  lngm: {
    title: "Génie Mécanique - Parcours Productique",
    code: "LNGM",
    objective:
      "Former des profils orientés conception mécanique, procédés industriels, production et amélioration continue."
  }
};

const glsiSemesters = [
  {
    level: "1ère Année (L1)",
    semester: "Semestre 1",
    meta: "Somme des coefficients: 15 | Crédits: 30",
    units: [
      "Mathématique 1 (UE): Algèbre 1 (Cf 1,5) / Analyse 1 (Cf 1,5) — Total Cr: 3",
      "Algo & Prog 1 (UE): Algorithmique & BD (Cf 2) / Atelier prog 1 — Total Cr: 4",
      "Systèmes & Architecture (UE): Système d'exploitation 1 (Cf 2) / Systèmes logiques — Total Cr: 4",
      "Logique et Multimédia (UE): Logique formelle (Cf 1,5) / Technologies multimédias — Total Cr: 3",
      "Langue et Communication (UE): Anglais 1 (Cf 1) / Techniques communication 1 — Total Cr: 2",
    ],
  },
  {
    level: "1ère Année (L1)",
    semester: "Semestre 2",
    meta: "Somme des coefficients: 15 | Crédits: 30",
    units: [
      "Mathématiques 2 (UE): Algèbre 2 (Cf 1,5) / Analyse 2 (Cf 1,5) — Total Cr: 3",
      "Algo & Prog 2 (UE): Algo & complexité (Cf 1,5) / Prog Python / Atelier — Total Cr: 3",
      "Systèmes d'exp & Réseaux (UE): Système d'exploitation 2 (Cf 2) / Réseaux — Total Cr: 4",
      "Bases de données (UE): Fondements des bases de données (Cf 2) — Total Cr: 4",
      "Langues et Culture Numérique (UE): Anglais 2 (Cf 1) / Communication 2 / Culture numérique — Total Cr: 2",
    ],
  },
  {
    level: "2ème Année (L2)",
    semester: "Semestre 3",
    meta: "Crédits: 30",
    units: [
      "Probabilité (UE): Probabilité et Statistique (Cf 2) — Total Cr: 4",
      "Automates et Optimisation (UE): Théorie langages (Cf 1) / Graphes optimisation — Total Cr: 2",
      "CPOO (UE): Conception SI (Cf 2) / Programmation Java — Total Cr: 4",
      "Bases de données et Réseaux (UE): Ingénierie BD (Cf 1,5) / Services réseaux — Total Cr: 3",
      "Langue et Culture Ent. (UE): Anglais 3 (Cf 1) / Gestion d'entreprises — Total Cr: 2",
      "Optionnelle (UE): C++ (Cf 1,5) / Commerce électronique — Total Cr: 3",
    ],
  },
  {
    level: "2ème Année (L2)",
    semester: "Semestre 4",
    meta: "Crédits: 30",
    units: [
      "Bases de données (UE): Entrepôts de données (Cf 1) / Admin BD — Total Cr: 2",
      "Indexation et Web (UE): Indexation multimédia (Cf 1,5) / Prog web — Total Cr: 3",
      "Compilation & Tests (UE): Compilation (Cf 1,5) / Tests logiciels (ISTQB) — Total Cr: 3",
      "Intelligence artificielle (UE): Fondements IA (Cf 2) / Programmation IA — Total Cr: 4",
      "Langue et éthique (UE): Anglais 4 (Cf 1) / Droit info / Projet agile — Total Cr: 2",
      "Optionnelle (UE): Prog systèmes & réseaux (Cf 1,5) / Intro IoT — Total Cr: 3",
    ],
  },
  {
    level: "3ème Année (L3)",
    semester: "Semestre 5",
    meta: "Crédits: 30",
    units: [
      "Cloud & Big Data (UE): Big Data (Cf 1,5) / Virtualisation & Cloud / Mobile — Total Cr: 3",
      "Développement d'applications (UE): Développement d'applications réparties (Cf 2,5) — Total Cr: 5",
      "Machine Learning & Sécurité (UE): Machine Learning (Cf 1) / Sécurité informatique — Total Cr: 2",
      "Architecture SOA (UE): Architecture SOA et services web (Cf 2) — Total Cr: 4",
      "Langue et Entreprenariat (UE): Anglais 5 (Cf 1) / Entreprenariat / Préparation pro — Total Cr: 2",
      "Optionnelle (UE): Big Data Lang Rust (Cf 1,5) / Software dev — Total Cr: 3",
    ],
  },
  {
    level: "3ème Année (L3)",
    semester: "Semestre 6",
    meta: "Crédits: 30",
    units: ["Activité pratique (UE): Projet de Fin d'Études (PFE) (Cf 15) — Total Cr: 30"],
  },
];

function parseCoef(str) {
  const m = str.match(/\(Cf\s*([\d.,]+)\)/i);
  if (!m) return 1;
  return Number(String(m[1]).replace(",", "."));
}

function stripCf(text) {
  return text.replace(/\s*\(Cf\s*[\d.,]+\)\s*/gi, "").trim();
}

function parseUeLine(line) {
  const ueMatch = line.match(/^(.+?)\s*\(UE\)\s*:\s*(.+?)\s*—\s*Total Cr:\s*(\d+)/i);
  if (!ueMatch) return null;
  const ueName = ueMatch[1].trim();
  const rest = ueMatch[2].trim();
  const totalCr = Number(ueMatch[3]);
  const parts = rest.split("/").map((p) => p.trim()).filter(Boolean);
  const ecues = parts.map((part) => {
    const cf = parseCoef(part);
    const name = stripCf(part) || part;
    return {
      id: `${ueName}-${name}-${cf}`,
      name,
      coef: cf,
      ds: "",
      tp: "",
      oral: "",
      exam: "",
    };
  });
  return {
    id: ueName,
    ueName,
    ueCoef: totalCr,
    ecues,
  };
}

function ecueFinalNote(ds, tp, oral, exam) {
  const n = [ds, tp, oral, exam].map((x) => (x === "" || x === null ? NaN : Number(x)));
  if (n.some((v) => Number.isNaN(v))) return NaN;
  return n[0] * 0.1 + n[1] * 0.1 + n[2] * 0.1 + n[3] * 0.7;
}

function avgUe(ecues) {
  let sumW = 0;
  let sum = 0;
  ecues.forEach((e) => {
    const nf = ecueFinalNote(e.ds, e.tp, e.oral, e.exam);
    if (!Number.isNaN(nf)) {
      sum += nf * e.coef;
      sumW += e.coef;
    }
  });
  if (sumW === 0) return NaN;
  return sum / sumW;
}

function semesterAvg(ues) {
  let sumW = 0;
  let sum = 0;
  ues.forEach((ue) => {
    const m = avgUe(ue.ecues);
    if (!Number.isNaN(m)) {
      sum += m * ue.ueCoef;
      sumW += ue.ueCoef;
    }
  });
  if (sumW === 0) return NaN;
  return sum / sumW;
}

function buildSimulatorStateFromGlsi() {
  return glsiSemesters.map((sem) => {
    const parsed = sem.units.map(parseUeLine).filter(Boolean);
    return {
      key: `${sem.level}-${sem.semester}`,
      level: sem.level,
      semester: sem.semester,
      meta: sem.meta,
      ues: parsed,
    };
  });
}

function GlsiGradeSimulator() {
  const [state, setState] = useState(() => buildSimulatorStateFromGlsi());
  const [activeIdx, setActiveIdx] = useState(0);

  const active = state[activeIdx];
  const semAvg = useMemo(() => semesterAvg(active.ues), [active]);

  function updateEcue(ueId, ecueId, field, value) {
    setState((prev) =>
      prev.map((sem, idx) => {
        if (idx !== activeIdx) return sem;
        return {
          ...sem,
          ues: sem.ues.map((ue) => {
            if (ue.id !== ueId) return ue;
            return {
              ...ue,
              ecues: ue.ecues.map((ec) =>
                ec.id === ecueId ? { ...ec, [field]: value } : ec
              ),
            };
          }),
        };
      })
    );
  }

  function updateUeCoef(ueId, value) {
    setState((prev) =>
      prev.map((sem, idx) => {
        if (idx !== activeIdx) return sem;
        return {
          ...sem,
          ues: sem.ues.map((ue) =>
            ue.id === ueId ? { ...ue, ueCoef: Number(value) || 0 } : ue
          ),
        };
      })
    );
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h3 className="panel__title">Simulateur de moyennes GLSI</h3>
          <p className="dashboard__subtitle">
            Les notes (DS, TP, Oral, Examen) sont saisies uniquement par l’enseignant. Ici vous pouvez
            <strong> simuler une projection</strong> en recopiant les notes publiées sur la plateforme.
          </p>
        </div>
        <div className="form__label" style={{ minWidth: 200 }}>
          Semestre
          <select
            className="form__input"
            value={activeIdx}
            onChange={(e) => setActiveIdx(Number(e.target.value))}
          >
            {state.map((s, i) => (
              <option key={s.key} value={i}>
                {s.semester} — {s.level}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="dashboard__subtitle">{active.meta}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <p className="dashboard__subtitle" style={{ margin: 0 }}>
          Moyenne du semestre (calculée) :{" "}
          <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
            {Number.isNaN(semAvg) ? "—" : `${semAvg.toFixed(2)}/20`}
          </strong>
        </p>
        <button 
          type="button" 
          className="btn btn--primary" 
          style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
          onClick={() => {
            if (Number.isNaN(semAvg)) {
              alert("Veuillez saisir au moins une note pour calculer la moyenne.");
            } else {
              alert(`Votre moyenne simulée pour le ${active.semester} est de ${semAvg.toFixed(2)}/20`);
            }
          }}
        >
          Calculer
        </button>
      </div>

      {active.ues.map((ue) => {
        const ueAvg = avgUe(ue.ecues);
        return (
          <div key={ue.id} style={{ marginTop: "1.25rem" }}>
            <div className="panel__head" style={{ marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <h4 className="panel__title">{ue.ueName}</h4>
              <label className="form__label" style={{ maxWidth: 160, marginBottom: 0 }}>
                Cf UE (poids semestre)
                <input
                  className="form__input"
                  type="number"
                  min={0}
                  step={0.5}
                  value={ue.ueCoef}
                  onChange={(e) => updateUeCoef(ue.id, e.target.value)}
                />
              </label>
            </div>
            <p className="dashboard__subtitle">
              Moyenne UE :{" "}
              <strong>{Number.isNaN(ueAvg) ? "—" : `${ueAvg.toFixed(2)}/20`}</strong>
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ECUE</th>
                    <th>Cf</th>
                    <th>DS</th>
                    <th>TP</th>
                    <th>Oral</th>
                    <th>Examen</th>
                    <th>Note ECUE</th>
                  </tr>
                </thead>
                <tbody>
                  {ue.ecues.map((ec) => {
                    const nf = ecueFinalNote(ec.ds, ec.tp, ec.oral, ec.exam);
                    return (
                      <tr key={ec.id}>
                        <td data-label="ECUE">{ec.name}</td>
                        <td data-label="Cf">{ec.coef}</td>
                        {["ds", "tp", "oral", "exam"].map((field) => (
                          <td key={field} data-label={field.toUpperCase()}>
                            <input
                              className="form__input"
                              style={{ padding: "0.45rem 0.5rem", fontSize: "0.9rem" }}
                              inputMode="decimal"
                              placeholder="—"
                              value={ec[field]}
                              onChange={(e) => updateEcue(ue.id, ec.id, field, e.target.value)}
                            />
                          </td>
                        ))}
                        <td data-label="Note ECUE">
                          {Number.isNaN(nf) ? "—" : nf.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: "1rem" }}>
        <button type="button" className="panel__link" onClick={() => setState(buildSimulatorStateFromGlsi())}>
          Réinitialiser le simulateur
        </button>
      </div>
    </div>
  );
}

function TeacherPublishedGrades() {
  const user = getStoredUser();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "student") {
      setItems([]);
      return;
    }
    getStudentGrades()
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Connectez-vous en tant qu’étudiant pour voir les notes publiées."));
  }, [user]);

  if (!user || user.role !== "student") {
    return (
      <div className="panel">
        <h3 className="panel__title">Notes publiées par les enseignants</h3>
        <p className="dashboard__subtitle">
          Ces notes proviennent du système d’évaluation (saisie enseignant). Connectez-vous avec un compte
          étudiant pour les consulter ici.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3 className="panel__title">Notes publiées par les enseignants</h3>
      {error ? <p className="dashboard__subtitle" style={{ color: "#b91c1c" }}>{error}</p> : null}
      {!error && items.length === 0 ? (
        <p className="dashboard__subtitle">Aucune note publiée pour le moment.</p>
      ) : null}
      {!error && items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Devoir / évaluation</th>
                <th>Note /20</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  <td data-label="Matière">{row.assignment?.course?.title || "—"}</td>
                  <td data-label="Évaluation">{row.assignment?.title || "—"}</td>
                  <td data-label="Note">{row.mark != null ? row.mark : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="dashboard__subtitle" style={{ marginTop: "0.75rem" }}>
        Vous pouvez recopier ces notes dans le simulateur pour estimer vos moyennes UE et semestre.
      </p>
    </div>
  );
}

function StudyPlanPage() {
  const { licenseId } = useParams();
  const plan = studyPlans[licenseId];
  const [pdfPlan, setPdfPlan] = useState(null);

  useEffect(() => {
    if (licenseId !== "glsi") {
      api.get("/public/study-plans").then(res => {
        const p = res.data.find(x => x.licenseId === licenseId);
        if (p) setPdfPlan(p);
      }).catch(console.error);
    }
  }, [licenseId]);

  if (!plan) {
    return (
      <section className="section section--tight container">
        <h1>Plan d'étude introuvable</h1>
        <p>La licence demandée n'existe pas encore.</p>
        <Link to="/" className="btn btn--outline">
          Retour à l'accueil
        </Link>
      </section>
    );
  }

  return (
    <section className="section section--tight container">
      <h1>{plan.title}</h1>
      <p>
        <strong>Code:</strong> {plan.code}
      </p>
      <p>{plan.objective}</p>

      {licenseId === "glsi" ? (
        <>
          <h2>Structure du parcours GLSI</h2>
          <div className="dashboard__inner" style={{ gap: "1rem", marginTop: "1rem" }}>
            {glsiSemesters.map((item) => (
              <article key={`${item.level}-${item.semester}`} className="panel">
                <p className="dashboard__eyebrow">{item.level}</p>
                <h3 className="panel__title">{item.semester}</h3>
                <p className="dashboard__subtitle">{item.meta}</p>
                <ul className="info-rich__list" style={{ marginTop: "0.75rem" }}>
                  {item.units.map((unit) => (
                    <li key={unit}>{unit}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h2 style={{ marginTop: "1.5rem" }}>Système de calcul des moyennes</h2>
          <div className="panel">
            <h3 className="panel__title">Formule par ECUE (matière)</h3>
            <p className="dashboard__subtitle">
              Note ECUE = (DS × 0.1) + (TP × 0.1) + (Oral × 0.1) + (Examen × 0.7)
            </p>
            <h3 className="panel__title" style={{ marginTop: "1rem" }}>
              Formule par UE
            </h3>
            <p className="dashboard__subtitle">
              Moyenne UE = Σ(Note ECUE × Cf ECUE) / Σ(Cf ECUE)
            </p>
            <h3 className="panel__title" style={{ marginTop: "1rem" }}>
              Formule du semestre
            </h3>
            <p className="dashboard__subtitle">
              Moyenne Semestre = Σ(Moyenne UE × Cf UE) / Somme des coefficients du semestre
            </p>
          </div>

          <h2 style={{ marginTop: "1.5rem" }}>Notes enseignant & simulation</h2>
          <div className="dashboard__grid-2" style={{ alignItems: "start" }}>
            <TeacherPublishedGrades />
            <GlsiGradeSimulator />
          </div>
        </>
      ) : (
        <>
          <h2 style={{ marginTop: "1.5rem" }}>Plan d'étude officiel</h2>
          {pdfPlan ? (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <p className="dashboard__subtitle">Le plan d'étude détaillé est disponible au format PDF.</p>
              <div style={{ marginTop: "1rem" }}>
                <a href={toUploadUrl(pdfPlan.fileUrl)} target="_blank" rel="noreferrer" className="btn btn--primary">
                  Consulter le plan d'étude (PDF)
                </a>
              </div>
            </div>
          ) : (
            <>
              <h2>Structure type (En attente du PDF officiel)</h2>
              <ul style={{ marginTop: "1rem", lineHeight: 1.6 }}>
                <li>Semestre 1: Fondamentaux scientifiques et outils de base</li>
                <li>Semestre 2: UE de spécialité niveau 1 + TP</li>
                <li>Semestre 3: UE de spécialité niveau 2 + mini-projets</li>
                <li>Semestre 4: Technologies avancées + ouverture</li>
                <li>Semestre 5: Professionnalisation, stage d'initiation</li>
                <li>Semestre 6: Projet de fin d'études (PFE)</li>
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default StudyPlanPage;
