import React, { useState, useEffect } from "react";
import { UserCheck, Eye, Check, X, FileText } from "lucide-react";
import api, { API_BASE_URL, toUploadUrl } from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminPendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", { params: { status: "pending" } });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching pending users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm("Approuver cette inscription ?")) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: "active" });
      alert("Inscription approuvée !");
      fetchPending();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error) {
      alert("Erreur lors de l'approbation");
    }
  };

  const handleBlock = async (userId) => {
    if (!window.confirm("Rejeter/Bloquer cet utilisateur ?")) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: "blocked" });
      alert("Utilisateur bloqué.");
      fetchPending();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error) {
      alert("Erreur lors de l'opération");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Validation des inscriptions"
      subtitle="Examinez les dossiers et validez les nouveaux comptes étudiants/enseignants."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__grid-2" style={{ gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr' }}>
          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title"><UserCheck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Demandes en attente</h2>
            </div>

            <div className="table-wrap">
              {loading ? (
                <p>Chargement...</p>
              ) : users.length === 0 ? (
                <p>Aucune demande d'inscription en attente.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th>Rôle</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className={selectedUser?._id === u._id ? 'table-row--active' : ''}>
                        <td>{u.firstName} {u.lastName}</td>
                        <td>{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => setSelectedUser(u)} className="btn btn--link">
                            <Eye size={16} /> Voir Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selectedUser && (
            <div className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Dossier de {selectedUser.firstName}</h2>
                <button onClick={() => setSelectedUser(null)} className="btn btn--link"><X size={18} /></button>
              </div>

              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="info-grid">
                  <div className="info-item"><strong>CIN:</strong> {selectedUser.cin}</div>
                  <div className="info-item"><strong>Email:</strong> {selectedUser.email}</div>
                  <div className="info-item"><strong>Sexe:</strong> {selectedUser.gender}</div>
                  <div className="info-item"><strong>Bac:</strong> {selectedUser.bacNature} ({selectedUser.bacGrade}/20)</div>
                  {selectedUser.glsiScore && (
                    <div className="info-item" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      <strong>Score GLSI:</strong> {selectedUser.glsiScore}/20
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Pièces jointes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {selectedUser.uploads?.cinFront && (
                    <div className="file-preview">
                      <p>CIN Recto</p>
                      <img src={toUploadUrl(selectedUser.uploads.cinFront)} alt="CIN Front" style={{ width: '100%', borderRadius: '4px' }} />
                    </div>
                  )}
                  {selectedUser.uploads?.cinBack && (
                    <div className="file-preview">
                      <p>CIN Verso</p>
                      <img src={toUploadUrl(selectedUser.uploads.cinBack)} alt="CIN Back" style={{ width: '100%', borderRadius: '4px' }} />
                    </div>
                  )}
                  {selectedUser.uploads?.bacDiploma && (
                    <div className="file-preview">
                      <p>Diplôme Bac</p>
                      <a href={toUploadUrl(selectedUser.uploads.bacDiploma)} target="_blank" rel="noreferrer" className="btn btn--link"><FileText size={14} /> Voir le document</a>
                    </div>
                  )}
                  {selectedUser.uploads?.bacTranscript && (
                    <div className="file-preview">
                      <p>Relevé de notes</p>
                      <a href={toUploadUrl(selectedUser.uploads.bacTranscript)} target="_blank" rel="noreferrer" className="btn btn--link"><FileText size={14} /> Voir le document</a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => handleApprove(selectedUser._id)}
                    style={{ flex: 1, padding: '0.8rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Check size={18} /> Accepter l'inscription
                  </button>
                  <button
                    onClick={() => handleBlock(selectedUser._id)}
                    style={{ flex: 1, padding: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <X size={18} /> Rejeter / Bloquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default AdminPendingUsers;
