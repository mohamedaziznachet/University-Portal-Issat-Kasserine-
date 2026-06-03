import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../styles/home.css";

function Hero() {
  const imageSrc = `${process.env.PUBLIC_URL}/images/hero-faculte.jpg`;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__bg-img"
          src={imageSrc}
          alt=""
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__badge">Portail officiel de la faculté ISSAT KASSERINE</p>
          <h1 id="hero-title" className="hero__title">
            Bienvenue sur le Portail Universitaire
          </h1>
          <p className="hero__subtitle">Gérez facilement votre vie académique</p>
          <div className="hero__cta">
            <Link to="/etudiants" className="btn btn--primary hero__btn">
              Espace étudiant
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/enseignants" className="btn btn--outline-on-dark hero__btn">
              Espace enseignant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
