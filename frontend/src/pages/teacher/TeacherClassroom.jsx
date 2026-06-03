import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";
import { TEACHER_SPACE_LINKS } from "../../constants/teacherNav";
import { createTeacherCourse, getTeacherClassesSummary } from "../../services/api";

function TeacherClassroom() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTeacherClassesSummary()
      .then((data) => {
        if (!cancelled) setClasses(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les classes. Vérifiez la connexion ou réessayez.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const studyClass =
      String(fd.get("studyClass") || fd.get("studyClassFree") || "").trim();
    if (!studyClass) {
      setError("Indiquez ou choisissez la classe cible avant de publier.");
      setSubmitting(false);
      return;
    }
    fd.delete("studyClassFree");
    fd.set("studyClass", studyClass);

    try {
      const res = await createTeacherCourse(fd);
      const n = res.enrolledViaClassCount;
      setOk(
        typeof n === "number"
          ? `Cours publié. ${n} étudiant(s) de la classe « ${studyClass} » ont été inscrits automatiquement.`
          : "Cours créé avec succès."
      );
      form.reset();
    } catch (err) {
      setError(err.message || "Échec de la publication");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Classroom — publier un cours"
      subtitle="Sélectionnez la classe, puis remplissez le formulaire : le cours est associé à cette classe et les étudiants du groupe sont inscrits automatiquement."
      links={TEACHER_SPACE_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">
              <BookOpen size={20} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
              Nouveau cours pour une classe
            </h2>
          </div>

          {classes.length === 0 && !error ? (
            <p className="dashboard__subtitle">Chargement des classes…</p>
          ) : null}

          <form className="form form--tight" style={{ marginTop: "1rem" }} onSubmit={handleSubmit}>
            <label className="form__label">
              Classe de la classroom
              {classes.length > 0 ? (
                <select className="form__input" name="studyClass" required defaultValue="">
                  <option value="" disabled>
                    Choisir une classe…
                  </option>
                  {classes.map((c) => (
                    <option key={c.studyClass} value={c.studyClass}>
                      {c.studyClass} — {c.studentCount} étudiant(s) dans vos cours
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    className="form__input"
                    name="studyClassFree"
                    required
                    placeholder="Ex. GLSI-L2-A (identique au champ « groupe » des étudiants)"
                  />
                  <p className="dashboard__subtitle" style={{ marginTop: "0.35rem" }}>
                    Les classes listées proviennent des étudiants déjà inscrits à vos cours. Ici vous pouvez saisir le nom du
                    groupe : les étudiants correspondants seront inscrits automatiquement lorsqu’ils existent en base.
                  </p>
                </>
              )}
            </label>
            <label className="form__label">
              Titre du cours
              <input className="form__input" name="title" required placeholder="Ex. Bases de données avancées" />
            </label>
            <label className="form__label">
              Description
              <textarea className="form__input" name="description" rows={3} placeholder="Objectifs, plan, prérequis…" />
            </label>
            <label className="form__label">
              Filière (optionnel)
              <input className="form__input" name="filiere" placeholder="Ex. LN GLSI" />
            </label>
            <label className="form__label">
              Année universitaire (optionnel)
              <input className="form__input" name="academicYear" placeholder="2025-2026" />
            </label>
            <label className="form__label">
              Liens vidéo (un par ligne)
              <textarea className="form__input" name="videoLinks" rows={2} placeholder="https://…" />
            </label>
            <label className="form__label">
              Documents (PDF, ZIP…)
              <input className="form__input" type="file" name="documents" multiple />
            </label>
            {error ? (
              <p className="form__success" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#991b1b" }}>
                {error}
              </p>
            ) : null}
            {ok ? <p className="form__success">{ok}</p> : null}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Publication…" : "Publier le cours pour cette classe"}
            </button>
          </form>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherClassroom;
