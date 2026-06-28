import { Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Labs from "./pages/Labs";
import LabCategoryPage from "./pages/LabCategoryPage";
import LabWorkPage from "./pages/LabWorkPage";
import ProblemManagement from "./pages/admin/ProblemManagement";
import Profile from "./pages/Profile";
import StudentProblemPage from "./pages/StudentProblemPage";
import StudentNotebookPage from "./pages/StudentNotebookPage";
import Resources from "./pages/Resources";
import Timeline from "./pages/Timeline";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import TopicManagement from "./pages/admin/TopicManagement";
import LabManagement from "./pages/admin/LabManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import AuditLogViewer from "./pages/admin/AuditLogViewer";
import ResourceManagement from "./pages/admin/ResourceManagement";
import SubmissionsReview from "./pages/admin/SubmissionsReview";
import JupyterNotebookManagement from "./pages/admin/JupyterNotebookManagement";
import AdminTimeline from "./pages/admin/AdminTimeline";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const immersiveLab = pathname.startsWith("/labs/work");

  return (
    <div
      className={`min-h-screen bg-[#262e33] text-white ${
        immersiveLab ? "" : "pt-16"
      }`}
    >
      <ScrollToTop />
      {!immersiveLab && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/category/:slug" element={<LabCategoryPage />} />
        <Route path="/labs/work/:slug" element={<LabWorkPage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/timeline" element={<Timeline />} />
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route
          path="/student/problem/:assignmentId"
          element={<StudentProblemPage />}
        />
        <Route
          path="/student/notebook/:assignmentId"
          element={<StudentNotebookPage />}
        />

        {/* Admin Routes */}
        <Route path="/admin/problems" element={<ProblemManagement />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/topics" element={<TopicManagement />} />
        <Route path="/admin/lab-management" element={<LabManagement />} />
        <Route path="/admin/enrollments" element={<EnrollmentManagement />} />
        <Route path="/admin/audit" element={<AuditLogViewer />} />
        <Route path="/admin/resources" element={<ResourceManagement />} />
        <Route path="/admin/submissions" element={<SubmissionsReview />} />
        <Route
          path="/admin/jupyter-notebooks"
          element={<JupyterNotebookManagement />}
        />
        <Route path="/admin/timeline" element={<AdminTimeline />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
