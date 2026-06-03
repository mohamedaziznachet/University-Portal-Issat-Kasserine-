import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import "../styles/cards.css";

function NewsCard({ title, date, buttonLabel, to, href, image }) {
  const content = (
    <>
      {image && (
        <div className="news-card__media">
          <img src={image} alt={title} className="news-card__img" />
        </div>
      )}
      <div className="news-card__content">
        <div className="news-card__meta">
          <CalendarDays size={16} aria-hidden="true" />
          <time dateTime={date}>{date}</time>
        </div>
        <h3 className="news-card__title">{title}</h3>
        <span className="news-card__btn">{buttonLabel}</span>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="news-card">
        {content}
      </Link>
    );
  }

  return (
    <a href={href || "#"} className="news-card">
      {content}
    </a>
  );
}

export default NewsCard;
