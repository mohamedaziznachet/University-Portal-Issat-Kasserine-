import React, { useState, useEffect } from "react";
import { Search, UserCircle, Users } from "lucide-react";
import api from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users`, {
        params: { role: roleFilter, search }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir changer le statut vers "${newStatus}" ?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      alert("Erreur lors de l'entrée du statut");
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("Réinitialiser le mot de passe de cet utilisateur ?")) return;
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      alert(`Mot de passe réinitialisé. Nouveau mot de passe: ${res.data.newPassword}`);
    } catch (error) {
      alert("Erreur lors de la réinitialisation");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Gestion des utilisateurs"
      subtitle="Consulter et gérer les accès des étudiants, enseignants et administrateurs."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title"><Users size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Liste des Utilisateurs</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'var(--color-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <Search size={18} color="var(--color-text-light)" />
              <input 
                type="text" 
                placeholder="Rechercher (Nom, Email, CIN)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem' }}
              />
            </div>
            
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
            >
              <option value="all">Tous les rôles</option>
              <option value="student">Étudiants</option>
              <option value="teacher">Enseignants</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>

          <div className="table-wrap">
            {loading ? (
              <p>Chargement...</p>
            ) : users.length === 0 ? (
              <p>Aucun utilisateur trouvé.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom complet</th>
                    <th>Rôle</th>
                    <th>Status</th>
                    <th>Email / CIN</th>
                    <th>Classe</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td data-label="Nom complet">
                        <div style={{ fontWeight: '500' }}>{user.firstName} {user.lastName}</div>
                      </td>
                      <td data-label="Rôle">
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem',
                          background: user.role === 'admin' ? '#fee2e2' : user.role === 'teacher' ? '#e0e7ff' : '#dcfce7',
                          color: user.role === 'admin' ? '#991b1b' : user.role === 'teacher' ? '#3730a3' : '#166534'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem',
                          background: user.status === 'pending' ? '#fef3c7' : user.status === 'blocked' ? '#f3f4f6' : '#dcfce7',
                          color: user.status === 'pending' ? '#92400e' : user.status === 'blocked' ? '#1f2937' : '#166534'
                        }}>
                          {user.status === 'pending' ? 'En attente' : user.status === 'blocked' ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td data-label="Email / CIN">
                        <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>CIN: {user.cin || '-'}</div>
                      </td>
                      <td data-label="Classe">{user.studyClass || '-'}</td>
                      <td data-label="Actions" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {user.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(user._id, 'active')}
                              style={{ padding: '0.4rem 0.8rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Approuver
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button 
                              onClick={() => handleUpdateStatus(user._id, 'blocked')}
                              style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Bloquer
                            </button>
                          )}
                          {user.status === 'blocked' && (
                            <button 
                              onClick={() => handleUpdateStatus(user._id, 'active')}
                              style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Débloquer
                            </button>
                          )}
                          <button 
                            onClick={() => handleResetPassword(user._id)}
                            style={{ padding: '0.4rem 0.8rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Reset PWD
                          </button>
                        </div>
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

export default AdminUsers;
