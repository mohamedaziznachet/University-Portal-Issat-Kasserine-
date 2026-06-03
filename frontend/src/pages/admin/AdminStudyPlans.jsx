import React, { useState, useEffect } from "react";
import { BookOpen, Upload, FileText, Trash2, Edit3, X } from "lucide-react";
import api, { toUploadUrl } from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

const licenseOptions = [
  { id: "eea", label: "Licence Nationale en Electronique, Electrotechnique et Automatique (LNEEA)" },
  { id: "isi", label: "Ingénierie des Systèmes Informatiques (LN ISI)" },
  { id: "tic", label: "Technologies de l'Information et de la Communication (LN TIC)" },
  { id: "lngm", label: "Génie Mécanique - Parcours Productique (LNGM)" },
];

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminStudyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    licenseId: "",
    title: "",
    file: null
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/study-plans`);
      setPlans(res.data);
    } catch (error) {
      console.error("Error fetching study plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      let title = formData.title;
      if (e.target.name === "licenseId") {
        const option = licenseOptions.find(opt => opt.id === e.target.value);
        if (option) title = option.label;
      }
      setFormData({ ...formData, [e.target.name]: e.target.value, ...(e.target.name === "licenseId" && { title }) });
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      licenseId: plan.licenseId,
      title: plan.title,
      file: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setFormData({ licenseId: "", title: "", file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.licenseId || !formData.title) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (!editingPlan && !formData.file) {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    const data = new FormData();
    data.append("licenseId", formData.licenseId);
    data.append("title", formData.title);
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      if (editingPlan) {
        await api.put(`/admin/study-plans/${editingPlan._id}`, data);
        alert("Plan d'étude modifié avec succès !");
      } else {
        await api.post(`/admin/study-plans`, data);
        alert("Plan d'étude ajouté avec succès !");
      }
      handleCancelEdit();
      if (document.getElementById("plan-file-upload")) {
        document.getElementById("plan-file-upload").value = "";
      }
      fetchPlans();
    } catch (error) {
      console.error("Error saving study plan", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce plan d'étude ?")) return;
    try {
      await api.delete(`/admin/study-plans/${id}`);
      fetchPlans();
    } catch (error) {
      console.error("Error deleting study plan", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Gestion des Plans d'Étude"
      subtitle="Ajouter les plans d'étude en format PDF (Sauf GLSI qui est interactif)."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__grid-2">
          <section className="panel">
            <div className="panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="panel__title">
                <Upload size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> 
                {editingPlan ? "Modifier le Plan d'Étude" : "Ajouter un Plan d'Étude"}
              </h2>
              {editingPlan && (
                <button type="button" onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <X size={20} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Parcours / Licence</label>
                <select 
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="">Sélectionner</option>
                  {licenseOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Titre (Auto-rempli)</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Titre du plan"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fichier PDF</label>
                <input 
                  type="file" 
                  name="file"
                  id="plan-file-upload"
                  accept=".pdf"
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                {editingPlan ? "Mettre à jour" : "Publier le PDF"}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title"><BookOpen size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Plans Publiés</h2>
            </div>
            <div className="table-wrap">
              {loading ? (
                <p>Chargement...</p>
              ) : plans.length === 0 ? (
                <p>Aucun plan d'étude PDF publié.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parcours</th>
                      <th>Fichier</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map(plan => (
                      <tr key={plan._id}>
                        <td data-label="Parcours">{plan.title}</td>
                        <td data-label="Fichier">
                          <a href={toUploadUrl(plan.fileUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                            <FileText size={16} /> Voir PDF
                          </a>
                        </td>
                        <td data-label="Action">
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleEditClick(plan)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Edit3 size={16} /> Éditer
                            </button>
                            <button onClick={() => handleDeletePlan(plan._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Trash2 size={16} /> Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default AdminStudyPlans;
