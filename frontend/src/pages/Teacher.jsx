import React, { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getPublicTeachers, toUploadUrl } from "../services/api";
import teachersIssatData from "../data/teachersIssat.json"; // Fallback
import "../styles/dashboard.css";

const PHOTO_BASE = "https://issatkas.rnu.tn";

function photoUrl(path) {
  if (!path || path === "images/profil.jpg") return null;
  if (path.startsWith("http")) return path;
  // If it looks like a local upload from the portal
  if (path.startsWith("uploads/") || path.startsWith("useruploads/")) {
     return toUploadUrl(path);
  }
  return `${PHOTO_BASE}/${path.replace(/^\//, "")}`;
}

function getInitials(prenom, nom) {
  return `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
}

function TeacherAvatar({ prenom, nom, src }) {
  const [broken, setBroken] = useState(false);
  const label = `${prenom} ${nom}`.trim();
  if (!src || broken) {
    return (
      <div className="teacher-card__fallback" aria-hidden="true">
        {getInitials(prenom, nom)}
      </div>
    );
  }
  return (
    <img
      className="teacher-card__photo"
      src={src}
      alt={label}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}

function Teacher() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const data = await getPublicTeachers();
        if (data && data.length > 0) {
          // Map DB fields to what the component expects
          setTeachers(data.map(t => ({
            prenom: t.firstName,
            nom: t.lastName,
            email: t.email,
            grade: t.grade,
            filiere: t.filiere,
            photoPath: t.uploads?.studentPhoto
          })));
        } else {
          // Fallback to static data if DB is empty
          setTeachers(teachersIssatData);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setTeachers(teachersIssatData);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  const allTeachers = useMemo(() => {
    return teachers;
  }, [teachers]);

  const departments = useMemo(() => {
    const s = new Set(allTeachers.map((t) => t.filiere).filter(Boolean));
    return [...s].sort((a, b) => a.localeCompare(b, "fr"));
  }, [allTeachers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTeachers.filter((t) => {
      if (dept && t.filiere !== dept) return false;
      if (!q) return true;
      const hay = `${t.prenom} ${t.nom} ${t.email} ${t.grade} ${t.filiere}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, dept, allTeachers]);

  return (
    <div className="dashboard page-pad">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">Institut</p>
          <h1 className="dashboard__title">Annuaire des enseignants</h1>
          <p className="dashboard__subtitle">
            Recherche par nom, e-mail, grade ou département. Photo affichée lorsqu’elle est disponible.
          </p>
        </header>

        <div className="teacher-toolbar">
          <label className="teacher-toolbar__search">
            <Search size={18} aria-hidden />
            <input
              type="search"
              className="teacher-toolbar__input"
              placeholder="Rechercher par nom, e-mail, grade ou département…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <select
            className="teacher-toolbar__select"
            aria-label="Filtrer par département"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">Tous les départements</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="teacher-toolbar__count">
            {filtered.length} enseignant{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="teacher-directory">
          {loading ? (
            <div className="teacher-directory__loading">
              <div className="spinner"></div>
              <p>Chargement des enseignants...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((teacher, index) => {
              const photoSrc = photoUrl(teacher.photoPath);
              return (
                <article key={`${teacher.email}-${index}`} className="teacher-card">
                  <div className="teacher-card__media">
                    <TeacherAvatar prenom={teacher.prenom} nom={teacher.nom} src={photoSrc} />
                  </div>
                  <div className="teacher-card__content">
                    <h2 className="teacher-card__name">
                      {teacher.prenom} {teacher.nom}
                    </h2>
                    {teacher.grade ? (
                      <p className="teacher-card__grade">{teacher.grade}</p>
                    ) : null}
                    <p className="teacher-card__field">
                      <strong>Département :</strong> {teacher.filiere}
                    </p>
                    {teacher.email ? (
                      <a className="teacher-card__mail" href={`mailto:${teacher.email}`}>
                        {teacher.email}
                      </a>
                    ) : (
                      <span className="teacher-card__mail teacher-card__mail--muted">E-mail non communiqué</span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="teacher-directory__empty">
              <p>Aucun enseignant ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Teacher;
