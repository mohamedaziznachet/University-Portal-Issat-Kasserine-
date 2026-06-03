import React from "react";
import { Link } from "react-router-dom";
import "../styles/cards.css";

function FeatureCard({ icon: Icon, title, description, to, href }) {
  const className = "feature-card";

  const inner = (
    <>
      {Icon && (
        <span className="feature-card__icon" aria-hidden="true">
          <Icon size={26} strokeWidth={2} />
        </span>
      )}
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
      <span className="feature-card__link">En savoir plus</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href || "#"} className={className}>
      {inner}
    </a>
  );
}

export default FeatureCard;
