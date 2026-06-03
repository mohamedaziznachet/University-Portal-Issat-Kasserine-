import React, { useState, useEffect } from "react";
import { Key, CheckCircle, Clock } from "lucide-react";
import api from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminPasswordRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/password-reset-requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching reset requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (requestId) => {
    if (!window.confirm("Réinitialiser le mot de passe pour cet étudiant ?")) return;
    try {
      const res = await api.post(`/admin/password-reset-requests/${requestId}/resolve`);
      alert(`Mot de passe réinitialisé. Nouveau mot de passe: ${res.data.newPassword}`);
      fetchRequests();
    } catch (error) {
      alert("Erreur lors de la résolution de la demande");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Demandes de réinitialisation"
      subtitle="Gérer les demandes de mot de passe oubliés des étudiants."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title"><Key size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Demandes en attente</h2>
          </div>

          <div className="table-wrap">
            {loading ? (
              <p>Chargement...</p>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />
                <p>Aucune demande de réinitialisation en attente.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>CIN fourni</th>
                    <th>Email fourni</th>
                    <th>Date demande</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req._id}>
                      <td data-label="Étudiant">
                        <div style={{ fontWeight: '500' }}>
                          {req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Utilisateur inconnu'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                          CIN système: {req.user?.cin || '-'}
                        </div>
                      </td>
                      <td data-label="CIN fourni">{req.cin}</td>
                      <td data-label="Email fourni">{req.email}</td>
                      <td data-label="Date demande">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <Clock size={14} />
                          {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td data-label="Actions" style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleResolve(req._id)}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            background: 'var(--color-primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: 'var(--radius-sm)', 
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Réinitialiser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default AdminPasswordRequests;
