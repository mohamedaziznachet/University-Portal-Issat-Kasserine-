import React, { useState, useEffect } from "react";
import { MessageSquare, Clock, User, Mail, Phone, Tag, Check, Trash2 } from "lucide-react";
import api from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/contact-messages");
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching contact messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (msgId, status) => {
    try {
      await api.patch(`/admin/contact-messages/${msgId}`, { status });
      fetchMessages();
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Messages et demandes"
      subtitle="Gérer les messages reçus via le formulaire de contact du site."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title"><MessageSquare size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Boîte de réception</h2>
          </div>

          <div className="messages-grid">
            {loading ? (
              <p>Chargement...</p>
            ) : messages.length === 0 ? (
              <p>Aucun message reçu.</p>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`message-card ${msg.status === 'read' ? 'message-card--read' : ''}`}>
                  <div className="message-card__header">
                    <div className="message-card__user">
                      <User size={18} />
                      <strong>{msg.fullName}</strong>
                    </div>
                    <div className="message-card__date">
                      <Clock size={14} />
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="message-card__meta">
                    <span><Mail size={14} /> {msg.email}</span>
                    {msg.phone && <span><Phone size={14} /> {msg.phone}</span>}
                    {msg.subject && <span><Tag size={14} /> {msg.subject}</span>}
                  </div>

                  <div className="message-card__content">
                    {msg.message}
                  </div>

                  <div className="message-card__actions">
                    {msg.status !== 'read' ? (
                      <button onClick={() => handleUpdateStatus(msg._id, 'read')} className="btn btn--link">
                        <Check size={16} /> Marquer comme lu
                      </button>
                    ) : (
                      <span className="status-badge status-badge--read">Lu</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default AdminMessages;
