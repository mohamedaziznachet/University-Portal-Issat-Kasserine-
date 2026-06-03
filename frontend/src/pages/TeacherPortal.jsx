import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, FolderPlus, UserX, ArrowRight, MessageSquare } from "lucide-react";
import RoleDashboardLayout from "../components/RoleDashboardLayout";
import "../styles/dashboard.css";
import { TEACHER_SPACE_LINKS } from "../constants/teacherNav";
import { getTeacherAssignments, getTeacherClassesSummary } from "../services/api";
import { getStoredUser } from "../utils/auth";

function formatFrenchDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function typeLabel(t) {
  const m = { TP: "TP", DS: "DS", Oral: "Oral", Examen: "Examen" };
  return m[t] || t || "—";
}

function TeacherPortal() {
  const [classSummary, setClassSummary] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    getTeacherClassesSummary()
      .then((d) => setClassSummary(Array.isArray(d) ? d : []))
      .catch(() => setClassSummary([]));
    getTeacherAssignments()
      .then((d) => setAssignments(Array.isArray(d) ? d : []))
      .catch(() => setAssignments([]));
  }, []);

  const assignmentFeed = assignments.slice(0, 12);

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Interface enseignant"
      subtitle="Gérez vos cours par classe, publiez des devoirs typés (TP, DS, Oral, Examen), corrigez les soumissions et faites l’appel d’absence."
      links={TEACHER_SPACE_LINKS}
    >
      <div className="dashboard dashboard__inner">
        {getStoredUser()?.status === "pending" && (
          <div className="panel" style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem', padding: '1rem' }}>
            <p style={{ color: '#92400e', fontWeight: '600', margin: 0 }}>
              ⚠️ Votre compte est en attente de validation administrative.
            </p>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Vos cours ne seront visibles par les étudiants qu'une fois votre compte approuvé par l'administration.
            </p>
          </div>
        )}
        <div className="dash-cards">
          <Link to="/espace/enseignant/classroom" className="dash-card">
            <span className="dash-card__icon">
              <BookOpen size={22} />
            </span>
            <h2 className="dash-card__title">Mes cours</h2>
            <p className="dash-card__desc">Classroom : choisir la classe et publier le cours pour ses étudiants.</p>
            <span className="dash-card__action">
              Ouvrir <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/espace/enseignant/devoirs" className="dash-card">
            <span className="dash-card__icon">
              <ClipboardList size={22} />
            </span>
            <h2 className="dash-card__title">Mes devoirs</h2>
            <p className="dash-card__desc">Créer un devoir dans le cours, date limite, type et barème (notification étudiants).</p>
            <span className="dash-card__action">
              Gérer <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/espace/enseignant/soumissions" className="dash-card">
            <span className="dash-card__icon">
              <FolderPlus size={22} />
            </span>
            <h2 className="dash-card__title">Soumissions</h2>
            <p className="dash-card__desc">Attribuer TP, DS, Oral, Examen et la note combinée selon votre barème.</p>
            <span className="dash-card__action">
              Corriger <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/espace/enseignant/absences" className="dash-card">
            <span className="dash-card__icon">
              <UserX size={22} />
            </span>
            <h2 className="dash-card__title">Absences</h2>
            <p className="dash-card__desc">Choisir la classe suivie puis cocher les absents pour la séance.</p>
            <span className="dash-card__action">
              Appel <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/espace/enseignant/messages" className="dash-card">
            <span className="dash-card__icon">
              <MessageSquare size={22} />
            </span>
            <h2 className="dash-card__title">Messagerie</h2>
            <p className="dash-card__desc">Envoyez et recevez des messages de vos étudiants.</p>
            <span className="dash-card__action">
              Discuter <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        <div className="dashboard__grid-2">
          <section className="panel" aria-labelledby="teacher-classes-heading">
            <div className="panel__head">
              <h2 id="teacher-classes-heading" className="panel__title">
                Classes suivies — effectifs
              </h2>
              <Link to="/espace/enseignant/classroom" className="panel__link">
                Publier un cours
              </Link>
            </div>
            {classSummary.length === 0 ? (
              <p className="dashboard__subtitle">
                Les groupes sont déduits des étudiants inscrits à vos cours. Publiez un cours avec une classe cible ou assignez des
                étudiants pour apparaître ici.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Classe</th>
                      <th>Étudiants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSummary.map((row) => (
                      <tr key={row.studyClass}>
                        <td data-label="Classe">{row.studyClass}</td>
                        <td data-label="Étudiants">{row.studentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel" aria-labelledby="teacher-assignments-heading">
            <div className="panel__head">
              <h2 id="teacher-assignments-heading" className="panel__title">
                Fil des devoirs
              </h2>
              <Link to="/espace/enseignant/devoirs" className="panel__link">
                Nouveau devoir
              </Link>
            </div>
            {assignmentFeed.length === 0 ? (
              <p className="dashboard__subtitle">Aucun devoir publié pour le moment.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Annonce</th>
                      <th>Type</th>
                      <th>Créé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentFeed.map((item) => (
                      <tr key={item._id}>
                        <td data-label="Devoir">
                          <strong>{item.title}</strong>
                          {item.course?.title ? (
                            <span className="dashboard__subtitle" style={{ display: "block", margin: "0.15rem 0 0" }}>
                              {item.course.title}
                            </span>
                          ) : null}
                        </td>
                        <td data-label="Type">{typeLabel(item.evaluationType)}</td>
                        <td data-label="Créé">{formatFrenchDateTime(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherPortal;
