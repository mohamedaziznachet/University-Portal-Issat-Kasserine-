import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Clock3,
  Download,
  FileUp,
  Languages,
  Moon,
  Save,
  Search,
  Send,
  Sun,
  Activity,
  ClipboardList,
  FileText,
  UserX,
  Calendar,
  MessageSquare,
  FolderOpen,
  User,
  Settings
} from "lucide-react";
import RoleDashboardLayout from "../components/RoleDashboardLayout";
import "../styles/dashboard.css";
import {
  API_BASE_URL,
  downloadStudentGradeReport,
  getStudentAssignments,
  getStudentCourses,
  getStudentDashboard,
  getStudentDocuments,
  getStudentGrades,
  getStudentMessages,
  getStudentNotifications,
  getOwnStudentProfile,
  getStudentSchedule,
  getStudentSubmissions,
  getStudentAbsences,
  markStudentNotificationRead,
  toUploadUrl,
  sendStudentMessage,
  submitStudentAssignment,
  updateStudentProfile,
} from "../services/api";
import { connectStudentSocket, disconnectSocket } from "../services/socket";
import { getStoredUser } from "../utils/auth";

const tabItems = [
  { id: "overview", label: "Aperçu", icon: Activity },
  { id: "courses", label: "Mes cours", icon: BookOpen },
  { id: "assignments", label: "Devoirs", icon: ClipboardList },
  { id: "grades", label: "Notes", icon: FileText },
  { id: "absences", label: "Absences", icon: UserX },
  { id: "schedule", label: "Emploi du temps", icon: Calendar },
  { id: "messages", label: "Messagerie", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "profile", label: "Mon Profil", icon: User },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const CourseDetails = lazy(() => import("./student/CourseDetails"));


function Student() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");

  const [dashboard, setDashboard] = useState({
    profile: null,
    stats: { enrolledCourses: 0, averageGrade: null, pendingAssignments: 0 },
    recentActivity: [],
    notifications: [],
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState({ items: [], pagination: { page: 1, totalPages: 1 } });
  const [submissionsData, setSubmissionsData] = useState({ items: [], pagination: { page: 1, totalPages: 1 } });
  const [gradesData, setGradesData] = useState({ items: [], courses: [], overallAverage: null });
  const [absences, setAbsences] = useState([]);
  const [schedule, setSchedule] = useState({ slots: [] });
  const [messages, setMessages] = useState({ box: "inbox", items: [], pagination: { page: 1, totalPages: 1 } });
  const [documents, setDocuments] = useState({ official: [], materials: [] });
  const [profile, setProfile] = useState(null);

  const [courseQuery, setCourseQuery] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [messageForm, setMessageForm] = useState({ receiverId: "", subject: "", content: "" });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    postalAddress: "",
    filiere: "",
    studentPhoto: null,
  });

  useEffect(() => {
    document.body.classList.toggle("student-dark", darkMode);
    return () => document.body.classList.remove("student-dark");
  }, [darkMode]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        getStudentDashboard(),
        getStudentCourses(),
        getStudentAssignments({ page: 1, limit: 10 }),
        getStudentSubmissions({ page: 1, limit: 10 }),
        getStudentGrades(),
        getStudentSchedule(),
        getStudentMessages({ box: "inbox", page: 1, limit: 10 }),
        getStudentDocuments(),
        getOwnStudentProfile(),
        getStudentNotifications(),
        getStudentAbsences(),
      ]);

      const [dashboardRes, coursesRes, assignmentsRes, submissionsRes, gradesRes, scheduleRes, messagesRes, docsRes, profileRes, notificationsRes, absencesRes] =
        results.map((item) => (item.status === "fulfilled" ? item.value : null));

      if (dashboardRes) setDashboard((prev) => ({ ...prev, ...dashboardRes }));
      if (coursesRes) setCourses(coursesRes);
      if (assignmentsRes) setAssignmentsData(assignmentsRes);
      if (submissionsRes) setSubmissionsData(submissionsRes);
      if (gradesRes) setGradesData(gradesRes);
      if (scheduleRes) setSchedule(scheduleRes);
      if (messagesRes) setMessages(messagesRes);
      if (docsRes) setDocuments(docsRes);
      if (absencesRes) setAbsences(absencesRes);
      if (notificationsRes) {
        setDashboard((prev) => ({ ...prev, notifications: notificationsRes }));
      }
      if (profileRes) {
        setProfile(profileRes);
        setProfileForm({
          firstName: profileRes.firstName || "",
          lastName: profileRes.lastName || "",
          email: profileRes.email || "",
          phone: profileRes.phone || "",
          postalAddress: profileRes.postalAddress || "",
          filiere: profileRes.filiere || "",
          studentPhoto: null,
        });
      }

      const failedCount = results.filter((item) => item.status === "rejected").length;
      if (failedCount > 0) {
        setError("Certaines sections n'ont pas pu être chargées. Réessayez.");
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const [notificationsRes, messagesRes] = await Promise.all([
          getStudentNotifications(),
          getStudentMessages({ box: messages.box, page: 1, limit: 10 }),
        ]);
        setDashboard((prev) => ({ ...prev, notifications: notificationsRes }));
        setMessages(messagesRes);
      } catch (err) {
        // keep silent for background polling
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [messages.box]);

  useEffect(() => {
    const user = getStoredUser();
    const socket = connectStudentSocket(user?.id);
    if (!socket) return undefined;

    const onNotification = (notification) => {
      setDashboard((prev) => ({
        ...prev,
        notifications: [notification, ...(prev.notifications || [])].slice(0, 50),
      }));
    };

    const onMessage = () => {
      getStudentMessages({ box: messages.box, page: 1, limit: 10 }).then(setMessages).catch(() => null);
    };

    socket.on("notification:new", onNotification);
    socket.on("message:new", onMessage);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("message:new", onMessage);
      disconnectSocket();
    };
  }, [messages.box]);

  const filteredCourses = useMemo(() => {
    const query = courseQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) =>
      [course.title, course.filiere, `${course.teacher?.firstName || ""} ${course.teacher?.lastName || ""}`]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [courseQuery, courses]);

  const teacherOptions = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      if (course.teacher?._id) {
        map.set(course.teacher._id, {
          id: course.teacher._id,
          label: `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.trim(),
        });
      }
    });
    return Array.from(map.values());
  }, [courses]);

  async function submitAssignmentHandler(event) {
    event.preventDefault();
    if (!selectedAssignmentId || !submissionFile) return;
    const formData = new FormData();
    formData.append("assignmentId", selectedAssignmentId);
    formData.append("notes", submissionNotes);
    formData.append("submissionFile", submissionFile);
    await submitStudentAssignment(formData);
    setSubmissionFile(null);
    setSubmissionNotes("");
    const [assignmentsRes, submissionsRes] = await Promise.all([
      getStudentAssignments({ page: 1, limit: 10 }),
      getStudentSubmissions({ page: 1, limit: 10 }),
    ]);
    setAssignmentsData(assignmentsRes);
    setSubmissionsData(submissionsRes);
  }

  async function sendMessageHandler(event) {
    event.preventDefault();
    await sendStudentMessage(messageForm);
    setMessageForm({ receiverId: "", subject: "", content: "" });
    setMessages(await getStudentMessages({ box: "sent", page: 1, limit: 10 }));
  }

  async function saveProfileHandler(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("firstName", profileForm.firstName);
    formData.append("lastName", profileForm.lastName);
    formData.append("email", profileForm.email);
    formData.append("phone", profileForm.phone);
    formData.append("postalAddress", profileForm.postalAddress);
    formData.append("filiere", profileForm.filiere);
    if (profileForm.studentPhoto) formData.append("studentPhoto", profileForm.studentPhoto);
    const updated = await updateStudentProfile(formData);
    setProfile(updated.student);
  }

  async function markRead(notificationId) {
    await markStudentNotificationRead(notificationId);
    setDashboard((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item._id === notificationId ? { ...item, isRead: true } : item
      ),
    }));
  }

  async function downloadReport() {
    const blob = await downloadStudentGradeReport();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grade-report.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const currentNow = new Date();

  return (
    <RoleDashboardLayout
      roleLabel="Espace Étudiant"
      title={activeTab === "overview" ? "Tableau de bord" : tabItems.find(t => t.id === activeTab)?.label}
      subtitle={`Bienvenue dans votre espace personnel, ${getStoredUser()?.firstName || "étudiant"}.`}
      links={tabItems.map(item => ({
        to: "#",
        label: item.label,
        icon: item.icon,
        onClick: (e) => {
           e.preventDefault();
           setActiveTab(item.id);
        },
        isActive: activeTab === item.id
      }))}
    >
      <div className="dashboard dashboard__inner">
        {loading ? <p className="dashboard__subtitle">Chargement de l'espace étudiant...</p> : null}
        {error ? <p className="dashboard__subtitle" style={{ color: "#b91c1c" }}>{error}</p> : null}

        <div className="student-tabs">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`student-tabs__item ${activeTab === tab.id ? "student-tabs__item--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {getStoredUser()?.status === "pending" && (
          <div className="panel" style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem', padding: '1rem' }}>
            <p style={{ color: '#92400e', fontWeight: '600', margin: 0 }}>
              ⚠️ Votre compte est en attente de validation par l'administration.
            </p>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Certaines fonctionnalités (comme l'inscription aux cours ou les documents officiels) peuvent être restreintes jusqu'à l'approbation de votre dossier.
            </p>
          </div>
        )}

        {activeTab === "overview" && (
          <>
            <section className="panel student-hero">
              <div className="student-hero__identity">
                {dashboard.profile?.studentPhoto ? (
                  <img
                    src={toUploadUrl(dashboard.profile.studentPhoto)}
                    alt="Profil étudiant"
                    className="student-hero__avatar"
                  />
                ) : (
                  <div className="student-hero__avatar student-hero__avatar--fallback">
                    {(dashboard.profile?.firstName || "E").charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="panel__title">Bienvenue {dashboard.profile?.firstName || "Étudiant"}</h2>
                  <p className="dashboard__subtitle">Votre espace personnel est synchronisé.</p>
                </div>
              </div>
              <div className="student-hero__actions">
                <button className="student-chip" type="button" onClick={() => setDarkMode((prev) => !prev)}>
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                  {darkMode ? "Light" : "Dark"}
                </button>
                <button className="student-chip" type="button" onClick={() => setActiveTab("settings")}>
                  <Languages size={14} /> {language.toUpperCase()}
                </button>
              </div>
            </section>

            <div className="dash-cards">
              <article className="dash-card dash-card--static">
                <span className="dash-card__icon"><BookOpen size={20} /></span>
                <h3 className="dash-card__title">Cours inscrits</h3>
                <p className="dash-card__desc">{dashboard.stats.enrolledCourses || 0} unités</p>
              </article>
              <article className="dash-card dash-card--static">
                <span className="dash-card__icon"><Clock3 size={20} /></span>
                <h3 className="dash-card__title">Moyenne actuelle</h3>
                <p className="dash-card__desc">
                  {dashboard.stats.averageGrade !== null ? `${dashboard.stats.averageGrade}/20` : "Pas encore noté"}
                </p>
              </article>
              <article className="dash-card dash-card--static">
                <span className="dash-card__icon"><FileUp size={20} /></span>
                <h3 className="dash-card__title">Devoirs en attente</h3>
                <p className="dash-card__desc">{dashboard.stats.pendingAssignments || 0} devoir(s)</p>
              </article>
              <article className="dash-card dash-card--static">
                <span className="dash-card__icon"><Bell size={20} /></span>
                <h3 className="dash-card__title">Notifications</h3>
                <p className="dash-card__desc">{dashboard.notifications.length} nouvelles</p>
              </article>
            </div>

            <div className="dashboard__grid-2">
              <section className="panel">
                <div className="panel__head">
                  <h2 className="panel__title">Activité récente</h2>
                </div>
                {dashboard.recentActivity.length ? (
                  <ul className="student-list">
                    {dashboard.recentActivity.map((item, index) => (
                      <li key={`${item.type}-${index}`} className="student-list__item">
                        <strong>{item.title}</strong>
                        <span>{new Date(item.date).toLocaleString("fr-FR")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard__subtitle">Aucune activité pour le moment.</p>
                )}
              </section>

              <section className="panel">
                <div className="panel__head">
                  <h2 className="panel__title">Notifications (temps réel)</h2>
                </div>
                {dashboard.notifications.length ? (
                  <ul className="student-list">
                    {dashboard.notifications.map((item) => (
                      <li key={item._id} className="student-list__item">
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.message}</span>
                        </div>
                        {!item.isRead ? (
                          <button className="panel__link" onClick={() => markRead(item._id)} type="button">
                            Marquer lu
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard__subtitle">Aucune notification.</p>
                )}
              </section>
            </div>
          </>
        )}

        {activeTab === "courses" && (
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Mes matières</h2>
              <label className="student-search">
                <Search size={15} />
                <input
                  type="text"
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  placeholder="Rechercher un cours..."
                />
              </label>
            </div>
            {filteredCourses.length ? (
              <div className="student-courses">
                {filteredCourses.map((course) => (
                  <button
                    key={course._id}
                    type="button"
                    className={`student-course-card ${selectedCourse?._id === course._id ? "student-course-card--active" : ""}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <h3>{course.title}</h3>
                    <p>{course.filiere || "Filière non spécifiée"}</p>
                    <small>
                      Progression: {course.progress}% ({course.assignmentsSubmitted}/{course.assignmentsTotal})
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="dashboard__subtitle">Aucun cours inscrit.</p>
            )}
            {selectedCourse ? (
              <Suspense fallback={<p className="dashboard__subtitle">Chargement détails cours...</p>}>
                <CourseDetails course={selectedCourse} />
              </Suspense>
            ) : null}
          </section>
        )}

        {activeTab === "assignments" && (
          <div className="dashboard__grid-2">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Devoirs par matière</h2>
                <span className="dashboard__subtitle">Page {assignmentsData.pagination?.page || 1}</span>
              </div>
              {assignmentsData.items?.length ? (
                <ul className="student-list">
                  {assignmentsData.items.map((item) => {
                    const due = item.dueDate ? new Date(item.dueDate) : null;
                    const countdown =
                      due && due > currentNow
                        ? `${Math.ceil((due.getTime() - currentNow.getTime()) / (1000 * 60 * 60 * 24))}j restants`
                        : "Échéance passée";
                    return (
                      <li key={item._id} className="student-list__item">
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.course?.title} - {countdown}</span>
                        </div>
                        <span className={`student-status student-status--${item.status}`}>{item.status}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="dashboard__subtitle">Aucun devoir trouvé.</p>
              )}
            </section>

            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Soumettre un devoir</h2>
              </div>
              <form className="form form--tight" onSubmit={submitAssignmentHandler}>
                <label className="form__label">
                  Devoir
                  <select
                    className="form__input"
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    required
                  >
                    <option value="">Choisir un devoir</option>
                    {(assignmentsData.items || []).map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title} - {item.course?.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form__label">
                  Fichier (PDF, DOC, ZIP)
                  <input
                    className="form__input"
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                <label className="form__label">
                  Notes
                  <textarea
                    className="form__input form__textarea"
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                  />
                </label>
                <button className="dash-card__action" type="submit">
                  <FileUp size={14} /> Envoyer
                </button>
              </form>
            </section>

            <section className="panel" style={{ gridColumn: "1 / -1" }}>
              <div className="panel__head">
                <h2 className="panel__title">Historique des soumissions</h2>
              </div>
              {submissionsData.items?.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Devoir</th>
                        <th>Cours</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsData.items.map((item) => (
                        <tr key={item._id}>
                          <td data-label="Devoir">{item.assignment?.title || "-"}</td>
                          <td data-label="Cours">{item.assignment?.course?.title || "-"}</td>
                          <td data-label="Date">{new Date(item.submittedAt).toLocaleString("fr-FR")}</td>
                          <td data-label="Statut">{item.status}</td>
                          <td data-label="Note">
                            {item.mark !== undefined && item.mark !== null ? `${item.mark}/20` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dashboard__subtitle">Aucune soumission.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="dashboard__grid-2">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Notes par matière</h2>
                <button type="button" className="panel__link" onClick={downloadReport}>
                  <Download size={14} /> PDF
                </button>
              </div>
              {gradesData.items?.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Devoir</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData.items.map((item) => (
                        <tr key={item._id}>
                          <td data-label="Matière">{item.assignment?.course?.title || "-"}</td>
                          <td data-label="Devoir">{item.assignment?.title || "-"}</td>
                          <td data-label="Note">{item.mark}/20</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dashboard__subtitle">Aucune note publiée.</p>
              )}
            </section>

            <section className="panel">
              <h2 className="panel__title panel__title--solo">Performance (GPA style)</h2>
              <div className="student-bars">
                {(gradesData.courses || []).map((course) => (
                  <div key={course.course} className="student-bars__row">
                    <span>{course.course}</span>
                    <div className="student-bars__track">
                      <div
                        className="student-bars__fill"
                        style={{ width: `${Math.min(100, (course.average / 20) * 100)}%` }}
                      />
                    </div>
                    <strong>{course.average}/20</strong>
                  </div>
                ))}
              </div>
              <p className="dashboard__subtitle">
                Moyenne générale:{" "}
                <strong>{gradesData.overallAverage !== null ? `${gradesData.overallAverage}/20` : "N/A"}</strong>
              </p>
            </section>
          </div>
        )}

        {activeTab === "absences" && (
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Suivi des absences</h2>
            </div>
            {absences.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date de la séance</th>
                      <th>Classe / Groupe</th>
                      <th>Enseignant</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((abs) => (
                      <tr key={abs._id}>
                        <td data-label="Date">{new Date(abs.sessionDate).toLocaleDateString("fr-FR")}</td>
                        <td data-label="Classe">{abs.studyClass}</td>
                        <td data-label="Enseignant">{abs.teacher?.firstName} {abs.teacher?.lastName}</td>
                        <td data-label="Type">
                          <span className="student-status student-status--late" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            Absent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="dashboard__subtitle">Excellente nouvelle ! Vous n'avez aucune absence enregistrée.</p>
            )}
            <div className="panel" style={{ marginTop: '1.5rem', background: '#fef2f2' }}>
              <p className="dashboard__subtitle" style={{ color: '#991b1b', fontSize: '0.85rem' }}>
                <strong>Note importante :</strong> Conformément au règlement, au-delà de 3 absences non justifiées par semestre, l'étudiant peut être exclu de la matière concernée.
              </p>
            </div>
          </section>
        )}

        {activeTab === "schedule" && (
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Emploi du temps hebdomadaire</h2>
            </div>
            <div className="table-wrap">
              <table className="data-table data-table--schedule">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Lundi</th>
                    <th>Mardi</th>
                    <th>Mercredi</th>
                    <th>Jeudi</th>
                    <th>Vendredi</th>
                  </tr>
                </thead>
                <tbody>
                  {(schedule.slots || []).map((slot) => (
                    <tr key={slot.time}>
                      <th className="data-table__time">{slot.time}</th>
                      <td data-day="Lun">{slot.monday}</td>
                      <td data-day="Mar">{slot.tuesday}</td>
                      <td data-day="Mer">{slot.wednesday}</td>
                      <td data-day="Jeu">{slot.thursday}</td>
                      <td data-day="Ven">{slot.friday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "messages" && (
          <div className="dashboard__grid-2">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Inbox / Sent</h2>
                <div className="student-switch">
                  <button
                    type="button"
                    className={messages.box === "inbox" ? "student-switch__active" : ""}
                    onClick={async () => setMessages(await getStudentMessages({ box: "inbox", page: 1, limit: 10 }))}
                  >
                    Inbox
                  </button>
                  <button
                    type="button"
                    className={messages.box === "sent" ? "student-switch__active" : ""}
                    onClick={async () => setMessages(await getStudentMessages({ box: "sent", page: 1, limit: 10 }))}
                  >
                    Sent
                  </button>
                </div>
              </div>
              {messages.items?.length ? (
                <ul className="student-list">
                  {messages.items.map((item) => (
                    <li key={item._id} className="student-list__item">
                      <div>
                        <strong>{item.subject || "Sans objet"}</strong>
                        <span>{item.content}</span>
                      </div>
                      <small>{new Date(item.createdAt).toLocaleString("fr-FR")}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard__subtitle">Aucun message.</p>
              )}
            </section>

            <section className="panel">
              <h2 className="panel__title panel__title--solo">Nouveau message enseignant</h2>
              <form className="form form--tight" onSubmit={sendMessageHandler}>
                <label className="form__label">
                  Teacher ID
                  <select
                    className="form__input"
                    value={messageForm.receiverId}
                    onChange={(e) => setMessageForm((prev) => ({ ...prev, receiverId: e.target.value }))}
                    required
                  >
                    <option value="">Choisir un enseignant</option>
                    {teacherOptions.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.label}
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
                  />
                </label>
                <button className="dash-card__action" type="submit">
                  <Send size={14} /> Envoyer
                </button>
              </form>
            </section>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="dashboard__grid-2">
            <section className="panel">
              <h2 className="panel__title panel__title--solo">Documents officiels</h2>
              {(documents.official || []).length ? (
                <ul className="download-list">
                  {documents.official.map((doc) => (
                    <li key={doc.type} className="download-item">
                      <div className="download-item__info">
                        <span className="download-item__name">{doc.type}</span>
                        <span className="download-item__meta">{doc.path ? "Disponible" : "Indisponible"}</span>
                      </div>
                      {doc.path ? (
                        <a
                          className="download-item__btn"
                          href={toUploadUrl(doc.path)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download size={16} />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard__subtitle">Aucun document officiel.</p>
              )}
            </section>

            <section className="panel">
              <h2 className="panel__title panel__title--solo">Supports de cours</h2>
              {(documents.materials || []).length ? (
                <ul className="download-list">
                  {documents.materials.map((doc, index) => (
                    <li key={`${doc.path}-${index}`} className="download-item">
                      <div className="download-item__info">
                        <span className="download-item__name">{doc.name}</span>
                        <span className="download-item__meta">{doc.course}</span>
                      </div>
                      <a
                        className="download-item__btn"
                        href={toUploadUrl(doc.path)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard__subtitle">Aucun support disponible.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "profile" && (
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Gestion du profil</h2>
            </div>
            <form className="auth-grid auth-grid--3" onSubmit={saveProfileHandler}>
              <label className="form__label">
                Prénom
                <input
                  className="form__input"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </label>
              <label className="form__label">
                Nom
                <input
                  className="form__input"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </label>
              <label className="form__label">
                Email
                <input
                  type="email"
                  className="form__input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </label>
              <label className="form__label">
                Téléphone
                <input
                  className="form__input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label className="form__label auth-grid-span-2">
                Adresse
                <input
                  className="form__input"
                  value={profileForm.postalAddress}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, postalAddress: e.target.value }))}
                />
              </label>
              <label className="form__label">
                Filière
                <input
                  className="form__input"
                  value={profileForm.filiere}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, filiere: e.target.value }))}
                />
              </label>
              <label className="form__label">
                Photo profil
                <input
                  type="file"
                  className="form__input"
                  accept="image/*"
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, studentPhoto: e.target.files?.[0] || null }))}
                />
              </label>
              <button className="dash-card__action auth-grid-span-2" type="submit">
                <Save size={14} /> Enregistrer profil
              </button>
            </form>

            {profile?.uploads ? (
              <div className="dashboard__grid-2" style={{ marginTop: "1rem" }}>
                <div className="panel panel--flush">
                  <div className="panel__head">
                    <h3 className="panel__title">Documents soumis (lecture seule)</h3>
                  </div>
                  <ul className="download-list" style={{ padding: "1rem" }}>
                    {Object.entries(profile.uploads).map(([key, value]) => (
                      <li key={key} className="download-item">
                        <div className="download-item__info">
                          <span className="download-item__name">{key}</span>
                          <span className="download-item__meta">{value ? "Disponible" : "Non fourni"}</span>
                        </div>
                        {value ? (
                          <a
                            className="download-item__btn"
                            href={toUploadUrl(value)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download size={16} />
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {activeTab === "settings" && (
          <section className="panel">
            <h2 className="panel__title panel__title--solo">Paramètres</h2>
            <div className="student-settings">
              <button type="button" className="student-chip" onClick={() => setDarkMode((prev) => !prev)}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />} Thème {darkMode ? "clair" : "sombre"}
              </button>
              <label className="form__label" style={{ maxWidth: 240 }}>
                Langue
                <select
                  className="form__input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </label>
              <p className="dashboard__subtitle">
                Changement mot de passe: disponible via l’espace sécurité backend (étape suivante).
              </p>
            </div>
          </section>
        )}
      </div>
    </RoleDashboardLayout>
  );
}

export default Student;
