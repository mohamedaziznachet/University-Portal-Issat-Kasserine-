import React, { useEffect, useState } from "react";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";
import { TEACHER_SPACE_LINKS } from "../../constants/teacherNav";
import { getTeacherClassesSummary, getTeacherClassRoster, saveTeacherAttendance } from "../../services/api";

function TeacherAbsencesPage() {
  const [classes, setClasses] = useState([]);
  const [studyClass, setStudyClass] = useState("");
  const [students, setStudents] = useState([]);
  const [absent, setAbsent] = useState({});
  const [sessionDate, setSessionDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTeacherClassesSummary().then((d) => setClasses(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!studyClass) {
      setStudents([]);
      setAbsent({});
      return;
    }
    setLoading(true);
    setError("");
    getTeacherClassRoster(studyClass)
      .then((data) => {
        setStudents(data.students || []);
        setAbsent({});
      })
      .catch(() => setError("Impossible de charger la liste."))
      .finally(() => setLoading(false));
  }, [studyClass]);

  const toggleAbsent = (id) => {
    setAbsent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!studyClass) return;
    setSaving(true);
    setError("");
    setOk("");
    const absentStudentIds = Object.keys(absent).filter((k) => absent[k]);
    try {
      await saveTeacherAttendance({
        studyClass,
        sessionDate: new Date(sessionDate).toISOString(),
        absentStudentIds,
      });
      setOk(`Appel enregistré (${absentStudentIds.length} absent(s)).`);
    } catch (e) {
      setError(e.message || "Échec");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Absences — appel"
      subtitle="Choisissez une classe pour laquelle vous avez déjà des étudiants inscrits à vos cours, puis cochez les absents."
      links={TEACHER_SPACE_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <label className="form__label">
            Classe
            <select
              className="form__input"
              value={studyClass}
              onChange={(e) => setStudyClass(e.target.value)}
            >
              <option value="">— Choisir —</option>
              {classes.map((c) => (
                <option key={c.studyClass} value={c.studyClass}>
                  {c.studyClass} ({c.studentCount} étud.)
                </option>
              ))}
            </select>
          </label>
          <label className="form__label">
            Date et heure de séance
            <input
              className="form__input"
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </label>

          {loading ? <p className="dashboard__subtitle">Chargement…</p> : null}

          {students.length > 0 ? (
            <>
              <ul className="info-rich__list" style={{ marginTop: "1rem" }}>
                {students.map((st) => (
                  <li key={st._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!absent[st._id]}
                        onChange={() => toggleAbsent(st._id)}
                      />
                      Absent
                    </label>
                    <span>
                      <strong>
                        {st.lastName} {st.firstName}
                      </strong>{" "}
                      <span className="dashboard__subtitle" style={{ margin: 0 }}>
                        — {st.cin}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {error ? (
                <p className="dashboard__subtitle" style={{ color: "#b91c1c" }}>
                  {error}
                </p>
              ) : null}
              {ok ? <p className="form__success">{ok}</p> : null}
              <button type="button" className="btn btn--primary" style={{ marginTop: "1rem" }} disabled={saving} onClick={handleSave}>
                {saving ? "Enregistrement…" : "Valider l’appel"}
              </button>
            </>
          ) : null}

          {!loading && studyClass && students.length === 0 ? (
            <p className="dashboard__subtitle" style={{ marginTop: "1rem" }}>
              Aucun étudiant trouvé pour cette classe dans vos cours.
            </p>
          ) : null}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherAbsencesPage;
