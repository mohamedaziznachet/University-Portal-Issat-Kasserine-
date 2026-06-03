import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { toUploadUrl } from "../services/api";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import NewsCard from "../components/NewsCard";
import Announcement from "../components/Announcement";
import {
  GraduationCap,
  UserSquare2,
  CalendarClock,
  Award,
  FileText,
  Download,
  LifeBuoy,
} from "lucide-react";

import "../styles/home.css";
import "../styles/cards.css";

const fallbackAnnouncements = [
  "Inscription aux réinscriptions dès le 20 septembre",
  "Nouvelle procédure de demande de stage",
  "Date limite de dépôt des mémoires le 10 juin",
];

function Home() {
  const location = useLocation();
  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (location.hash === "#actualites") {
      document.getElementById("actualites")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  useEffect(() => {
    api.get("/public/posts")
      .then(res => {
        const all = res.data || [];
        const n = all.filter(p => p.type === 'news' || p.type === 'scientific_event').slice(0, 4);
        const a = all.filter(p => p.type === 'notice' || p.type === 'tender' || p.type === 'agenda').slice(0, 8);
        
        if (n.length > 0) setNews(n);
        else setNews([{ title: "Journée Portes Ouvertes 2024", publishDate: "2024-04-15", slug: "jpo-2024" }]);
        
        if (a.length > 0) setAnnouncements(a);
        else setAnnouncements([
          { title: "Inscription aux réinscriptions dès le 20 septembre", createdAt: new Date() },
          { title: "Nouvelle procédure de demande de stage", createdAt: new Date() },
          { title: "Date limite de dépôt des mémoires le 10 juin", createdAt: new Date() },
        ]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-home">
      <Hero />

      <section className="section section--features">
        <div className="container">
          <header className="section__head">
            <h2 className="section__title">Accès rapides</h2>
            <p className="section__lead">
              Tout ce dont vous avez besoin pour suivre vos études et votre enseignement.
            </p>
          </header>
          <div className="feature-grid">
            <FeatureCard
              icon={GraduationCap}
              title="Espace Étudiant"
              description="Consultez vos cours, notes et emploi du temps."
              to="/etudiants"
            />
            <FeatureCard
              icon={UserSquare2}
              title="Espace Enseignant"
              description="Gérez vos classes et saisissez les notes."
              to="/enseignants"
            />
            <FeatureCard
              icon={CalendarClock}
              title="Emploi du Temps"
              description="Consultez votre planning des cours."
              to="/emploi-du-temps"
            />
            <FeatureCard
              icon={Award}
              title="Résultats & Notes"
              description="Accédez à vos résultats et relevés de notes."
              to="/resultats"
            />
          </div>
        </div>
      </section>

      <section className="section section--split" id="actualites">
        <div className="container container--split">
          <div>
            <header className="section__head section__head--left">
              <h2 className="section__title">Actualités</h2>
              <p className="section__lead">Restez informé des événements importants du campus.</p>
            </header>
            <div className="news-grid">
              {news.map((item, idx) => (
                <NewsCard
                  key={idx}
                  title={item.title}
                  date={new Date(item.publishDate).toLocaleDateString()}
                  image={item.attachments && item.attachments[0] ? toUploadUrl(item.attachments[0].filePath) : null}
                  buttonLabel="Lire plus"
                  to={`/pages/${item.slug || "info"}`}
                />
              ))}
            </div>
          </div>
          <Announcement items={announcements} />
        </div>
      </section>

      <section className="section section--services">
        <div className="container">
          <header className="section__head">
            <h2 className="section__title">Services en ligne</h2>
            <p className="section__lead">Des outils simples pour gagner du temps au quotidien.</p>
          </header>
          <div className="service-grid">
            <Link to="/resultats" className="service-card">
              <span className="service-card__icon">
                <FileText size={24} />
              </span>
              <h3 className="service-card__title">Notes en Ligne</h3>
              <p className="service-card__desc">Consultez vos notes et résultats.</p>
            </Link>
            <Link to="/telechargements" className="service-card">
              <span className="service-card__icon">
                <Download size={24} />
              </span>
              <h3 className="service-card__title">Téléchargements</h3>
              <p className="service-card__desc">Téléchargez vos documents.</p>
            </Link>
            <Link to="/support" className="service-card">
              <span className="service-card__icon">
                <LifeBuoy size={24} />
              </span>
              <h3 className="service-card__title">Aide &amp; Support</h3>
              <p className="service-card__desc">Contactez le support.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
