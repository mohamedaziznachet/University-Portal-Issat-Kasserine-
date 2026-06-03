import { Link } from "react-router-dom";
import { Megaphone, Calendar, ArrowRight, Tag } from "lucide-react";

function Announcement({ items }) {
  const isRecent = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    return diff < 7 * 24 * 60 * 60 * 1000; // 1 week
  };

  return (
    <aside className="announcement" aria-labelledby="announcement-heading">
      <div className="announcement__head">
        <span className="announcement__icon" aria-hidden="true">
          <Megaphone size={22} />
        </span>
        <h2 id="announcement-heading" className="announcement__title">
          Annonces & Avis
        </h2>
      </div>
      <div className="announcement__body">
        <ul className="announcement__list">
          {items.map((item, i) => (
            <li key={i} className="announcement__item">
              <Link to={`/pages/${item.slug || "info"}`} className="announcement__link">
                <div className="announcement__meta">
                  <span className="announcement__date">
                    <Calendar size={12} />
                    {new Date(item.createdAt || item.publishDate).toLocaleDateString()}
                  </span>
                  {isRecent(item.createdAt || item.publishDate) && (
                    <span className="announcement__badge">Nouveau</span>
                  )}
                </div>
                <h3 className="announcement__item-title">{item.title}</h3>
                <div className="announcement__type">
                   <Tag size={12} />
                   {item.type === 'tender' ? "Appel d'offre" : item.type === 'agenda' ? "Agenda" : "Avis"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/actualites" className="announcement__all">
          Voir toutes les annonces <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

export default Announcement;
