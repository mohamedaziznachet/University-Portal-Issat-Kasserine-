import React, { useState, useEffect } from "react";
import { Calendar, Upload, FileText, Trash2, Edit3, X } from "lucide-react";
import api, { toUploadUrl } from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminEmplois() {
  const [emplois, setEmplois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmploi, setEditingEmploi] = useState(null);
  
  const [formData, setFormData] = useState({
    studyClass: "",
    semester: "",
    academicYear: "",
    file: null
  });

  useEffect(() => {
    fetchEmplois();
  }, []);

  const fetchEmplois = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/emplois`);
      setEmplois(res.data);
    } catch (error) {
      console.error("Error fetching emplois", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmploi(emp);
    setFormData({
      studyClass: emp.studyClass,
      semester: emp.semester,
      academicYear: emp.academicYear,
      file: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEmploi(null);
    setFormData({ studyClass: "", semester: "", academicYear: "", file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studyClass || !formData.semester || !formData.academicYear) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (!editingEmploi && !formData.file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    const data = new FormData();
    data.append("studyClass", formData.studyClass);
    data.append("semester", formData.semester);
    data.append("academicYear", formData.academicYear);
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      if (editingEmploi) {
        await api.put(`/admin/emplois/${editingEmploi._id}`, data);
        alert("Emploi du temps modifié avec succès !");
      } else {
        await api.post(`/admin/emplois`, data);
        alert("Emploi du temps ajouté avec succès !");
      }
      handleCancelEdit();
      if (document.getElementById("file-upload")) {
        document.getElementById("file-upload").value = "";
      }
      fetchEmplois();
    } catch (error) {
      console.error("Error saving emploi", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDeleteEmploi = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet emploi du temps ?")) return;
    try {
      await api.delete(`/admin/emplois/${id}`);
      fetchEmplois();
    } catch (error) {
      console.error("Error deleting emploi", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Gestion des Emplois du Temps"
      subtitle="Créer et consulter les emplois du temps des classes."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__grid-2">
          <section className="panel">
            <div className="panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="panel__title">
                <Upload size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> 
                {editingEmploi ? "Modifier l'Emploi" : "Ajouter un Emploi"}
              </h2>
              {editingEmploi && (
                <button type="button" onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <X size={20} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Classe / Groupe</label>
                <input 
                  type="text" 
                  name="studyClass"
                  placeholder="Ex: GLSI-L2-A"
                  value={formData.studyClass}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Semestre</label>
                <select 
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="">Sélectionner</option>
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Année Universitaire</label>
                <input 
                  type="text" 
                  name="academicYear"
                  placeholder="Ex: 2025/2026"
                  value={formData.academicYear}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fichier (PDF ou Image)</label>
                <input 
                  type="file" 
                  name="file"
                  id="file-upload"
                  onChange={handleChange}
                  accept=".pdf,image/*"
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                {editingEmploi ? "Mettre à jour" : "Créer l'Emploi"}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title"><Calendar size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Liste des Emplois</h2>
            </div>
            <div className="table-wrap">
              {loading ? (
                <p>Chargement...</p>
              ) : emplois.length === 0 ? (
                <p>Aucun emploi du temps trouvé.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Classe</th>
                      <th>Semestre</th>
                      <th>Année</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emplois.map(emp => (
                      <tr key={emp._id}>
                        <td data-label="Classe">{emp.studyClass}</td>
                        <td data-label="Semestre">{emp.semester}</td>
                        <td data-label="Année">{emp.academicYear}</td>
                        <td data-label="Action">
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <a href={toUploadUrl(emp.fileUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                              <FileText size={16} /> Voir
                            </a>
                            <button onClick={() => handleEditClick(emp)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Edit3 size={16} /> Éditer
                            </button>
                            <button onClick={() => handleDeleteEmploi(emp._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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

export default AdminEmplois;
