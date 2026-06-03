import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { clearAuth, getStoredUser, isAuthenticated } from "../utils/auth";
import "../styles/navbar.css";

const brandLogoSrc = `${process.env.PUBLIC_URL}/images/logo-universite.png`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [user, setUser] = useState(getStoredUser());
  const navigate = useNavigate();

  const menuSections = [
    {
      title: "Nouveautés",
      groups: [
        {
          title: "Actualités",
          items: [
            { label: "Manifestations scientifiques", to: "/pages/scientificEvents" },
            { label: "Manifestations professionnelles", to: "/pages/professionalEvents" },
            { label: "Agenda des évènements", to: "/pages/eventsAgenda" },
            { label: "Appel d'offres et consultations", to: "/pages/tenders" },
          ],
        },
      ],
    },
    {
      title: "Institut",
      groups: [
        {
          title: "Présentation",
          items: [
            { label: "Loi de création", to: "/pages/creationLaw" },
            { label: "Organigramme", to: "/pages/orgChart" },
            { label: "Conseil scientifique", to: "/pages/scientificCouncil" },
            { label: "Galerie des photos", to: "/pages/photosGallery" },
            { label: "En chiffres", to: "/pages/inNumbers" },
          ],
        },
      ],
    },
    {
      title: "Formation - Stages et PFE",
      groups: [
        {
          title: "Licence Nationale",
          items: [
            { label: "Electronique, Electrotechnique et Automatique - Plan d'étude", to: "/formations/licence/eea" },
            { label: "Sciences de l'Informatique (LN GLSI) - Plan d'étude", to: "/formations/licence/glsi" },
            { label: "Ingénierie des systèmes informatiques (LN ISI) - Plan d'étude", to: "/formations/licence/isi" },
            { label: "Technologies de l'Information et de la communication (LN TIC) - Plan d'étude", to: "/formations/licence/tic" },
            { label: "Génie mécanique (LNGM) - Plan d'étude", to: "/formations/licence/lngm" },
          ],
        },
        {
          title: "Mastère",
          items: [
            { label: "Mastère Pro en Système Electrique et Energie Renouvelable (SEER)", to: "/pages/seerMaster" },
            { label: "Mastère recherche en nanomatériaux et systèmes embarqués", to: "/pages/nanoMaster" },
            { label: "Mastère Pro en génie mécanique - Matériaux d'Ingénierie", to: "/pages/gmMaster" },
          ],
        },
      ],
    },
  ];

  const closeMenu = () => {
    setOpen(false);
    setActiveSection(null);
  };

  const handleLogout = () => {
    closeMenu();
    clearAuth();
    setAuthed(false);
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const onStorage = () => {
      setAuthed(isAuthenticated());
      setUser(getStoredUser());
    };
    window.addEventListener("storage", onStorage);
    onStorage();
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <img
            className="navbar__brand-img"
            src={brandLogoSrc}
            alt="Université — Portail Facultaire"
            width={400}
            height={100}
            decoding="async"
          />
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        <div className={`navbar__menu ${open ? "navbar__menu--open" : ""}`}>
          <nav className="navbar__nav" aria-label="Navigation principale">
            <ul className="navbar__links">
              <li>
                <NavLink to="/" end className="navbar__link" onClick={closeMenu}>
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink to="/etudiants" className="navbar__link" onClick={closeMenu}>
                  Étudiants
                </NavLink>
              </li>
              <li>
                <NavLink to="/enseignants" className="navbar__link" onClick={closeMenu}>
                  Enseignants
                </NavLink>
              </li>
              <li>
                <Link to="/#actualites" className="navbar__link" onClick={closeMenu}>
                  Actualités
                </Link>
              </li>
              {menuSections.map((section) => (
                <li
                  key={section.title}
                  className={`navbar__dropdown ${activeSection === section.title ? "navbar__dropdown--open" : ""}`}
                  onMouseEnter={() => setActiveSection(section.title)}
                  onMouseLeave={() => setActiveSection((prev) => (prev === section.title ? null : prev))}
                >
                  <button
                    type="button"
                    className="navbar__link navbar__link--button"
                    onClick={() =>
                      setActiveSection((prev) => (prev === section.title ? null : section.title))
                    }
                  >
                    {section.title}
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>

                  <div className="navbar__dropdown-menu">
                    {section.groups.map((group) => (
                      <div key={group.title} className="navbar__dropdown-group">
                        <p className="navbar__dropdown-title">{group.title}</p>
                        <ul className="navbar__dropdown-list">
                          {group.items.map((item) => (
                            <li key={item.label}>
                              <Link to={item.to} className="navbar__dropdown-link" onClick={closeMenu}>
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar__actions">
            {!authed ? (
              <>
                <Link to="/connexion" className="btn btn--outline btn--sm" onClick={closeMenu}>
                  <UserCircle size={18} aria-hidden="true" />
                  Connexion
                </Link>
                <Link to="/inscription" className="btn btn--primary btn--sm" onClick={closeMenu}>
                  Inscription
                </Link>
              </>
            ) : (
              <>
                <Link to="/espace" className="btn btn--outline btn--sm" onClick={closeMenu}>
                  <UserCircle size={18} aria-hidden="true" />
                  {user?.role === "admin"
                    ? "Espace Admin"
                    : user?.role === "teacher"
                    ? "Espace Enseignant"
                    : "Espace Étudiant"}
                </Link>
                <button type="button" className="btn btn--primary btn--sm" onClick={handleLogout}>
                  <LogOut size={18} aria-hidden="true" />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
