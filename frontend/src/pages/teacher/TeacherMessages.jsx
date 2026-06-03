import React, { useState, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import RoleDashboardLayout from "../../components/RoleDashboardLayout";
import "../../styles/dashboard.css";
import { getTeacherMessages, sendMessageToStudents, getCourseStudents, getTeacherCourses } from "../../services/api";
import { TEACHER_SPACE_LINKS } from "../../constants/teacherNav";

function TeacherMessages() {
  const [messages, setMessages] = useState({ box: "inbox", items: [], pagination: { page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  
  const [messageForm, setMessageForm] = useState({ receiverId: "", subject: "", content: "" });

  useEffect(() => {
    fetchMessages(messages.box);
    getTeacherCourses().then(setCourses).catch(console.error);
  }, []);

  const fetchMessages = async (box) => {
    try {
      setLoading(true);
      const res = await getTeacherMessages({ box, page: 1, limit: 10 });
      setMessages(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoxChange = (box) => {
    fetchMessages(box);
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setMessageForm({ ...messageForm, receiverId: "" });
    if (courseId) {
      try {
        const data = await getCourseStudents(courseId);
        setStudents(data);
      } catch (err) {
        console.error(err);
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!messageForm.receiverId || !messageForm.content) return;
    
    try {
      await sendMessageToStudents({
        receiverId: messageForm.receiverId,
        subject: messageForm.subject,
        content: messageForm.content
      });
      setMessageForm({ ...messageForm, receiverId: "", subject: "", content: "" });
      alert("Message envoyé !");
      if (messages.box === "sent") fetchMessages("sent");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    }
  };

  return (
    <RoleDashboardLayout
      roleLabel="Espace enseignant"
      title="Messagerie"
      subtitle="Communiquez avec vos étudiants."
      links={[...TEACHER_SPACE_LINKS, { to: "/espace/enseignant/messages", label: "Messages" }]}
    >
      <div className="dashboard dashboard__inner">
        <div className="dashboard__grid-2">
          <section className="panel">
            <div className="panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="panel__title">
                <MessageSquare size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> 
                Boîte de réception
              </h2>
              <div className="student-switch">
                <button
                  type="button"
                  className={messages.box === "inbox" ? "student-switch__active" : ""}
                  onClick={() => handleBoxChange("inbox")}
                >
                  Reçus
                </button>
                <button
                  type="button"
                  className={messages.box === "sent" ? "student-switch__active" : ""}
                  onClick={() => handleBoxChange("sent")}
                >
                  Envoyés
                </button>
              </div>
            </div>
            
            {loading ? (
              <p className="dashboard__subtitle">Chargement...</p>
            ) : messages.items?.length ? (
              <ul className="student-list">
                {messages.items.map((item) => (
                  <li key={item._id} className="student-list__item">
                    <div>
                      <strong>{item.subject || "Sans objet"}</strong>
                      <span>{item.content}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ display: 'block' }}>
                        {messages.box === "inbox" 
                          ? `De: ${item.sender?.firstName} ${item.sender?.lastName}`
                          : `À: ${item.receiver?.firstName} ${item.receiver?.lastName}`
                        }
                      </small>
                      <small style={{ color: 'var(--color-text-light)' }}>
                        {new Date(item.createdAt).toLocaleString("fr-FR")}
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard__subtitle">Aucun message.</p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title panel__title--solo">Nouveau message</h2>
            <form className="form form--tight" onSubmit={sendMessageHandler}>
              <label className="form__label">
                Filtrer par cours (optionnel)
                <select className="form__input" value={selectedCourseId} onChange={handleCourseChange}>
                  <option value="">Tous vos étudiants (via cours)</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </label>

              <label className="form__label">
                Étudiant (Destinataire)
                <select
                  className="form__input"
                  value={messageForm.receiverId}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, receiverId: e.target.value }))}
                  required
                >
                  <option value="">Choisir un étudiant</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.cin})
                    </option>
                  ))}
                </select>
              </label>

              <label className="form__label">
                Sujet
                <input
                  className="form__input"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </label>
              
              <label className="form__label">
                Message
                <textarea
                  className="form__input form__textarea"
                  value={messageForm.content}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, content: e.target.value }))}
                  required
                  rows="4"
                />
              </label>
              <button className="btn btn--primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <Send size={16} /> Envoyer
              </button>
            </form>
          </section>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}

export default TeacherMessages;
