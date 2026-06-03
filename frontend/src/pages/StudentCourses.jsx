import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import "../styles/dashboard.css";
import "../styles/classroom.css";

const baseDoc = (name) => `${process.env.PUBLIC_URL}/documents/${name}`;

const coursesCatalog = [
  {
    id: "java-poo",
    title: "JAVA POO",
    teacher: "Mouhib Hayouni",
    schedule: "Lun 08:30–10:00",
    room: "Lab-9",
    accent: "#0f9d58",
    description: "Programmation orientée objet et bonnes pratiques Java.",
    announcements: [
      {
        id: "a1",
        date: "15 avr. 2026",
        text: "Devoir : implémenter les classes du TP3 pour la semaine prochaine.",
      },
      {
        id: "a2",
        date: "10 avr. 2026",
        text: "Support du cours 4 disponible ci-dessous (PDF).",
      },
    ],
    materials: [
      { id: "m1", name: "Cours 1 — Introduction POO.pdf", file: "exemple-cours.txt", size: "240 Ko" },
      { id: "m2", name: "TP3 — Héritage et polymorphisme.pdf", file: "exemple-cours.txt", size: "180 Ko" },
      { id: "m3", name: "Annexe — Diagrammes UML.pdf", file: "exemple-cours.txt", size: "95 Ko" },
    ],
  },
  {
    id: "se",
    title: "SE",
    teacher: "Chayma Ouni",
    schedule: "Mar 10:10–11:40",
    room: "Lab-3",
    accent: "#db4437",
    description: "Systèmes d’exploitation : processus, mémoire et fichiers.",
    announcements: [
      { id: "a1", date: "12 avr. 2026", text: "Quiz sur les threads — mercredi en ligne." },
    ],
    materials: [
      { id: "m1", name: "Chapitre 3 — Processus.pdf", file: "exemple-cours.txt", size: "310 Ko" },
      { id: "m2", name: "Lab — fork() et pipes.pdf", file: "exemple-cours.txt", size: "140 Ko" },
    ],
  },
  {
    id: "ai",
    title: "AI",
    teacher: "Anoir Borgi",
    schedule: "Mer 10:10–11:40",
    room: "TD-05",
    accent: "#f4b400",
    description: "Fondamentaux d’intelligence artificielle et apprentissage.",
    announcements: [
      { id: "a1", date: "8 avr. 2026", text: "Projet : choix du sujet à valider avant vendredi." },
    ],
    materials: [
      { id: "m1", name: "Slides — Régression et classification.pdf", file: "exemple-cours.txt", size: "420 Ko" },
      { id: "m2", name: "Dataset — exercice pratique.zip", file: "exemple-cours.txt", size: "1,2 Mo" },
    ],
  },
  {
    id: "projet-integre",
    title: "Projet intégré",
    teacher: "Mourad Hamdi",
    schedule: "Jeu 08:30–10:00",
    room: "Amphi-2",
    accent: "#4285f4",
    description: "Conception et livrables du projet de fin de semestre.",
    announcements: [
      { id: "a1", date: "5 avr. 2026", text: "Cahier des charges — version 1 à déposer sur l’espace cours." },
    ],
    materials: [
      { id: "m1", name: "Modèle — cahier des charges.docx", file: "exemple-cours.txt", size: "88 Ko" },
      { id: "m2", name: "Grille d’évaluation projet.pdf", file: "exemple-cours.txt", size: "56 Ko" },
    ],
  },
];

function StudentCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = coursesCatalog.find((c) => c.id === courseId);

  if (courseId && !course) {
    return (
      <div className="classroom page-pad">
        <div className="container classroom__inner">
          <p>Cours introuvable.</p>
          <Link to="/etudiants/mes-cours" className="classroom__back-link">
            Retour à mes cours
          </Link>
        </div>
      </div>
    );
  }

  if (course) {
    return (
      <div className="classroom page-pad">
        <div className="container classroom__inner">
          <button type="button" className="classroom__back" onClick={() => navigate("/etudiants/mes-cours")}>
            <ArrowLeft size={20} aria-hidden />
            Mes cours
          </button>

          <header
            className="classroom-detail__hero"
            style={{ "--classroom-accent": course.accent }}
          >
            <div className="classroom-detail__hero-text">
              <h1 className="classroom-detail__title">{course.title}</h1>
              <p className="classroom-detail__teacher">
                <User size={18} aria-hidden />
                {course.teacher}
              </p>
              <p className="classroom-detail__meta">
                <span>
                  <Calendar size={16} aria-hidden />
                  {course.schedule}
                </span>
                <span>
                  <MapPin size={16} aria-hidden />
                  {course.room}
                </span>
              </p>
            </div>
          </header>

          <p className="classroom-detail__desc">{course.description}</p>

          <div className="classroom-detail__layout">
            <section className="classroom-panel" aria-labelledby="stream-heading">
              <h2 id="stream-heading" className="classroom-panel__title">
                Fil de cours
              </h2>
              <ul className="classroom-stream">
                {course.announcements.map((a) => (
                  <li key={a.id} className="classroom-stream__item">
                    <span className="classroom-stream__date">{a.date}</span>
                    <p className="classroom-stream__text">{a.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="classroom-panel" aria-labelledby="work-heading">
              <h2 id="work-heading" className="classroom-panel__title">
                Travail et documents
              </h2>
              <p className="classroom-panel__hint">Téléchargez les supports publiés par l’enseignant.</p>
              <ul className="classroom-files">
                {course.materials.map((m) => (
                  <li key={m.id} className="classroom-file">
                    <span className="classroom-file__icon" aria-hidden>
                      <FileText size={22} />
                    </span>
                    <div className="classroom-file__info">
                      <span className="classroom-file__name">{m.name}</span>
                      <span className="classroom-file__meta">{m.size}</span>
                    </div>
                    <a
                      className="classroom-file__download btn btn--primary btn--sm"
                      href={baseDoc(m.file)}
                      download={m.name}
                    >
                      <Download size={18} aria-hidden />
                      Télécharger
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom page-pad">
      <div className="container classroom__inner">
        <header className="classroom__head">
          <div>
            <p className="dashboard__eyebrow">Espace étudiant</p>
            <h1 className="dashboard__title">Mes cours</h1>
            <p className="dashboard__subtitle">
              Style espace de classe : ouvrez un cours pour voir le fil et télécharger les documents.
            </p>
          </div>
          <Link to="/etudiants" className="classroom__back-link">
            <ArrowLeft size={18} aria-hidden />
            Tableau de bord
          </Link>
        </header>

        <div className="classroom-grid">
          {coursesCatalog.map((c) => (
            <Link
              key={c.id}
              to={`/etudiants/mes-cours/${c.id}`}
              className="classroom-card"
              style={{ "--card-accent": c.accent }}
            >
              <div className="classroom-card__banner" />
              <div className="classroom-card__body">
                <h2 className="classroom-card__title">{c.title}</h2>
                <p className="classroom-card__teacher">{c.teacher}</p>
                <p className="classroom-card__footer">
                  <BookOpen size={16} aria-hidden />
                  Ouvrir le cours
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentCourses;
