import { NavLink } from "react-router-dom";
import "../styles/portal.css";

function RoleDashboardLayout({ roleLabel, title, subtitle, links = [], children }) {
  return (
    <div className="portal page-pad">
      <div className="container portal__grid">
        <aside className="portal__sidebar">
          <p className="portal__role">{roleLabel}</p>
          <h2 className="portal__brand">ISSAT Portal</h2>
          <nav className="portal__nav">
            {links.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => 
                  `portal__nav-link ${isActive ? 'portal__nav-link--active' : ''}`
                }
                end={item.to === "/espace/admin"}
              >
                {item.icon && <item.icon size={18} />}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="portal__content">
          <header className="dashboard__head">
            <h1 className="dashboard__title">{title}</h1>
            <p className="dashboard__subtitle">{subtitle}</p>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}

export default RoleDashboardLayout;
