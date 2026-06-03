import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Image, MessageSquare, ArrowRight, Users, Activity, Key, UserCheck } from "lucide-react";
import RoleDashboardLayout from "../components/RoleDashboardLayout";
import "../styles/dashboard.css";
import { getAdminStats } from "../services/api";

import { ADMIN_LINKS } from "../constants/adminLinks";

function AdminPortal() {
  const [stats, setStats] = useState({ users: [], moderationQueue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching admin stats:", err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Interface admin"
      subtitle="Pilotez le contenu du site, les utilisateurs et la modération de manière centralisée."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="dash-card__icon" style={{ marginBottom: 0, background: '#e0e7ff', color: '#4338ca' }}><Users size={20} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Utilisateurs</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stats.users.reduce((acc, r) => acc + r.total, 0)}</p>
            </div>
          </div>
          <div className="panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="dash-card__icon" style={{ marginBottom: 0, background: '#fef3c7', color: '#b45309' }}><UserCheck size={20} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>En attente</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stats.pendingCounts?.inscriptions || 0}</p>
            </div>
          </div>
          <div className="panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="dash-card__icon" style={{ marginBottom: 0, background: '#dcfce7', color: '#15803d' }}><Activity size={20} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Activités</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stats.moderationQueue.length}</p>
            </div>
          </div>
          <div className="panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="dash-card__icon" style={{ marginBottom: 0, background: '#e0f2fe', color: '#0369a1' }}><MessageSquare size={20} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Messages</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stats.pendingCounts?.messages || 0}</p>
            </div>
          </div>
        </div>

        <div className="dash-cards dash-cards--admin">
          <Link to="/espace/admin/utilisateurs" className="dash-card">
            <span className="dash-card__icon">
              <Users size={22} />
            </span>
            <h2 className="dash-card__title">Utilisateurs</h2>
            <p className="dash-card__desc">Gérer les étudiants et enseignants.</p>
            <span className="dash-card__action">Ouvrir <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/inscriptions" className="dash-card">
            <span className="dash-card__icon">
              <UserCheck size={22} />
              {stats.pendingCounts?.inscriptions > 0 && (
                <span className="dash-card__badge">{stats.pendingCounts.inscriptions}</span>
              )}
            </span>
            <h2 className="dash-card__title">Inscriptions</h2>
            <p className="dash-card__desc">Valider les nouveaux dossiers.</p>
            <span className="dash-card__action">Examiner <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/actualites" className="dash-card">
            <span className="dash-card__icon">
              <ShieldCheck size={22} />
            </span>
            <h2 className="dash-card__title">Actualités & Annonces</h2>
            <p className="dash-card__desc">Publier les informations officielles.</p>
            <span className="dash-card__action">Gérer <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/emplois" className="dash-card">
            <span className="dash-card__icon">
              <Image size={22} />
            </span>
            <h2 className="dash-card__title">Emplois du temps</h2>
            <p className="dash-card__desc">Ajouter et consulter les emplois.</p>
            <span className="dash-card__action">Modifier <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/plans-etude" className="dash-card">
            <span className="dash-card__icon">
              <FileText size={22} />
            </span>
            <h2 className="dash-card__title">Plans d'étude</h2>
            <p className="dash-card__desc">Mettre à jour les parcours (PDF).</p>
            <span className="dash-card__action">Ouvrir <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/demandes-reset" className="dash-card">
            <span className="dash-card__icon">
              <Key size={22} />
              {stats.pendingCounts?.resets > 0 && (
                <span className="dash-card__badge">{stats.pendingCounts.resets}</span>
              )}
            </span>
            <h2 className="dash-card__title">Demandes Reset</h2>
            <p className="dash-card__desc">Gérer les demandes de mot de passe oublié.</p>
            <span className="dash-card__action">Voir <ArrowRight size={16} /></span>
          </Link>
          <Link to="/espace/admin/messages" className="dash-card">
            <span className="dash-card__icon">
              <MessageSquare size={22} />
            </span>
            <h2 className="dash-card__title">Messages visiteurs</h2>
            <p className="dash-card__desc">Traiter les demandes reçues depuis le site.</p>
            <span className="dash-card__action">Consulter <ArrowRight size={16} /></span>
          </Link>
        </div>

        <div className="dashboard__grid-2">
          <section className="panel" aria-labelledby="users-heading">
            <div className="panel__head">
              <h2 id="users-heading" className="panel__title">
                Utilisateurs et accès
              </h2>
              <Link to="/espace/admin/utilisateurs" className="panel__link">
                Gérer utilisateurs
              </Link>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Profil</th>
                    <th>Total</th>
                    <th>Actifs</th>
                    <th>En attente</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4">Chargement...</td></tr>
                  ) : (
                    stats.users.map((row) => (
                      <tr key={row.role}>
                        <td data-label="Profil">{row.role}</td>
                        <td data-label="Total">{row.total}</td>
                        <td data-label="Actifs">{row.active}</td>
                        <td data-label="En attente">
                          <span style={{ color: row.pending > 0 ? '#b45309' : 'inherit', fontWeight: row.pending > 0 ? '600' : 'normal' }}>
                            {row.pending || 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel" aria-labelledby="moderation-heading">
            <div className="panel__head">
              <h2 id="moderation-heading" className="panel__title">
                <Activity size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Activité Récente (Publications)
              </h2>
              <Link to="/espace/admin/actualites" className="panel__link">
                Gérer actualités
              </Link>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Élément</th>
                    <th>Type</th>
                    <th>Auteur</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4">Chargement...</td></tr>
                  ) : stats.moderationQueue.length === 0 ? (
                    <tr><td colSpan="4">Aucune publication récente.</td></tr>
                  ) : (
                    stats.moderationQueue.map((row, idx) => (
                      <tr key={idx}>
                        <td data-label="Élément"><strong>{row.item}</strong></td>
                        <td data-label="Type">{row.type}</td>
                        <td data-label="Auteur">{row.owner}</td>
                        <td data-label="Date">{new Date(row.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default AdminPortal;
