import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoleGuard from "./components/RoleGuard";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import Schedule from "./pages/Schedule";
import Results from "./pages/Results";
import Downloads from "./pages/Downloads";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudyPlanPage from "./pages/StudyPlanPage";
import StudentCourses from "./pages/StudentCourses";
import InfoPage from "./pages/InfoPage";
import RoleHome from "./pages/RoleHome";
import TeacherPortal from "./pages/TeacherPortal";
import TeacherClassroom from "./pages/teacher/TeacherClassroom";
import TeacherAssignmentsPage from "./pages/teacher/TeacherAssignmentsPage";
import TeacherSubmissionsPage from "./pages/teacher/TeacherSubmissionsPage";
import TeacherAbsencesPage from "./pages/teacher/TeacherAbsencesPage";
import TeacherMessages from "./pages/teacher/TeacherMessages";
import AdminPortal from "./pages/AdminPortal";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEmplois from "./pages/admin/AdminEmplois";
import AdminNews from "./pages/admin/AdminNews";
import AdminStudyPlans from "./pages/admin/AdminStudyPlans";
import AdminPasswordRequests from "./pages/admin/AdminPasswordRequests";
import AdminPendingUsers from "./pages/admin/AdminPendingUsers";
import AdminMessages from "./pages/admin/AdminMessages";

function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/etudiants"
            element={
              <RoleGuard allow={["student"]}>
                <Student />
              </RoleGuard>
            }
          />
          <Route
            path="/etudiants/mes-cours"
            element={
              <RoleGuard allow={["student"]}>
                <StudentCourses />
              </RoleGuard>
            }
          />
          <Route
            path="/etudiants/mes-cours/:courseId"
            element={
              <RoleGuard allow={["student"]}>
                <StudentCourses />
              </RoleGuard>
            }
          />
          <Route path="/enseignants" element={<Teacher />} />
          <Route path="/emploi-du-temps" element={<Schedule />} />
          <Route path="/resultats" element={<Results />} />
          <Route path="/telechargements" element={<Downloads />} />
          <Route path="/support" element={<Support />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Signup />} />
          <Route path="/espace" element={<RoleHome />} />
          <Route
            path="/espace/enseignant/messages"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherMessages />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/etudiant"
            element={
              <RoleGuard allow={["student"]}>
                <Student />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/enseignant"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherPortal />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/enseignant/classroom"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherClassroom />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/enseignant/devoirs"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherAssignmentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/enseignant/soumissions"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherSubmissionsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/enseignant/absences"
            element={
              <RoleGuard allow={["teacher"]}>
                <TeacherAbsencesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminPortal />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/utilisateurs"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminUsers />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/inscriptions"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminPendingUsers />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/demandes-reset"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminPasswordRequests />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/messages"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminMessages />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/emplois"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminEmplois />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/actualites"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminNews />
              </RoleGuard>
            }
          />
          <Route
            path="/espace/admin/plans-etude"
            element={
              <RoleGuard allow={["admin"]}>
                <AdminStudyPlans />
              </RoleGuard>
            }
          />
          <Route path="/formations/licence/:licenseId" element={<StudyPlanPage />} />
          <Route path="/pages/:pageKey" element={<InfoPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
