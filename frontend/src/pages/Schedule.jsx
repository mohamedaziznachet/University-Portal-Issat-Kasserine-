import React, { useEffect, useState } from "react";
import { Calendar, FileText, Download, ExternalLink, Clock } from "lucide-react";
import api, { toUploadUrl } from "../services/api";
import "../styles/dashboard.css";
import "../styles/schedule.css";

function Schedule() {
  const [emplois, setEmplois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPublicEmplois();
  }, []);

  const fetchPublicEmplois = async () => {
    try {
      setLoading(true);
      // We use the public endpoint if available, or the admin one if the user is admin
      // But for the public schedule page, we use /public/emplois
      const res = await api.get(`/public/emplois`);
      setEmplois(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching schedules", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = emplois.filter(emp => 
    emp.studyClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard page-pad schedule">
      <div className="container dashboard__inner">
        <header className="dashboard__head">
          <p className="dashboard__eyebrow">Planning & Horaires</p>
          <h1 className="dashboard__title">Emplois du Temps Officiels</h1>
          <p className="dashboard__subtitle">
            Consultez les derniers plannings de cours mis à jour pour chaque classe et semestre.
          </p>
        </header>

        <section className="panel" aria-label="Recherche et filtres">
           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-box" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Rechercher par classe (ex: GLSI-L2)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'inherit'
                  }}
                />
              </div>
              <button onClick={fetchPublicEmplois} className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} /> Rafraîchir
              </button>
           </div>
        </section>

        {loading ? (
          <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
             <p className="dashboard__subtitle">Chargement des emplois du temps...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
             <Calendar size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
             <p className="dashboard__subtitle">Aucun emploi du temps ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="schedule-grid">
            {filtered.map((emp) => (
              <article key={emp._id} className="panel schedule-card" style={{ transition: 'transform 0.2s', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{emp.studyClass}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                       {emp.academicYear} — Semestre {emp.semester}
                    </p>
                  </div>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
                    <Calendar size={20} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <a 
                    href={toUploadUrl(emp.fileUrl)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn--primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                  >
                    <ExternalLink size={16} /> Voir
                  </a>
                  <a 
                    href={toUploadUrl(emp.fileUrl)} 
                    download 
                    className="btn btn--outline"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                  >
                    <Download size={16} /> PDF
                  </a>
                </div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} /> Mis à jour le {new Date(emp.updatedAt || emp.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .schedule-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
      `}} />
    </div>
  );
}

export default Schedule;
