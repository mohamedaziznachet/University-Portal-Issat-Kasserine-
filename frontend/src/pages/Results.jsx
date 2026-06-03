import React from "react";
import "../styles/dashboard.css";

const grades = [
  { matière: "JAVA POO", note: "15", coefficient: "2", résultat: "Validé" },
  { matière: "SE", note: "12", coefficient: "2", résultat: "Validé" },
  { matière: "Anglais", note: "18", coefficient: "1", résultat: "Validé" },
  { matière: "Projet intégré", note: "20", coefficient: "3", résultat: "Validé" },
  { matière: "AI", note: "14", coefficient: "2", résultat: "Validé" },
  { matière: "C", note: "18", coefficient: "2", résultat: "Validé" },
  { matière: "Technique de communication", note: "11", coefficient: "1", résultat: "Validé" },
  { matière: "Analyse", note: "8", coefficient: "1.5", résultat: "Non Valide" },
  { matière: "Algebre", note: "5", coefficient: "1.5", résultat: "Non Valide" },
];

function Results() {
  return (
    <div className="dashboard page-pad">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">Résultats</p>
          <h1 className="dashboard__title">Notes &amp; relevés</h1>
          <p className="dashboard__subtitle">
            Consultez vos évaluations par matière. Les données sont données à titre d’exemple.
          </p>
        </header>

        <section className="panel panel--flush">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Note</th>
                  <th>Coefficient</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.matière}>
                    <td data-label="Matière">{g.matière}</td>
                    <td data-label="Note">{g.note}</td>
                    <td data-label="Coefficient">{g.coefficient}</td>
                    <td data-label="Résultat">
                      <span className="badge badge--success">{g.résultat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Results;
