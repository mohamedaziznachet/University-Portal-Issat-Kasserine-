import React, { useEffect, useState } from "react";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";
import { TEACHER_SPACE_LINKS } from "../../constants/teacherNav";
import { getAssignmentSubmissions, getTeacherAssignments, updateSubmissionGrade } from "../../services/api";

function numOrEmpty(v) {
  if (v === "" || v == null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function TeacherSubmissionsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [rows, setRows] = useState({});
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    getTeacherAssignments().then((data) => {
      setAssignments(data);
      if (data.length) setSelectedId((prev) => prev || String(data[0]._id));
    });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSubmissions([]);
      setRows({});
      return;
    }
    getAssignmentSubmissions(selectedId)
      .then((items) => {
        setSubmissions(items);
        const next = {};
        items.forEach((s) => {
          next[s._id] = {
            ds: s.markDs ?? "",
            tp: s.markTp ?? "",
            oral: s.markOral ?? "",
            examen: s.markExamen ?? "",
            mark: s.mark ?? "",
            feedback: s.feedback ?? "",
          };
        });
        setRows(next);
      })
      .catch(() => setError("Chargement des soumissions impossible."));
  }, [selectedId]);

  const updateRow = (id, field, value) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveRow = async (sid) => {
    setError("");
    setOk("");
    setSavingId(sid);
    const r = rows[sid] || {};
    try {
      await updateSubmissionGrade(sid, {
        ds: r.ds === "" ? undefined : Number(r.ds),
        tp: r.tp === "" ? undefined : Number(r.tp),
        oral: r.oral === "" ? undefined : Number(r.oral),
        examen: r.examen === "" ? undefined : Number(r.examen),
        mark: r.mark === "" ? undefined : Number(r.mark),
        feedback: r.feedback,
      });
      setOk("Notation enregistrée. L’étudiant est notifié.");
    } catch (e) {
      setError(e.message || "Échec");
    } finally {
      setSavingId("");
    }
  };

  const selectedAssignment = assignments.find((a) => String(a._id) === String(selectedId));

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Soumissions et notation"
      subtitle="Saisissez les notes DS, TP, Oral et Examen sur /20. Si les quatre valeurs sont renseignées sans note manuelle, la moyenne UE (0,1 DS + 0,1 TP + 0,1 Oral + 0,7 Examen) est calculée automatiquement."
      links={TEACHER_SPACE_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Choix du devoir</h2>
          </div>
          <label className="form__label">
            Devoir
            <select
              className="form__input"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.course?.title ? `${a.course.title} — ` : ""}
                  {a.title}{" "}
                  {a.evaluationType ? `(${a.evaluationType})` : ""}
                </option>
              ))}
            </select>
          </label>
          {selectedAssignment ? (
            <p className="dashboard__subtitle">
              Type : <strong>{selectedAssignment.evaluationType || "TP"}</strong> • Barème max :{" "}
              <strong>{selectedAssignment.maxScore ?? 20}</strong>
            </p>
          ) : null}
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel__title">Étudiants</h2>
          {error ? (
            <p className="dashboard__subtitle" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          ) : null}
          {ok ? <p className="form__success">{ok}</p> : null}
          {submissions.length === 0 ? (
            <p className="dashboard__subtitle">Aucune soumission pour ce devoir (ou chargement…).</p>
          ) : (
            <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>DS</th>
                    <th>TP</th>
                    <th>Oral</th>
                    <th>Examen</th>
                    <th>Note /20</th>
                    <th>Commentaire</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => {
                    const r = rows[s._id] || {};
                    return (
                      <tr key={s._id}>
                        <td data-label="Étudiant">
                          {s.student?.firstName} {s.student?.lastName}
                          <br />
                          <small className="dashboard__subtitle" style={{ margin: 0 }}>
                            {s.student?.cin}
                          </small>
                        </td>
                        {["ds", "tp", "oral", "examen"].map((f) => (
                          <td key={f} data-label={f}>
                            <input
                              className="form__input"
                              style={{ padding: "0.35rem", maxWidth: "4.5rem" }}
                              inputMode="decimal"
                              value={numOrEmpty(r[f])}
                              onChange={(e) => updateRow(s._id, f, e.target.value)}
                            />
                          </td>
                        ))}
                        <td data-label="Note">
                          <input
                            className="form__input"
                            style={{ padding: "0.35rem", maxWidth: "4.5rem" }}
                            inputMode="decimal"
                            placeholder="auto"
                            value={numOrEmpty(r.mark)}
                            onChange={(e) => updateRow(s._id, "mark", e.target.value)}
                          />
                        </td>
                        <td data-label="Commentaire">
                          <input
                            className="form__input"
                            style={{ padding: "0.35rem", minWidth: "140px" }}
                            value={r.feedback || ""}
                            onChange={(e) => updateRow(s._id, "feedback", e.target.value)}
                          />
                        </td>
                        <td data-label="Action">
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            disabled={savingId === s._id}
                            onClick={() => saveRow(s._id)}
                          >
                            {savingId === s._id ? "…" : "Enregistrer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherSubmissionsPage;
