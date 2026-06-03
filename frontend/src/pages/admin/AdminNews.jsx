import React, { useState, useEffect } from "react";
import { Megaphone, Newspaper, Edit3, X, Trash2 } from "lucide-react";
import api, { API_BASE_URL, toUploadUrl } from "../../services/api";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";

import { ADMIN_LINKS } from "../../constants/adminLinks";

function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  
  const [formData, setFormData] = useState({
    type: "news",
    title: "",
    slug: "",
    summary: "",
    content: "",
    isPublished: true,
    file: null
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      let slug = formData.slug;
      if (name === "title" && !formData.slug && !editingPost) {
        slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      setFormData({ ...formData, [name]: value, ...(name === 'title' && {slug}) });
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setFormData({
      type: post.type,
      title: post.title,
      slug: post.slug,
      summary: post.summary || "",
      content: post.content || "",
      isPublished: post.isPublished !== false,
      file: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setFormData({ type: "news", title: "", slug: "", summary: "", content: "", isPublished: true, file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.type) {
      alert("Titre et Slug sont requis.");
      return;
    }

    const data = new FormData();
    data.append("type", formData.type);
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("summary", formData.summary);
    data.append("content", formData.content);
    data.append("isPublished", formData.isPublished);
    if (formData.file) {
      data.append("attachments", formData.file);
    }

    try {
      if (editingPost) {
        await api.put(`/admin/posts/${editingPost._id}`, data);
        alert("Publication modifiée avec succès !");
      } else {
        await api.post(`/admin/posts`, data);
        alert("Publication ajoutée avec succès !");
      }
      handleCancelEdit();
      if (document.getElementById("post-file-upload")) {
        document.getElementById("post-file-upload").value = "";
      }
      fetchPosts();
    } catch (error) {
      console.error("Error saving post", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette publication ?")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Administration"
      title="Actualités & Annonces"
      subtitle="Publier et modifier les actualités et événements pour le portail."
      links={ADMIN_LINKS}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__grid-2">
          <section className="panel">
            <div className="panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="panel__title">
                <Edit3 size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> 
                {editingPost ? "Modifier la Publication" : "Créer une Publication"}
              </h2>
              {editingPost && (
                <button type="button" onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <X size={20} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Type de publication</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="news">Actualité (News)</option>
                  <option value="notice">Annonce (Avis)</option>
                  <option value="scientific_event">Événement Scientifique</option>
                  <option value="agenda">Agenda</option>
                  <option value="tender">Appel d'offre</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Titre</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Titre de la publication"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Slug (URL)</label>
                <input 
                  type="text" 
                  name="slug"
                  placeholder="mon-titre-url"
                  value={formData.slug}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Résumé (Optionnel)</label>
                <textarea 
                  name="summary"
                  rows="2"
                  value={formData.summary}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contenu (Optionnel)</label>
                <textarea 
                  name="content"
                  rows="4"
                  value={formData.content}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Image / Pièce jointe</label>
                <input 
                  type="file" 
                  name="file"
                  id="post-file-upload"
                  onChange={handleChange}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                {editingPost && editingPost.attachments && editingPost.attachments[0] && (
                  <div style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.75rem', margin: '0 0 0.5rem' }}>Image actuelle :</p>
                    <img 
                      src={toUploadUrl(editingPost.attachments[0].filePath)} 
                      alt="Current" 
                      style={{ maxHeight: '100px', borderRadius: '4px' }} 
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                  Rendre cette publication publique immédiatement
                </label>
              </div>

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                {editingPost ? "Mettre à jour" : "Publier"}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title"><Newspaper size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Dernières Publications</h2>
            </div>
            <div className="table-wrap">
              {loading ? (
                <p>Chargement...</p>
              ) : posts.length === 0 ? (
                <p>Aucune publication trouvée.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Aperçu</th>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post._id}>
                        <td data-label="Aperçu">
                          {post.attachments && post.attachments[0] ? (
                            <img 
                              src={toUploadUrl(post.attachments[0].filePath)} 
                              alt="Post" 
                              style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                          ) : (
                            <div style={{ width: '50px', height: '40px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>N/A</div>
                          )}
                        </td>
                        <td data-label="Titre">{post.title}</td>
                        <td data-label="Type">
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.8rem',
                            background: post.type === 'news' ? '#e0e7ff' : '#fef08a',
                            color: post.type === 'news' ? '#3730a3' : '#854d0e'
                          }}>
                            {post.type}
                          </span>
                        </td>
                        <td data-label="Date">{new Date(post.publishDate).toLocaleDateString()}</td>
                        <td data-label="Statut">
                          <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            background: post.isPublished ? '#dcfce7' : '#fee2e2',
                            color: post.isPublished ? '#166534' : '#991b1b'
                          }}>
                            {post.isPublished ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td data-label="Action">
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => handleEditClick(post)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Edit3 size={16} /> Éditer
                            </button>
                            <button onClick={() => handleDeletePost(post._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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

export default AdminNews;
