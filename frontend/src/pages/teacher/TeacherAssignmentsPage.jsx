import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";
import { TEACHER_SPACE_LINKS } from "../../constants/teacherNav";
import { createTeacherAssignment, getTeacherCourses } from "../../services/api";

const EVAL_TYPES = [
  { value: "TP", label: "TP (Travail pratique)" },
  { value: "DS", label: "DS (Devoir surveillé)" },
  { value: "Oral", label: "Oral" },
  { value: "Examen", label: "Examen" },
];

function TeacherAssignmentsPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTeacherCourses()
      .then(setCourses)
      .catch(() => setError("Impossible de charger vos cours."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const due = fd.get("dueDate");
    if (due) {
      fd.set("dueDate", new Date(String(due)).toISOString());
    }
    try {
      await createTeacherAssignment(fd);
      setOk("Devoir publié. Les étudiants inscrits au cours ont été notifiés.");
      form.reset();
    } catch (err) {
      setError(err.message || "Publication impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Mes devoirs — classroom"
      subtitle="Créez un devoir dans le cours choisi, renseignez le type d’évaluation, la date limite et le barème. Les étudiants concernés reçoivent une notification."
      links={TEACHER_SPACE_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">
              <ClipboardList size={20} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
              Publier un devoir
            </h2>
          </div>

          <form className="form form--tight" style={{ marginTop: "1rem" }} onSubmit={handleSubmit}>
            <label className="form__label">
              Cours lié
              <select className="form__input" name="courseId" required defaultValue="">
                <option value="" disabled>
                  Sélectionner un cours…
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                    {c.studyClass ? ` — ${c.studyClass}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Titre du devoir
              <input className="form__input" name="title" required placeholder="Ex. TP 3 — Conception" />
            </label>
            <label className="form__label">
              Consignes
              <textarea className="form__input" name="instructions" rows={3} />
            </label>
            <label className="form__label">
              Type d’évaluation
              <select className="form__input" name="evaluationType" defaultValue="TP">
                {EVAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Barème (points max, ex. 20)
              <input className="form__input" type="number" name="maxScore" min={1} max={40} defaultValue={20} />
            </label>
            <label className="form__label">
              Date et heure limite
              <input className="form__input" type="datetime-local" name="dueDate" required />
            </label>
            <label className="form__label">
              Pièces jointes (facultatif)
              <input className="form__input" type="file" name="attachments" multiple />
            </label>
            <p className="dashboard__subtitle" style={{ marginTop: "-0.25rem" }}>
              Les devoirs marqués Oral ou Examen n’exigent pas forcément de fichier côté étudiant.
            </p>
            {error ? (
              <p className="form__success" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#991b1b" }}>
                {error}
              </p>
            ) : null}
            {ok ? <p className="form__success">{ok}</p> : null}
            <button type="submit" className="btn btn--primary" disabled={submitting || courses.length === 0}>
              {submitting ? "Envoi…" : "Publier le devoir"}
            </button>
          </form>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherAssignmentsPage;
